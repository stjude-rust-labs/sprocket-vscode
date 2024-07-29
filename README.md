# Sprocket VS Code Extension

This Visual Studio Code extension provides support for the [Workflow Description Language](https://openwdl.org/).

## Prerequisites

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

### Running

To run the extension, you must have the `sprocket` command line tool installed
on your PATH.

To install `sprocket`, ensure you a [Rust Toolchain](https://rustup.rs/)
installed.

With Rust installed, you can install `sprocket` using the following command:

```bash
cargo install --git https://github.com/stjude-rust-labs/sprocket
```

Alternatively, a path to the `sprocket` binary can be provided in the extension
by setting the `sprocket.server.path` configuration option.

## Features

- Syntax highlighting
- Document and workspace diagnostics

***More features will be added in the future.***

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

# Known Issues

- The extension is in an early stage of development and may not work as
  expected.
- The extension requires a separate installation of the `sprocket` command line
  tool; in the future, the extension will automatically install the tool.
- When `sprocket` unexpectedly terminates, the extension does not automatically
  restart it and you must manually restart the extension host to recover from
  the error; this will change in the future as the extension becomes more
  stable.

# Configuration

The extension provides the following configuration options:

- `sprocket.server.path`: The path to the `sprocket` command line tool. By
  default, the extension assumes that `sprocket` is on your PATH.
- `sprocket.server.verbose`: Passes the `--verbose` flag to `sprocket` when
  running it.
- `sprocket.server.lint`: Passes the `--lint` flag to `sprocket` when running
  it; this enables additional linting checks that are not enabled by default.
