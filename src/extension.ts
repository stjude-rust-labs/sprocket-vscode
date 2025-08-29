import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import {
  ErrorAction,
  CloseAction,
  ResponseError,
  InitializeError,
} from "vscode-languageclient";
import { getApi, FileDownloader } from "@microsoft/vscode-file-downloader-api";
import "node-fetch";
import path from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import * as tar from "tar";
import extract from "extract-zip";

const semver = require("semver");

let context: vscode.ExtensionContext | undefined;
let client: LanguageClient | undefined;
let channel: vscode.OutputChannel;
let statusBar: vscode.StatusBarItem;
let initializationError: ResponseError<InitializeError> | undefined = undefined;
let crashReports = 0;

enum Status {
  Normal,
  Working,
  Warning,
  Error,
}

function setStatus(status: Status, message: string) {
  if (!statusBar) {
    return;
  }

  statusBar.tooltip = message;

  switch (status) {
    case Status.Normal:
      statusBar.text = "Sprocket";
      statusBar.backgroundColor = undefined;
      break;

    case Status.Working:
      statusBar.text = "$(sync~spin) Sprocket";
      statusBar.backgroundColor = undefined;
      break;

    case Status.Warning:
      statusBar.text = "$(warning) Sprocket";
      statusBar.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.warningBackground",
      );
      break;

    case Status.Error:
      statusBar.text = "$(error) Sprocket";
      statusBar.backgroundColor = new vscode.ThemeColor(
        "statusBarItem.errorBackground",
      );
      break;
  }
}

export async function activate(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(configureLanguage());
  context = ctx;
  await tryActivate(ctx).catch((err) => {
    context = undefined;
    setStatus(
      Status.Error,
      `Failed to activate Sprocket extension: ${
        err.message ?? "see extension output for details"
      }`,
    );
    throw err;
  });
}

function registerCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("sprocket.showChannel", (_) => {
      channel.show();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("sprocket.restartServer", restartServer),
  );
}

async function stopServer() {
  if (!client) {
    channel.appendLine("No client to stop");
    return;
  }

  try {
    if (client.needsStop() && client.isRunning()) {
      await client.stop();
    }
  } catch (e: any) {
    channel.appendLine(`Error stopping server: ${e.message}`);
  } finally {
    await client.dispose();
    client = undefined;
  }
}

function formatDownloadUri(version: string): vscode.Uri | undefined {
  let arch: string;
  switch (process.arch) {
    case "arm64":
      arch = "aarch64";
      break;

    case "x64":
      arch = "x86_64";
      break;

    default:
      return undefined;
  }

  let platform: string;
  let extension: string;
  switch (process.platform) {
    case "darwin":
      platform = "apple-darwin";
      extension = "tar.gz";
      break;

    case "linux":
      platform = "unknown-linux-gnu";
      extension = "tar.gz";
      break;

    case "win32":
      platform = "pc-windows-msvc";
      extension = "zip";
      break;

    default:
      return undefined;
  }

  return vscode.Uri.parse(
    `https://github.com/stjude-rust-labs/sprocket/releases/download/v${version}/sprocket-v${version}-${arch}-${platform}.${extension}`,
  );
}

async function decompressPackage(packagePath: string): Promise<void> {
  channel.appendLine(`Decompressing package \`${packagePath}\``);

  if (process.platform === "win32") {
    await extract(packagePath, { dir: path.parse(packagePath).dir });
    return;
  }

  await tar.x({ f: packagePath, cwd: path.parse(packagePath).dir });
}

async function getInstalledSprocket(
  downloader: FileDownloader,
): Promise<{ path: string; version: string } | undefined> {
  let packagePath: vscode.Uri;

  try {
    packagePath = await downloader.getItem(
      "sprocket-package",
      context as vscode.ExtensionContext,
    );
  } catch (e: any) {
    return undefined;
  }

  const dir = path.parse(packagePath.fsPath).dir;
  let exePath = path.join(dir, "sprocket");
  if (process.platform === "win32") {
    exePath += ".exe";
  }

  if (!existsSync(exePath)) {
    return undefined;
  }

  const versionPath = path.join(dir, "sprocket-package.version");

  try {
    const version = readFileSync(versionPath).toString();
    return { path: exePath, version };
  } catch (e: any) {
    return undefined;
  }
}

