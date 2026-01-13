# Release

- [ ] Create the release commit:
  - Bump the release number in `package.json`.
  - Update the `CHANGELOG.md` with the new date (don't forget to add a new `##
Unreleased` section).
  - Commit the changes with the message: `release: bumps the version to vX.Y.Z`.
- [ ] Tag this commit: `git tag vX.Y.Z && git push --tags`
- [ ] Create a release in GitHub and copy over the contents of the `CHANGELOG.md`
      there
- [ ] Go to the Releases page in Github, create a Release for this tag, and
      copy the notes from the `CHANGELOG.md` file.
- [ ] Run `vsce package` from the root directory to build the package.
- [ ] Run `vsce publish` from the root directory to publish the package.
  - If your Personal Access Token (PAT) has expired, see the instructions below.
- [ ] Ensure that the update successfully pushes to [the public download page].
- [ ] Go to the [Open VSX registry][open-vsx-registry] and upload the extension.

## Creating a Personal Access Token (PAT)

To publish to the VS Code Marketplace, you need a Personal Access Token from Azure
DevOps:

1. Go to https://dev.azure.com and sign in with your Microsoft account.
2. Click your profile image (top-right) and select **Personal access tokens**.
3. Click **New Token** and configure:
   - **Name**: anything descriptive (e.g., "vsce publish")
   - **Organization**: select **All accessible organizations**
   - **Expiration**: choose an expiration date
   - **Scopes**: Custom defined → Show all scopes → **Marketplace** → check **Manage**
4. Click **Create** and copy the token immediately (you won't see it again).
5. Run `vsce login stjude-rust-labs` and paste the token when prompted.

[the public download page]: https://marketplace.visualstudio.com/items?itemName=stjude-rust-labs.sprocket-vscode
[open-vsx-registry]: https://open-vsx.org/user-settings/extensions
