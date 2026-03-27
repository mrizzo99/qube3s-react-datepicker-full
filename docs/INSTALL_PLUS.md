# Installing Qube3s Plus

This guide explains how a customer can install `@qube3s/react-datepicker-plus`.

Qube3s Plus is distributed through a private Cloudsmith npm repository.

## What you need

Before installation, you need:

- Access to the Qube3s Cloudsmith package repository
- A Cloudsmith entitlement token provided by Qube3s
- Node.js and npm installed in your environment

You do not need a paid npm account for this distribution model.

## How package resolution works

Qube3s Plus depends on Qube3s Core.

Your project will install:

- `@qube3s/react-datepicker-plus` from the private Cloudsmith registry
- `@qube3s/react-datepicker-core` through the same Cloudsmith scoped registry path
- Public third-party dependencies such as `react`, `react-dom`, and `date-fns` from the public npm registry

## Project `.npmrc`

Create or update a project-level `.npmrc` file with the following values:

```ini
registry=https://registry.npmjs.org/

@qube3s:registry=https://npm.cloudsmith.io/OWNER/REPOSITORY/
//npm.cloudsmith.io/OWNER/REPOSITORY/:_authToken=${CLOUDSMITH_ENTITLEMENT_TOKEN}
```

Replace:

- `OWNER` with the Cloudsmith owner/workspace supplied by Qube3s
- `REPOSITORY` with the Cloudsmith repository supplied by Qube3s

Do not hardcode the token into a committed file.

## Local installation

Set the token in your shell:

```bash
export CLOUDSMITH_ENTITLEMENT_TOKEN=your_token_here
```

Install Plus:

```bash
npm install @qube3s/react-datepicker-plus
```

If you want to install both packages explicitly:

```bash
npm install @qube3s/react-datepicker-core @qube3s/react-datepicker-plus
```

In most cases, installing Plus is enough because Core is already declared as a dependency.

## CI installation

In CI, set `CLOUDSMITH_ENTITLEMENT_TOKEN` as a secret and expose it to the job environment.

Example install flow:

```bash
npm ci
```

This works if the repository contains the correct `.npmrc` and the CI environment has the token set.

## Verification

After installation, confirm the package resolves:

```bash
npm ls @qube3s/react-datepicker-plus
npm ls @qube3s/react-datepicker-core
```

You can also do a quick import smoke test in your application:

```tsx
import DatePicker from '@qube3s/react-datepicker-core/components/DatePicker'
import DateRangePicker from '@qube3s/react-datepicker-plus/components/DateRangePicker'
```

## Common issues

### 401 or 403 during install

Usually this means:

- The entitlement token is missing
- The entitlement token is invalid
- The token is expired or revoked
- The `.npmrc` registry URL does not match the token's repository

### Package not found

Usually this means:

- The `@qube3s` scope is not pointed at Cloudsmith
- The repository URL in `.npmrc` is incorrect
- Your installation environment is not picking up the project `.npmrc`

### Token works locally but fails in CI

Usually this means:

- The CI secret was not exposed as `CLOUDSMITH_ENTITLEMENT_TOKEN`
- The CI job is running without the project `.npmrc`
- The CI system is overriding npm registry settings elsewhere

## Security guidance

- Treat the Cloudsmith entitlement token like a private credential
- Do not commit the token to source control
- Prefer one token per team or environment if you need separate revocation boundaries
- Rotate the token if you believe it has been exposed

## Support

If installation fails, provide Qube3s with:

- The package version you are trying to install
- Your npm version
- Your Node.js version
- The exact install command
- The exact error message

Do not send the entitlement token itself in plaintext messages to support.
