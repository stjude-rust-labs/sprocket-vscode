# Release

* [ ] Create the release commit:
  * Bump the release number in `package.json`.
  * Update the `CHANGELOG.md` with the new date (don't forget to add a new `##
    Unreleased` section).
  * Commit the changes with the message: `release: bumps the version to vX.Y.Z`.
* [ ] Tag this commit: `git tag vX.Y.Z && git push --tags`
* [ ] Create a release in GitHub and copy over the contents of the `CHANGELOG.md`
   there
* [ ] Go to the Releases page in Github, create a Release for this tag, and
copy the notes from the `CHANGELOG.md` file.
* [ ] Run `vsce package` from the root directory to build the package.
* [ ] Run `vsce publish` from the root directory to build the package.
  * You can navigate to https://dev.azure.com to generate a personal access
    token when it asks for that.
* [ ] Ensure that the update successfully pushes to [the public download page].

[the public download page]:
    https://marketplace.visualstudio.com/items?itemName=stjude-rust-labs.sprocket-vscode