async function getLatestVersion(): Promise<string | undefined> {
  interface Crate {
    name: string;
    max_stable_version: string;
  }

  interface Response {
    crates: Crate[];
  }

  const httpResponse = await fetch(
    "https://crates.io/api/v1/crates?q=sprocket&per_page=1",
    {
      headers: {
        "User-Agent":
          "Sprocket VSCode extension (https://github.com/stjude-rust-labs/sprocket-vscode)",
      },
    },
  );

  if (httpResponse.status < 200 || httpResponse.status >= 300) {
    channel.appendLine(
      `Failed to query crates.io: a ${httpResponse.status} was received`,
    );
    channel.appendLine(await httpResponse.text());
    setStatus(
      Status.Error,
      "Failed to query crates.io: see extension output for details",
    );
    return undefined;
  }

  const response = (await httpResponse.json()) as Response;
  const crate = response.crates.find((c) => c.name === "sprocket");
  if (!crate) {
    channel.appendLine(
      "Failed to query crates.io: could not find sprocket crate in response",
    );
    setStatus(
      Status.Error,
      "Failed to query crates.io: see extension output for details",
    );
    return undefined;
  }

  return crate.max_stable_version;
}

async function installSprocket(
  downloader: FileDownloader,
  uri: vscode.Uri,
  version: string,
): Promise<string | undefined> {
  const errorStatus =
    "Failed to install Sprocket: see extension output for details";
  setStatus(Status.Working, `Installing Sprocket ${version}`);

  let packagePath: vscode.Uri;
  try {
    packagePath = await downloader.downloadFile(
      uri,
      "sprocket-package",
      context as vscode.ExtensionContext,
    );
  } catch (e: any) {
    channel.appendLine(`Failed to download Sprocket: ${e.message}`);
    setStatus(Status.Error, errorStatus);
    return undefined;
  }

  try {
    await decompressPackage(packagePath.fsPath);
  } catch (e: any) {
    channel.appendLine(`Failed to decompress Sprocket: ${e.message}`);
    setStatus(Status.Error, errorStatus);
    return undefined;
  }

  let dir = path.parse(packagePath.fsPath).dir;
  let exePath = path.join(dir, "sprocket");
  if (process.platform === "win32") {
    exePath += ".exe";
  }

  if (!existsSync(exePath)) {
    channel.appendLine(
      "Failed to install Sprocket: sprocket executable does not exist",
    );
    setStatus(Status.Error, errorStatus);
    return undefined;
  }

  try {
    writeFileSync(path.join(dir, "sprocket-package.version"), version);
  } catch (e: any) {
    channel.appendLine("Failed to write package version file");
    setStatus(Status.Error, errorStatus);
  }

  return exePath;
}

async function getSprocketPath(
  config: vscode.WorkspaceConfiguration,
): Promise<string | undefined> {
  let configExePath = config.get<string>("path") || "";
  if (configExePath.length > 0) {
    return configExePath;
  }

  const downloader: FileDownloader = await getApi();
  const installed = await getInstalledSprocket(downloader);
  if (installed) {
    channel.appendLine(
      `Found previously installed Sprocket at \`${installed.path}\` (${installed.version})`,
    );

    if (!config.get<boolean>("checkForUpdates")) {
      return installed.path;
    }
  }

  // If we're missing sprocket or otherwise need to check for updates
  channel.appendLine("Checking for latest stable Sprocket crate version...");
  const latestVersion = await getLatestVersion();
  if (!latestVersion) {
    return installed?.path;
  }

  channel.appendLine(`Latest Sprocket release is ${latestVersion}`);

  if (installed && semver.lte(latestVersion, installed.version)) {
    channel.appendLine(
      "Skipping update as previously installed Sprocket is newest available",
    );
    return installed.path;
  }

  let uri = formatDownloadUri(latestVersion);
  if (!uri) {
    const message =
      "The current platform or architecture is not currently supported by Sprocket";
    channel.appendLine(message);
    setStatus(Status.Error, message);
    return installed?.path;
  }

  if (installed) {
    const userResponse = await vscode.window.showInformationMessage(
      `A new version of Sprocket (${latestVersion}) is available!`,
      "Download and update",
      "Ignore",
    );

    if (!userResponse || userResponse === "Ignore") {
      return installed.path;
    }
  } else {
    const userResponse = await vscode.window.showInformationMessage(
      `Sprocket needs to be installed. ${latestVersion} is the latest available.`,
      "Download and install",
    );

    if (!userResponse) {
      // Fall back to looking for `sprocket` on the PATH
      return "sprocket";
    }
  }

  channel.appendLine(`Installing Sprocket from ${uri}`);
  return (
    (await installSprocket(downloader, uri, latestVersion)) || installed?.path
  );
}

