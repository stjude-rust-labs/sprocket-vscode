# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Added option to configure maximum retries for restarting `analyzer`.
- Added bash textmate grammar rules.
- Added comment wrapping document and preamble comments.

## 0.4.0 - 08-12-2025

### Added

- Added automatic retry for Sprocket language server on unexpected termination.

### Fixed

- Rolls back syntax highlighting in `command` blocks to represent multi-line
  template strings
  ([#32](https://github.com/stjude-rust-labs/sprocket-vscode/pull/32))

## 0.3.0 - 10-22-2024

### Added

- Added a feature to automatically install and update `sprocket` from GitHub
  ([#7](https://github.com/stjude-rust-labs/sprocket-vscode/pull/7)).

## 0.2.0 - 08-16-2024

### Revise

- Greatly improves the WDL TextMate grammar
  ([#4](https://github.com/stjude-rust-labs/sprocket-vscode/pull/4)).
- Changes indentation in snippets from spaces to tabs
  ([#5](https://github.com/stjude-rust-labs/sprocket-vscode/pull/5)).

### Documentation

- Multiple updates to the `README.md` and instructions on how to get set up
  using the Sprocket VS Code extension
  ([`295f100`](https://github.com/stjude-rust-labs/sprocket-vscode/commit/295f100194dc577daf044978b562a60ab5e728ae)
  and
  [`c65a65f`](https://github.com/stjude-rust-labs/sprocket-vscode/commit/c65a65f2fd1768d12ae6c6814b6daf29a60311a7)).

## 0.1.0 - 07-29-2024

### Added

- Add the initial implementation of the Sprocket extension
  ([#1](https://github.com/stjude-rust-labs/sprocket-vscode/pull/1)).
