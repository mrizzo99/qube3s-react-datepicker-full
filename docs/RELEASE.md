# Release Guide

This document defines the release workflow for the Qube3s React Datepicker packages with the following distribution model:

- `@qube3s/react-datepicker-core` is published publicly to the npm registry.
- `@qube3s/react-datepicker-plus` is published privately to a Cloudsmith npm repository.

The repository now includes a manual GitHub Actions publish workflow at `.github/workflows/publish.yml`. It supports two modes:

- `core-only`
- `core-plus-cloudsmith`

## Release model

The current package relationship is:

- Core version and Plus version should stay aligned.
- Plus depends on Core at the exact same version.

Because of that, every release must follow this order:

1. Bump both package versions to the same value.
2. Verify the workspace from the repo root.
3. Publish Core to public npm.
4. Confirm the new Core version is live.
5. Publish Plus to Cloudsmith.

Do not publish Plus before Core. The current Plus dependency is pinned to the exact Core version.

## Prerequisites

Before doing a release, confirm:

- you have npm publish access for `@qube3s/react-datepicker-core`
- you have Cloudsmith publish access for the Plus repository
- the Cloudsmith repository has an npm upstream configured for `https://registry.npmjs.org`
- the Cloudsmith upstream is set to cache/proxy npm packages
- the working tree is clean

The Cloudsmith upstream matters because customers will resolve the `@qube3s` scope from Cloudsmith. That allows Cloudsmith to serve the public Core package while keeping Plus private.

## Required environment

Recommended environment variables for a release shell:

```bash
export NPM_TOKEN=your_npm_publish_token
export CLOUDSMITH_API_KEY=your_cloudsmith_publish_token
export CLOUDSMITH_OWNER=your-cloudsmith-owner
export CLOUDSMITH_REPOSITORY=your-cloudsmith-repository
```

Publisher auth examples:

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

```ini
//npm.cloudsmith.io/${CLOUDSMITH_OWNER}/${CLOUDSMITH_REPOSITORY}/:_authToken=${CLOUDSMITH_API_KEY}
```

Do not commit publisher credentials or a release-only `.npmrc` to the repository.

For GitHub Actions, configure:

- repository secret `NPM_TOKEN`
- repository secret `CLOUDSMITH_API_KEY`
- repository variable `CLOUDSMITH_OWNER`
- repository variable `CLOUDSMITH_REPOSITORY`

## Pre-release checklist

From the repo root:

```bash
npm ci
npm run verify
npm run docs
npm run build-storybook
```

Optional package dry-runs:

```bash
cd packages/core
npm pack --dry-run

cd ../plus
npm pack --dry-run
```

Also confirm:

- package versions match in `packages/core/package.json` and `packages/plus/package.json`
- changelog/release notes are ready
- package license files are present
- package metadata is accurate for the release

## Publish Core to npm

From `packages/core`:

```bash
npm publish --access public
```

Why `--access public`:

- the package is scoped
- scoped npm packages default to private unless explicitly published as public

After publish, verify:

```bash
npm view @qube3s/react-datepicker-core version
```

The returned version should match the version you just released.

Do not continue until the new Core version is visible on npm.

## Publish Plus to Cloudsmith

From `packages/plus`:

```bash
npm publish --registry=https://npm.cloudsmith.io/${CLOUDSMITH_OWNER}/${CLOUDSMITH_REPOSITORY}/
```

After publish, verify in one of these ways:

- confirm the package/version appears in the Cloudsmith UI
- query the package with the Cloudsmith CLI if you use it internally
- perform a clean install test using a read-only entitlement token

## Recommended release sequence

This is the full manual flow in order:

```bash
# repo root
npm ci
npm run verify
npm run docs
npm run build-storybook

# publish core
cd packages/core
npm publish --access public
npm view @qube3s/react-datepicker-core version

# publish plus
cd ../plus
npm publish --registry=https://npm.cloudsmith.io/${CLOUDSMITH_OWNER}/${CLOUDSMITH_REPOSITORY}/
```

## GitHub Actions workflow

The repository includes a manual publish workflow that can be started from the GitHub Actions UI.

Workflow inputs:

- `publish_mode`
  - `core-only`
  - `core-plus-cloudsmith`
- `npm_tag`
- `provenance`

Workflow behavior:

1. checks out the repository
2. installs dependencies
3. installs Playwright Chromium
4. runs `npm run verify`
5. runs `npm run docs`
6. runs `npm run build-storybook`
7. validates that Core and Plus versions are aligned
8. publishes Core to npm
9. waits for the Core version to appear on npm
10. optionally publishes Plus to Cloudsmith when `publish_mode=core-plus-cloudsmith`

The workflow is intentionally manual for now so publishing remains an explicit release action.

## Post-release verification

After both publishes complete:

1. Confirm npm shows the new Core version.
2. Confirm Cloudsmith shows the new Plus version.
3. Test installation in a clean temporary directory using the customer install path.
4. Smoke test imports for both packages.

Minimal clean-room test:

```bash
mkdir -p /tmp/qube3s-release-check
cd /tmp/qube3s-release-check
npm init -y
```

Create a temporary `.npmrc`:

```ini
registry=https://registry.npmjs.org/
@qube3s:registry=https://npm.cloudsmith.io/${CLOUDSMITH_OWNER}/${CLOUDSMITH_REPOSITORY}/
//npm.cloudsmith.io/${CLOUDSMITH_OWNER}/${CLOUDSMITH_REPOSITORY}/:_authToken=${CLOUDSMITH_ENTITLEMENT_TOKEN}
```

Then install:

```bash
npm install @qube3s/react-datepicker-plus
```

Expected result:

- Plus resolves from Cloudsmith
- Core also resolves through Cloudsmith for the `@qube3s` scope
- public third-party dependencies continue to resolve from npm

## Rollback and recovery

If Core publish succeeds and Plus publish fails:

- do not republish Core under a different version unless required
- fix the Cloudsmith issue
- publish Plus at the same version once the issue is resolved

If Core publish fails:

- do not publish Plus
- fix the npm publish issue first

If a bad version is published:

- follow npm and Cloudsmith package policy for deprecation or removal
- prefer deprecation plus a fast corrective patch release over destructive history changes

## Customer provisioning handoff

Releasing Plus is only half of the distribution process. For customer delivery:

1. create a Cloudsmith entitlement token for the customer
2. send the customer install instructions
3. record which customer received which token
4. revoke or rotate the token if needed later

This repository should keep customer-facing installation instructions in a separate document so the release runbook stays publisher-focused.

## Future automation

This workflow is a good candidate for GitHub Actions once the manual flow is stable.

Recommended automation shape:

1. trigger on a release tag
2. run `npm ci`
3. run `npm run verify`
4. publish Core to npm
5. publish Plus to Cloudsmith
6. optionally run a clean install smoke test

## References

- npm scoped public packages: https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/
- Cloudsmith npm registry: https://docs.cloudsmith.com/formats/npm-registry
- Cloudsmith entitlement tokens: https://docs.cloudsmith.com/software-distribution/entitlement-tokens
- Cloudsmith upstreams: https://docs.cloudsmith.com/repositories/upstreams