async function startServer() {
  if (!context) {
    return;
  }

  const config = vscode.workspace.getConfiguration("sprocket.server");
  const outputLevel = config.get<string>("outputLevel") || "Quiet";
  const lint = config.get<boolean>("lint") || false;

  let sprocketPath = await getSprocketPath(config);
  if (!sprocketPath) {
    return;
  }

  setStatus(Status.Working, "Starting Sprocket...");

  let clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "wdl" }],
    outputChannel: channel,
    initializationFailedHandler: (
      error: ResponseError<InitializeError> | Error | any,
    ) => {
      initializationError = error;
      setStatus(
        Status.Error,
        "Failed to initialize Spocket language-service. Please check your configuration settings and reload this window.",
      );
      return false;
    },
    errorHandler: {
      error: (error, message, count) => {
        return {
          action: ErrorAction.Shutdown,
          message: `Sprocket encountered an error: ${error}`,
          handled: false,
        };
      },
      closed: async () => {
        if (initializationError !== undefined) {
          channel.appendLine(
            "Initialization error: " + initializationError.message,
          );
          return {
            action: CloseAction.DoNotRestart,
            // This won't show an error dialog to the user,
            // allowing us to display a custom error later.
            message: "",
          };
        }

        // We will retry at least once if sprocket was initialized.
        crashReports++;
        if (crashReports <= 1) {
          setStatus(Status.Working, "Sprocket has terminated. Restarting...");
          channel.appendLine("Attempting restart...");
          try {
            await restartServer();
            channel.appendLine("Successfully restarted Sprocket");
            return {
              action: CloseAction.DoNotRestart,
              handled: true,
            };
          } catch (e: any) {
            channel.appendLine(`Restart failed: ${e.message}`);
          }
        }

        // this was not an initialization error, so we don't know what went wrong yet
        // stop attempting to restart
        setStatus(Status.Error, `Sprocket has terminated`);
        return {
          action: CloseAction.DoNotRestart,
          message: "Sprocket has terminated",
          handled: false,
        };
      },
    },
  };

  let args = ["analyzer"];
  switch (outputLevel) {
    case "Verbose":
      args.push("-vvv");
      break;

    case "Information":
      args.push("-vv");
      break;

    case "Quiet":
      args.push("-q");
      break;
  }

  if (lint) {
    args.push("--lint");
  }

  channel.appendLine(
    `Spawning \`${sprocketPath}\` with arguments \`${JSON.stringify(args)}\``,
  );

  let serverOptions: ServerOptions = {
    command: sprocketPath,
    args: args,
    transport: TransportKind.stdio,
  };
  client = new LanguageClient(
    "sprocket",
    "Sprocket",
    serverOptions,
    clientOptions,
  );

  await client.start();
  channel.appendLine(
    `Connected to Sprocket LSP server version ${client.initializeResult?.serverInfo?.version}`,
  );
  setStatus(Status.Normal, "Sprocket is running");
}

async function restartServer() {
  channel.appendLine("Restarting Sprocket server...");
  try {
    await stopServer();
    await startServer();
  } catch (e: any) {
    channel.appendLine(`Failed to restart Sprocket server: ${e.message}`);
    setStatus(Status.Error, `Failed to restart Sprocket: ${e.message}`);
    throw e;
  }
}

async function tryActivate(context: vscode.ExtensionContext) {
  channel = vscode.window.createOutputChannel("Sprocket");
  context.subscriptions.push(channel);
  channel.appendLine("Sprocket extension is initializing...");

  registerCommands(context);

  statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  context.subscriptions.push(statusBar);
  statusBar.text = "Sprocket";
  statusBar.command = "sprocket.showChannel";
  statusBar.show();

  vscode.workspace.onDidChangeConfiguration(onDidChangeConfiguration);

  await startServer();
}

export async function deactivate() {
  await stopServer();
}

async function onDidChangeConfiguration(
  event: vscode.ConfigurationChangeEvent,
) {
  if (event.affectsConfiguration("sprocket.server")) {
    const userResponse = await vscode.window.showInformationMessage(
      "Changing server options requires a Sprocket server restart",
      "Restart now",
    );

    if (userResponse) {
      const command = "sprocket.restartServer";
      await vscode.commands.executeCommand(command);
    }
  }
}

/**
 * Sets up additional language configuration that's impossible to do via a
 * separate language-configuration.json file. See [1] for more information.
 *
 * [1]: https://github.com/Microsoft/vscode/issues/11514#issuecomment-244707076
 */
function configureLanguage(): vscode.Disposable {
  return vscode.languages.setLanguageConfiguration("wdl", {
    onEnterRules: [
      {
        // Preamble doc single-line comment
        // e.g. ##|
        beforeText: /^\s*##.*$/,
        action: { indentAction: vscode.IndentAction.None, appendText: "## " },
      },
      {
        // Single-line comment
        // e.g. #|
        beforeText: /^\s*#.*$/,
        action: { indentAction: vscode.IndentAction.None, appendText: "# " },
      },
    ],
  });
}
