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
  CancellationToken,
} from "vscode-languageclient";
import { getApi, FileDownloader } from "@microsoft/vscode-file-downloader-api";
import "node-fetch";
import path, { format } from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import * as tar from "tar";
import extract from "extract-zip";

const semver = require("semver");

let context: vscode.ExtensionContext | undefined;
let client: LanguageClient | undefined;
let channel: vscode.OutputChannel;
let statusBar: vscode.StatusBarItem;

interface Crate {
  name: string;
  max_stable_version: string;
}

interface CratesApiResponse {
  crates: Crate[];
}

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
  context = ctx;
  await tryActivate(ctx).catch((err) => {
    context = undefined;
    setStatus(
      Status.Error,
      `Failed to activate Sprocket extension: ${err.message ?? "see extension output for details"}`,
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
    return undefined;
  }

  await client.stop();
  client = undefined;
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
      platform = "pc-windows-gnu";
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

async function installSprocket(
  config: vscode.WorkspaceConfiguration,
): Promise<string | undefined> {
  let sprocketPath = config.get<string>("path") || "";
  if (sprocketPath.length > 0) {
    return sprocketPath;
  }

  const fileDownloader: FileDownloader = await getApi();
  let existingVersion: string | undefined;

  // Check to see if we've previously downloaded sprocket
  try {
    const packagePath = await fileDownloader.getItem(
      "sprocket-package",
      context as vscode.ExtensionContext,
    );
    let dir = path.parse(packagePath.fsPath).dir;
    sprocketPath = path.join(dir, "sprocket");
    if (process.platform === "win32") {
      sprocketPath += ".exe";
    }

    if (!existsSync(sprocketPath)) {
      sprocketPath = "";
    } else {
      let versionPath = path.join(dir, "sprocket-package.version");
      existingVersion = readFileSync(versionPath).toString();
      channel.appendLine(
        `Found previously downloaded Sprocket at \`${sprocketPath}\` (${existingVersion})`,
      );
    }
  } catch (e: any) {
    sprocketPath = "";
    existingVersion = undefined;
  }

  // If we're missing sprocket or otherwise need to check for updates
  if (sprocketPath.length === 0 || config.get<boolean>("checkForUpdates")) {
    channel.appendLine("Checking for latest stable Sprocket crate version...");
    const resp = await fetch(
      "https://crates.io/api/v1/crates?q=sprocket&per_page=1",
      {
        headers: {
          "User-Agent":
            "Sprocket VSCode extension (https://github.com/stjude-rust-labs/sprocket-vscode)",
        },
      },
    );

    if (resp.status < 200 || resp.status >= 300) {
      channel.appendLine(
        `Failed to query crates.io: a ${resp.status} was received`,
      );
      channel.appendLine(await resp.text());
      setStatus(
        Status.Error,
        "Failed to query crates.io: see extension output for details",
      );
      return undefined;
    }

    const apiResponse = (await resp.json()) as CratesApiResponse;
    const crate = apiResponse.crates.find((c) => c.name === "sprocket");
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

    channel.appendLine(
      `Latest Sprocket release is ${crate.max_stable_version}`,
    );
    if (
      existingVersion &&
      semver.lte(crate.max_stable_version, existingVersion)
    ) {
      channel.appendLine(
        "Skipping update as previously downloaded Sprocket is newest available",
      );
      return sprocketPath;
    }

    let uri = formatDownloadUri(crate.max_stable_version);
    if (!uri) {
      channel.appendLine(
        "The current platform or architecture is not currently supported by Sprocket",
      );
      setStatus(
        Status.Error,
        "Failed to download Sprocket: unsupported platform",
      );
      return undefined;
    }

    if (sprocketPath.length > 0) {
      const userResponse = await vscode.window.showInformationMessage(
        `Sprocket version ${crate.max_stable_version} is available for download!`,
        "Download and update",
        "Ignore",
      );

      if (!userResponse || userResponse === "Ignore") {
        return sprocketPath;
      }
    }

    channel.appendLine(`Downloading Sprocket from ${uri}`);

    let packagePath: vscode.Uri;
    try {
      packagePath = await vscode.window.withProgress<vscode.Uri>(
        {
          location: vscode.ProgressLocation.Window,
          cancellable: true,
          title: `Downloading Sprocket ${crate.max_stable_version}`,
        },
        async (progress, token) => {
          return await fileDownloader.downloadFile(
            uri,
            "sprocket-package",
            context as vscode.ExtensionContext,
            token,
          );
        },
      );
    } catch (e: any) {
      channel.appendLine(`Failed to download Sprocket: ${e.message}`);
      setStatus(Status.Error, `Failed to download Sprocket: ${e.message}`);
      return undefined;
    }

    await decompressPackage(packagePath.fsPath);

    let dir = path.parse(packagePath.fsPath).dir;
    sprocketPath = path.join(dir, "sprocket");
    if (process.platform === "win32") {
      sprocketPath += ".exe";
    }

    if (!existsSync(sprocketPath)) {
      channel.appendLine(
        "Failed to decompress Sprocket: sprocket executable does not exist",
      );
      setStatus(
        Status.Error,
        "Failed to decompress Sprocket: sprocket executable does not exist",
      );
      return undefined;
    }

    let versionPath = path.join(dir, "sprocket-package.version");
    writeFileSync(versionPath, crate.max_stable_version);
  }

  return sprocketPath;
}

async function startServer() {
  if (!context) {
    return;
  }

  const config = vscode.workspace.getConfiguration("sprocket.server");
  const outputLevel = config.get<string>("outputLevel") || "Quiet";
  const lint = config.get<boolean>("lint") || false;

  let sprocketPath = await installSprocket(config);
  if (!sprocketPath) {
    return;
  }

  setStatus(Status.Working, "Starting Sprocket...");

  let clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "wdl" }],
    outputChannel: channel,
    errorHandler: {
      error: (error, message, count) => {
        return {
          action: ErrorAction.Continue,
          message: `Sprocket encountered an error: ${error}`,
          handled: false,
        };
      },
      closed: () => {
        setStatus(Status.Error, `Sprocket has terminated`);

        // TODO: implement retry logic if sprocket was initialized.
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
    `Connected to sprocket LSP server version ${client.initializeResult?.serverInfo?.version}`,
  );
  setStatus(Status.Normal, "Sprocket is running");
}

async function restartServer() {
  await stopServer();

  try {
    await startServer();
  } catch (e: any) {
    setStatus(Status.Error, `Failed to activate start server: ${e.message}`);
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
