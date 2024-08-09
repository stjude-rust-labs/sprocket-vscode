<p align="center">
  <h1 align="center">
  Sprocket VS Code Extension
  </h1>

  <p align="center">
    <a href="https://github.com/stjude-rust-labs/sprocket-vscode/blob/main/LICENSE-APACHE" target="_blank">
      <img alt="License: Apache 2.0" src="https://img.shields.io/badge/license-Apache 2.0-blue.svg" />
    </a>
    <a href="https://github.com/stjude-rust-labs/sprocket-vscode/blob/main/LICENSE-MIT" target="_blank">
      <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg" />
    </a>
    <br/>
    <a href="https://github.com/stjude-rust-labs/sprocket-vscode/issues/new?assignees=&labels=&template=feature_request.md&title=Descriptive%20Title&labels=enhancement"><strong>Request Feature »</strong></a>
    ·
    <a href="https://github.com/stjude-rust-labs/sprocket-vscode/issues/new?assignees=&labels=&template=bug_report.md&title=Descriptive%20Title&labels=bug"><strong>Report Bug »</strong></a>
    <br />
  </p>
</p>

## Overview

This extension provides support for the <a href="https://openwdl.org/">Workflow
Description Language</a>. Generally speaking, it does this by interacting with the
[`sprocket`](https://github.com/stjude-rust-labs/sprocket) command line tool (and,
behind the scenes, the [`wdl`](https://github.com/stjude-rust-labs/wdl) family of
crates), though some functionality lives only within this extension.

## Getting Started

As this is an early version of both `sprocket` and this extension, you are required to
install `sprocket` yourself and make it available on the `PATH` (future versions of
this extension will automatically install and manage the `sprocket` binary for you).

You can do so by running the following commands:

```bash
# (1) Ensure Rust is installed by following the instructions at https://rustup.rs.

# (2) Install the latest version of `sprocket`.
cargo install --git https://github.com/stjude-rust-labs/sprocket

# (3) Make sure `sprocket` is accesible from the command line.
sprocket --version
```

You should now be set! Alternatively, a path to the `sprocket` binary can be provided in the extension
by setting the `sprocket.server.path` configuration option.

## 🎨 Features

* **Basic syntax highlighting** using a complete and up-to-date [TextMate
  grammar](https://macromates.com/manual/en/language_grammars). _This grammar is slated
  to drive GitHub's syntax highlighting for WDL files [in a future
  release](https://github.com/github-linguist/linguist/pull/6972)_.
* **Document and workspace diagnostics** courtesy of the language server protocol
  implementation provided by`sprocket analyzer`.
* **Code snippets** for common WDL constructs and conventions.

_**Note:** more features will be added as `sprocket` is developed. Please check out the
activity on the [Sprocket repository](https://github.com/stjude-rust-labs/sprocket) to
see what we're working on next!_

## Known Issues

- The extension is in an early stage of development and may not work as
  expected.
- The extension requires a separate installation of the `sprocket` command line
  tool; in the future, the extension will automatically install the tool.
- When `sprocket` unexpectedly terminates, the extension does not automatically
  restart it and you must manually restart the extension host to recover from
  the error; this will change in the future as the extension becomes more
  stable.

## Configuration

The extension provides the following configuration options:

- `sprocket.server.path`: The path to the `sprocket` command line tool. By
  default, the extension assumes that `sprocket` is on your PATH.
- `sprocket.server.verbose`: Passes the `--verbose` flag to `sprocket` when
  running it.
- `sprocket.server.lint`: Passes the `--lint` flag to `sprocket` when running
  it; this enables additional linting checks that are not enabled by default.

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


## Running The Development Extension

To run the extension, open this directory in VS Code and press `F5`.

This will open a new VS Code window with the extension automatically loaded.

## Installing The Extension

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
