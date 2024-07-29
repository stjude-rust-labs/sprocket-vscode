import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import { ErrorAction, CloseAction } from "vscode-languageclient";

let client: LanguageClient | undefined;
let channel: vscode.OutputChannel;
let statusBar: vscode.StatusBarItem;

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

export async function activate(context: vscode.ExtensionContext) {
  await tryActivate(context).catch((err) => {
    setStatus(
      Status.Error,
      `Failed to activate Sprocket extension: ${err.message}`,
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

async function startServer() {
  setStatus(Status.Working, "Starting Sprocket...");

  const config = vscode.workspace.getConfiguration("sprocket.server");
  const outputLevel = config.get<string>("outputLevel") || "Quiet";
  const lint = config.get<boolean>("lint") || false;
  let path = config.get<string>("path") || "sprocket";

  if (path.length === 0) {
    path = "sprocket";
  }

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
      args.push("--verbose");
      break;

    case "Quiet":
      args.push("--quiet");
      break;
  }

  if (lint) {
    args.push("--lint");
  }

  if (path) {
    channel.appendLine(
      `Spawning \`${path}\` with arguments \`${JSON.stringify(args)}\``,
    );
  } else {
    channel.appendLine(
      `Spawning \`sprocket\` with arguments \`${JSON.stringify(args)}\``,
    );
  }

  let serverOptions: ServerOptions = {
    command: path,
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
  channel.appendLine("Sprocket extension is initializing");

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
    const message =
      "Changing server options requires a Sprocket server restart";
    const userResponse = await vscode.window.showInformationMessage(
      message,
      "Restart now",
    );

    if (userResponse) {
      const command = "sprocket.restartServer";
      await vscode.commands.executeCommand(command);
    }
  }
}
