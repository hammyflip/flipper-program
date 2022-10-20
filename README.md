# TypeScript SDK

Follow the following steps to publish a new version of the TypeScript SDK:

1. Run `yarn version` and enter a new appropriate [semver version](https://docs.npmjs.com/about-semantic-versioning) for the npm package. That will create a new tag and commit.
2. Run `git push origin NEW_TAG`.
3. `git push` the new commit as well.

This will push the new release tag to GitHub and trigger the release pipeline, after which clients can install the latest SDK with `yarn add @hammyflip/flipper-sdk@latest`.