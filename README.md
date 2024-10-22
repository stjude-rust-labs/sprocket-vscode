<img style="margin: 0px" alt="Repository Header Image" src="./assets/repo-header.png" />
<hr/>

<p align="center">
  <p align="center">
    <a href="https://marketplace.visualstudio.com/items?itemName=stjude-rust-labs.sprocket-vscode">
      <img src="https://vsmarketplacebadges.dev/version/stjude-rust-labs.sprocket-vscode.png" alt="Visual Studio Marketplace">
  </a>
    <a href="https://github.com/stjude-rust-labs/sprocket-vscode/blob/main/LICENSE-APACHE" target="_blank">
      <img alt="License: Apache 2.0" src="https://img.shields.io/badge/license-Apache 2.0-blue.svg" />
    </a>
    <a href="https://github.com/stjude-rust-labs/sprocket-vscode/blob/main/LICENSE-MIT" target="_blank">
      <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg" />
    </a>
    <br/>
    <a href="https://marketplace.visualstudio.com/items?itemName=stjude-rust-labs.sprocket-vscode"><strong>Download »</strong></a>
    ·
    <a href="https://stjude-rust-labs.github.io/sprocket/vscode/getting-started.html"><strong>Read the Docs »</strong></a>
    ·
    <a href="https://github.com/stjude-rust-labs/sprocket-vscode/issues/new?assignees=&labels=&template=feature_request.md&title=Descriptive%20Title&labels=enhancement"><strong>Request Feature »</strong></a>
    ·
    <a href="https://github.com/stjude-rust-labs/sprocket-vscode/issues/new?assignees=&labels=&template=bug_report.md&title=Descriptive%20Title&labels=bug"><strong>Report Bug »</strong></a>
    <br />
  </p>
</p>

> **NOTE**
>
> The Sprocket Visual Studio Code extension is currently in very early
> development. You may also experience various issues, such as
> needing to manually restart the Sprocket extension if it crashes. We plan to
> improve all of these things as we continue to develop the extension.

## 🏠 Overview

This extension provides support developing bioinformatics workflows via the <a
href="https://openwdl.org/">Workflow Description Language</a>. It does this by
leveraging the [`sprocket`](https://github.com/stjude-rust-labs/sprocket)
command line tool (and the [`wdl`](https://github.com/stjude-rust-labs/wdl) family of crates).

## 📚 Getting Started

To get started, follow the instructions outlined in [the documentation](https://stjude-rust-labs.github.io/sprocket/vscode/getting-started.html).

## 🎨 Features

- **Basic syntax highlighting** using a complete and up-to-date [TextMate
  grammar](https://macromates.com/manual/en/language_grammars). _This grammar
  is slated to drive GitHub's syntax highlighting for WDL files [in a future release](https://github.com/github-linguist/linguist/pull/6972)_.
- **Document and workspace diagnostics from static analysis** courtesy of the
  language server protocol implementation provided by `sprocket analyzer`.
- **Code snippets** for common WDL constructs and conventions.

_**Note:** more features will be added as `sprocket` is developed. Please check
out the activity on the [Sprocket repository](https://github.com/stjude-rust-labs/sprocket)
to see what we're working on next!_

## Configuration

The extension provides the following configuration options:

- `sprocket.server.checkForUpdates`: Whether to check for updates to the
  automatically installed `sprocket` tool when the extension starts.
- `sprocket.server.path`: The path to the `sprocket` command line tool. Use
  this to specify a custom installation of `sprocket`.
- `sprocket.server.verbose`: Configures the verbosity of `sprocket` output.
  Valid values are `Verbose`, `Information`, and `Quiet`; defaults to `Quiet`.
- `sprocket.server.lint`: Passes the `--lint` flag to `sprocket`; this enables
  additional linting checks that are not enabled by default.

## Known Issues

- The extension is in an early stage of development and may not work as
  expected.
- When `sprocket` unexpectedly terminates, the extension does not automatically
  restart it and you must manually restart the extension host to recover from
  the error; this will change in the future as the extension becomes more
  stable.
- A number of popular LSP features, such as "Go To Definition", are not yet
  implemented.

## Development

### Setup

To build the extension, Node.js, `npm`, and `yarn` must be installed.

To install Node.js, follow [these instructions](https://nodejs.org/en/download/package-manager/current).

To install `yarn`, run the following command:

```bash
npm install -g yarn
```

Finally, install the project dependencies by running the following command:

```bash
yarn install
```

Ensure the Yarn binaries directory is on your path by adding the following to
your shell profile:

```bash
export PATH="$(yarn global bin):$PATH"
```

### Building

To build the extension, run the following command:

```bash
yarn compile
```

This command will automatically be run when you start the extension in the
development environment or when packaging the extension.

### Running The Development Extension

To run the extension, open this directory in VS Code and press `F5`.

This will open a new VS Code window with the extension automatically loaded.

### Installing The Extension

To install the extension, you can package it as a `.vsix` file and install it.

To package the extension, install the `vsce` tool:

```
yarn global add @vscode/vsce
```

Then package the extension by running:

```bash
vsce package --yarn
```

This will generate a `sprocket-vscode-<version>.vsix` file that you can install in VS Code using the `Extensions: install from VSIX` command.

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check
[issues page](https://github.com/stjude-rust-labs/sprocket-vscode/issues).

## 📝 License

This project is licensed as either [Apache 2.0][license-apache] or
[MIT][license-mit] at your discretion.

Copyright © 2024-Present [St. Jude Children's Research Hospital](https://github.com/stjude).

[license-apache]: https://github.com/stjude-rust-labs/sprocket-vscode/blob/main/LICENSE-APACHE
[license-mit]: https://github.com/stjude-rust-labs/sprocket-vscode/blob/main/LICENSE-MIT
