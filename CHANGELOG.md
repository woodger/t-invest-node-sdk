# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project uses [Semantic Versioning](https://semver.org/).

Entries before this changelog was introduced are reconstructed from project
memory and git history. Historical `0.1.40` and `0.0.29` sections summarize
frequent patch versions inside their version lines instead of listing every
micro-release separately.

## [Unreleased]

### Added

- Added package `bin` metadata for the `tinkoff-invest-node-sdk` CLI binary.
- Added per-instance unary limit overrides through
  `TinkoffInvestOptions.unaryLimits`, merged with package defaults when an SDK
  instance is created.
- Added `defineUnaryLimits()` and `UnaryLimitsDefinition` for readable nested
  service and method limit declarations without changing the flat runtime
  `UnaryLimits` contract.

### Changed

- Migrated the public CLI contract to preferred friendly domain paths for
  account, market, order, stop-order, operation, sandbox, instrument, and
  `dev compile-proto`.
- Kept technical and legacy CLI paths as compatibility aliases while making
  top-level help show domains, domain help show preferred commands, and
  command-specific help normalize compatibility calls to preferred usage.
- Restored `yarn build` as the explicit TypeScript compile command and kept
  `prepare` as the package-install compile lifecycle script.
- Moved proto generation from a package script to the `yarn cli compile-proto`
  utility command.
- Documented `yarn build` as the strict TypeScript compile gate backed by
  `tsconfig.json`.
- Updated the `icore` runtime dependency to `2.0.0` and migrated the CLI runner
  to the shared terminal error policy.
- Classified invalid CLI invocation, required CLI/ENV values, and parsed
  command configuration as usage failures with exit code `2`; runtime,
  output, provider, and command-definition failures keep exit code `1`.
- Updated proto provenance to the active official T-Bank `invest-contracts`
  upstream and restored a flat layout for vendored and generated contracts.
  Root package exports remain unchanged; direct generated-module imports now
  use the flat `generated/<contract>` paths.
- Made proto generation resolve vendored and generated contract paths from
  `contracts/upstream.json` instead of duplicating them in bootstrap code.

### Fixed

- Updated default unary throttling with current service and method-specific
  T-Invest limits, including low-limit instrument lists and operation reports.
- Replaced the stale archived limits reference and outdated stream grade table
  with the active T-Bank limits policy.

## [0.2.3] - 2026-07-03

### Added

- Added this changelog in Keep a Changelog format.
- Added public root exports for generated server-side service definitions and
  implementation types.
- Added package metadata needed for publishing preparation, including
  keywords and license notices.

### Changed

- Standardized CLI boolean flags around `--flag` / `--no-flag` syntax and
  rejected assigned boolean values such as `--flag=true`.
- Exported only curated generated runtime contracts from the package root.
- Normalized package metadata and repository fields.
- Made `prepare: tsc` the compile entrypoint and removed the dedicated
  `build` script.
- Disabled TypeScript source map emission.

### Fixed

- Fixed CLI boolean parsing after the `icore` API stopped accepting
  `--flag=true` and `--flag=false`.
- Fixed stale generated package surface for server-side nice-grpc consumers.

## [0.2.2] - 2026-07-02

### Changed

- Prepared package compilation for git dependency installation.
- Made the project Yarn-oriented in user-facing scripts and documentation.
- Switched the compile step to `prepare` as an npm lifecycle entrypoint.

## [0.2.1] - 2026-07-02

### Added

- Added MIT license notices and compact third-party generated-code notices.

### Changed

- Updated `icore` integration to `1.0.7`.
- Consolidated license notices in a single `LICENSE` file.

### Removed

- Removed path-specific generated-code license wording.

## [0.2.0] - 2026-06-29

### Changed

- Promoted the package from the `0.1.x` CLI build-out line to `0.2.0`.
- Established the post-CLI-migration baseline for the SDK package.

## [0.1.40] - 2026-06-28

This section summarizes package versions `0.1.0` through `0.1.40`.

### Added

- Added a broad bootstrap CLI command surface using canonical
  `<service> <method>` command names.
- Added CLI commands for users, market data, instruments, operations, orders,
  stop orders, sandbox, and stream scenarios.
- Added confirmed side-effect CLI commands for order, stop order, favorites,
  and sandbox mutations.
- Added configurable stream CLI support for server-side streams and
  `marketdata.marketDataStream` initial requests.
- Added stream CLI reference and configuration documentation.
- Added application report contracts and reusable report value formatting.
- Added infrastructure renderers for JSON, CSV, and table output.
- Added stdout/stderr writers with backpressure handling.
- Added Clean Architecture, command, output-boundary, testing, naming,
  scripts, dependency, and change-policy documentation.
- Added local `yarn cli` shortcut.

### Changed

- Migrated bootstrap CLI mechanics to the `icore` command registry and option
  schemas.
- Replaced legacy `CliArgs`, ArgGuards, and compatibility wrappers with
  declarative `icore` parsing.
- Migrated the test runner from local suite files to `fwa`.
- Reorganized bootstrap executable entrypoints under `src/bootstrap/bin`.
- Moved the executable CLI entrypoint while keeping package binary behavior.
- Moved gRPC infrastructure under `src/infrastructure/transport/grpc`.
- Split CLI output formatting into application reports, infrastructure
  renderers, and output writers.
- Standardized CLI instrument identifiers around `--instrument-id`.
- Migrated CLI money JSON output from combined text values to structured
  `amount` and `currency` values.
- Centralized scalar report formatting for money, quotation, and date values.
- Updated proto generation to recursively process raw proto files.
- Regenerated proto outputs with `protoc` 3.21.
- Switched proto generation back to system `protoc` after the `grpc-tools`
  experiment.
- Grouped compiled test execution around `fwa`.
- Shortened CLI quick-start documentation.

### Fixed

- Fixed stdout and stderr backpressure handling for CLI output.
- Fixed stream output status/error handling and long-running output writes.

### Removed

- Removed GitHub Actions documentation workflow noise.
- Removed legacy CLI aliases before publishing the new command surface.

## [0.0.29] - 2026-06-19

This section summarizes package versions `0.0.1` through `0.0.29`.

### Added

- Added the initial SDK package structure and generated TypeScript contracts.
- Added generated declaration output and package entrypoint metadata.
- Added configurable SDK options and config JSON resolution.
- Added unary throttling for provider rate limits.
- Added account/token total request limiting.
- Added environment-based configuration, including SSL-related options.
- Added stream clients and SDK close lifecycle support.
- Added `@bufbuild/protobuf` runtime dependency.
- Added VitePress documentation and proto generation documentation before the
  later documentation reset.
- Added throttling, config, middleware, and SDK internals tests.
- Added ESLint-based linting.
- Added early bootstrap CLI commands and initial CLI API argument preparation.
- Added testing and project policy documentation.

### Changed

- Updated proto contracts from upstream snapshots.
- Updated `tsconfig.json` and JSON config handling.
- Updated README to the current SDK API.
- Updated SDK config and SSL option handling.
- Improved unary throttling limits and middleware behavior.
- Updated dependencies and compatibility fixes.
- Refactored SDK internals around throttle/config tests.

### Fixed

- Fixed config JSON resolution.
- Fixed throttle delay behavior.

### Removed

- Removed the committed `config.json` file.
- Removed VitePress documentation tooling during the documentation reset.
- Removed committed `dist` artifacts and added `dist` to `.gitignore`.
