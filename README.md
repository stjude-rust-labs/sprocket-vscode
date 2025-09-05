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
    <a href="https://sprocket.bio/vscode/getting-started.html"><strong>Read the Docs »</strong></a>
    ·
    <a href="https://github.com/stjude-rust-labs/sprocket-vscode/issues/new?assignees=&labels=&template=feature_request.md&title=Descriptive%20Title&labels=enhancement"><strong>Request Feature »</strong></a>
    ·
    <a href="https://github.com/stjude-rust-labs/sprocket-vscode/issues/new?assignees=&labels=&template=bug_report.md&title=Descriptive%20Title&labels=bug"><strong>Report Bug »</strong></a>
    <br />
  </p>
</p>

## 🏠 Overview

This extension provides support developing bioinformatics workflows via the <a
href="https://openwdl.org/">Workflow Description Language</a>. It does this by
leveraging the [`sprocket`](https://github.com/stjude-rust-labs/sprocket)
command line tool (and the [`wdl`](https://github.com/stjude-rust-labs/wdl)
family of crates).

## 📚 Getting Started

To get started, follow the instructions outlined in [the
documentation](https://sprocket.bio/vscode/getting-started.html).

## 🎨 Features

- **Syntax highlighting.** The extension uses both a complete [TextMate
  grammar](https://macromates.com/manual/en/language_grammars) _and_ semantic
  syntax highlighting via the LSP integration. Notably, this syntax highlighting
  also drives GitHub's syntax highlighting of WDL.
- **Document formatting.** Full formatting of documents using the underlying
  `sprocket format` command is integrated such that it can be applied on-demand
  or automatically on save/paste.
- **Static analysis.** Static analysis of WDL documents is provided via the LSP
  and is configurable for both validation and lint warnings.
- **Code completion.** Various completions are available, including completion
  of standard library functions and context-aware completion of variables.
- **Hover support.** Hovering a variable or standard library function gives a
  modal with documentation regarding that item.
- **Go to definition.** Navigating from a symbol to its definition is supported
  in all known contexts.
- **Find all references.** Similarly, navigating from a symbol to all known
  references is supported in all known contexts.
- **Rename symbol.** Symbols may be seamlessly refactored and renamed using the
  built-in VSCode shortcuts.
- **Workspace and document symbols.** Symbols within WDL documents and symbols
  are surfaced via your code editor's default facilities. This generally
  includes an outline of symbols in a document and workspace-wide symbol search
  at a minimum.
- **Code snippets** for common WDL constructs and conventions.

All major functionality for the Sprocket VSCode extension has been completed. If
you have things you want us to consider included, please [file an
issue](https://github.com/stjude-rust-labs/sprocket-vscode/issues).

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
- `sprocket.server.maxRetries`: Sets the maximum number of retries before the
  extension bails out.

## Known Issues

_None at present._

## Development

### Setup

To build the extension, Node.js, `npm`, and `yarn` must be installed.

To install Node.js, follow [these
instructions](https://nodejs.org/en/download/package-manager/current).

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

This will generate a `sprocket-vscode-<version>.vsix` file that you can install
in VS Code using the `Extensions: install from VSIX` command.

## 🤝 Contributing

Contributions, issues and feature requests are welcome! Feel free to check
[issues page](https://github.com/stjude-rust-labs/sprocket-vscode/issues).

## 📝 License

This project is licensed as either [Apache 2.0][license-apache] or
[MIT][license-mit] at your discretion. Additionally, please see [the
disclaimer](https://github.com/stjude-rust-labs#disclaimer) that applies to all
crates and command line tools made available by St. Jude Rust Labs.

Copyright © 2024-Present [St. Jude Children's Research Hospital](https://github.com/stjude).

[license-apache]: https://github.com/stjude-rust-labs/sprocket-vscode/blob/main/LICENSE-APACHE
[license-mit]: https://github.com/stjude-rust-labs/sprocket-vscode/blob/main/LICENSE-MIT
