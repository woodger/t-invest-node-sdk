# История изменений

В этом файле документируются все существенные изменения проекта.

Формат основан на [Keep a Changelog](https://keepachangelog.com/), а версии
проекта соответствуют [Semantic Versioning](https://semver.org/).

Записи, предшествующие появлению этого файла, восстановлены по истории Git и
сведениям о проекте. Исторические разделы `0.1.40` и `0.0.29` объединяют частые
патч-релизы в строках версий вместо перечисления каждого микрорелиза.

## [Не выпущено]

## [0.4.4] - 2026-08-13

### Исправлено

- Из корня пакета экспортируются все T-Invest enum-контракты, используемые
  публичными generated DTO, и соответствующие JSON-конвертеры. Consumer-проекты
  могут реализовывать mock-сервисы без deep imports, числовых констант и
  подавлений проверки исчерпывающего `switch`.
- Локальное превышение внутреннего лимита SDK для входящего gRPC-сообщения
  теперь отличается от исчерпания квоты провайдера по `SdkError.source`: первый
  случай получает `ResourceExhausted` с `source: 'sdk'`, второй сохраняет
  `source: 'grpc'`.
  Поля `path`, `details` и `cause` остаются доступными для диагностики.
- Ошибка сериализации исходящего request теперь получает `Internal` с
  `source: 'sdk'`, поскольку запрос не покинул процесс. Provider-side
  `INTERNAL` сохраняет `source: 'grpc'`; `path`, `details` и `cause` не
  теряются.
- Синхронные исключения из `onHeader` и `onTrailer` больше не выходят в
  `uncaughtException`: соответствующий unary-вызов или stream iteration
  отклоняется исходной ошибкой, а незавершённый transport call отменяется.
- Недопустимые значения публичных `token`, `appName` и `unaryLimits`
  нормализуются в `InvalidArgument` с `source: 'sdk'` до создания transport.
  Диагностика metadata validation не содержит значение token.

## [0.4.3] - 2026-08-13

### Изменено

- `oxlint` обновлён до 1.78.0, `fwa` — до 2.1.4, `icore` — до 2.2.3,
  `pwd-fs` — до 3.5.10.
- Конфигурация Oxlint приведена к проверенному эталонному набору правил для
  Node.js и TypeScript. Проект использует явные пространства правил `eslint`,
  `typescript` и `import`, 84 выбранных правила уровня `error` и 21 правило
  анализа типов, отобранное по рискам. Исключение сгенерированного кода и
  проверка неиспользуемых подавлений сохранены.
- `typescript/no-deprecated` не включён в основной набор правил: диагностический
  запуск обнаружил устаревшие исходные контракты на границах сгенерированного
  публичного API и совместимого вывода CLI. Не все такие случаи допускают
  механическую замену полей, в частности `klong`/`kshort` на `dlong`/`dshort`.
- Устаревший статус `klong`/`kshort` перенесён в шесть написанных вручную
  контрактов отчётов CLI и описан для Consumer-проектов. Существующий вывод CLI
  в форматах JSON и table не изменён.
- `typescript/no-unsafe-assignment` не включён в основной набор правил, поскольку
  его срабатывания ограничены разбором JSON в тестах. Правила
  `no-empty-function`, `no-meaningless-void-operator` и `no-misused-spread`
  остаются включёнными.
- Русский язык закреплён как основной для документации, комментариев и новых
  записей в истории изменений. Технические идентификаторы сохраняют исходное
  написание.

### Исправлено

- Написанные вручную фабрики запросов CLI больше не заполняют устаревшие в
  исходном контракте FIGI-поля запросов и подписок. Совместимая опция `--figi`
  преобразуется только в `instrumentId`; устаревшие поля сохраняют значения по
  умолчанию protobuf и не попадают в сериализованные запросы.

## [0.4.2] - 2026-08-07

### Changed

- Updated direct dependencies to their current compatible releases, including
  `@bufbuild/protobuf` 2.13.0, `icore` 2.2.1, `nice-grpc` 2.1.17,
  `pwd-fs` 3.5.9, `@types/node` 26.1.2, `fwa` 2.1.3, and
  `ts-proto` 2.12.0.
- Replaced Biome with Oxlint `1.76.0` as the sole source linter. The explicit
  error-level rule set preserves the accepted project policy where Oxlint has
  an equivalent, generated contracts remain excluded, and formatting remains
  outside the lint command.
- Added a focused type-aware correctness ruleset through `oxlint-tsgolint`.
  Rules use their defaults except for the precise `node:test` safe-call
  allowance required by `no-floating-promises`.
- Standardized development and CI package management on npm. Replaced
  `yarn.lock` with committed `package-lock.json` and updated active project
  commands and documentation; alternative package managers are no longer
  supported.
- Reviewed and explicitly allowed the `protobufjs@7.6.5` postinstall script
  through a version-pinned `allowScripts` entry. Strict allow-scripts mode
  remains disabled.
- Removed repeated unit scenarios while preserving the owning behavioral and
  integration coverage. SDK runtime behavior and public contracts are
  unchanged.

## [0.4.1] - 2026-08-05

### Added

- Added `tls` to `SdkErrorSource` so Consumers can distinguish certificate
  verification failures from other transport availability failures.

### Fixed

- Classified known TLS certificate chain and hostname verification failures as
  `SdkErrorCode.Unavailable` with `source: 'tls'`, while preserving `path`,
  `details`, and the original `nice-grpc` error in `cause`. Provider and network
  `UNAVAILABLE` errors remain `source: 'grpc'`; retry policy remains
  Consumer-owned.

## [0.4.0] - 2026-08-05

This release changes the package identity and public SDK contract without
compatibility aliases. Consumers must update the Git dependency URL and tag,
the import specifier and `TInvest*` symbols, replace the former environment
variables with `T_INVEST_TOKEN` and `T_INVEST_ENDPOINT`, and regenerate their
lockfiles.

### Added

- Bundled the official Russian Trusted Root CA for T-Invest TLS channels and
  added the per-instance `tls.rootCertificates` PEM buffer override. Trust is
  scoped to the created gRPC channel; the SDK does not mutate the system trust
  store, use `NODE_EXTRA_CA_CERTS`, or download certificates during install or
  runtime.

### Changed

- Renamed the Git and package identity from `tinkoff-invest-node-sdk` to
  `t-invest-node-sdk` and changed the primary CLI binary and version output to
  the new name.
- Renamed the public facade to `TInvestNodeSDK` and all package-owned
  `TinkoffInvest*` contracts to their `TInvest*` counterparts without legacy
  aliases.
- Renamed the CLI environment contract to `T_INVEST_TOKEN` and
  `T_INVEST_ENDPOINT` without fallback to the former names.
- Changed the cross-copy `SdkError` brand to the new package identity. Errors
  from `0.3.x` and `0.4.x` are intentionally not recognized across versions.
- Updated Consumer guides, CLI help, repository links, architecture documents,
  and package metadata for the new identity. Upstream proto namespaces and
  generated contracts remain unchanged.

## [0.3.7] - 2026-07-30

### Changed

- Added detailed Consumer guides for safe SDK lifecycle, unary calls, streams
  and cancellation, error handling, and mock services through root exports.
  README now keeps one short quick start and links to the complete workflows.
- Added npm documentation metadata, included `docs/guides/**` in the package,
  and excluded contributor-only `docs/policy/**`. Links from packaged
  documentation to excluded repository files now point to GitHub.
- Updated the development compiler from TypeScript `6.0.3` to `7.0.2`.
  Compiler options, package runtime dependencies, and runtime behavior remain
  unchanged.
- Updated `pwd-fs` to `3.5.8`, aligning the runtime dependency with its
  TypeScript 7 release while preserving its public CommonJS contract.
- Replaced ESLint with Biome `2.5.6`. Equivalent rules retain error severity,
  formatting and assists remain disabled, and generated contracts remain
  outside the lint boundary. Biome has no direct equivalents for
  `no-invalid-regexp`, `no-unexpected-multiline`, and
  `@typescript-eslint/triple-slash-reference`.
- Updated `icore` to `2.2.0` and `fwa` to `2.1.0`. The lightweight
  empty-registry `TerminalApp` used by global CLI shortcuts is now explicitly
  supported upstream, while command execution and the existing `fwa --prune`
  workflow remain unchanged.

## [0.3.6] - 2026-07-29

### Changed

- Updated `icore` to `2.1.0` and the `fwa` test runner to `2.0.7`.
- Restricted package imports to the documented root entrypoint.
- Made the `version` command reject extra positional arguments as a usage
  error.
- Deferred loading the CLI command registry until command execution so global
  help and version shortcuts do not initialize API commands or generated
  contracts.
- Reorganized CLI, SDK configuration, and gRPC transport tests around their
  owning production modules and observable contracts.
- Consolidated shared instrument and comma-separated option coverage, and
  removed repeated unit checks for passthrough command helpers. Public package
  exports, CLI behavior, and SDK runtime semantics remain unchanged.
- Clarified that `SdkError.code` contains a standard symbolic non-OK gRPC status
  for errors with `source: 'grpc'`, while `source` distinguishes provider
  failures from local SDK errors.

### Fixed

- Preserved SDK-owned authorization and application metadata when Consumer
  call metadata is provided.
- Kept TLS and unary throttling defaults enabled when optional instance flags
  are explicitly `undefined`.
- Rejected blank SDK credentials and endpoint values at the SDK and CLI
  boundaries.
- Made global CLI shortcut paths reject unsupported options with exit code `2`.

### Security

- Excluded local `.env` credentials from Git and package archives.

## [0.3.5] - 2026-07-28

### Fixed

- Preserved the full unary throttling interval after delayed timer callbacks so
  queued calls cannot be dispatched in a burst when the event loop resumes.
- Made `stream run` cancel its pending transport read before iterator cleanup
  when `durationMs` or `idleTimeoutMs` expires, preventing quiet streams from
  hanging during timeout shutdown.

## [0.3.4] - 2026-07-28

### Added

- Added the public `SdkError`, `SdkErrorCode`, `SdkErrorSource`, and
  `isSdkError()` contracts. Unary and streaming gRPC failures now expose stable
  SDK codes while retaining the original transport error as `cause`.

### Changed

- Updated `icore` to `2.0.5`, bound the shared CLI command context, result, and
  metadata contracts once through `createCommand.withTypes()`, and derived the
  compatibility alias decorator's definition type from that bound builder.
- Made `TinkoffInvestNodeSDK.close()` idempotent. Service access and calls
  through previously obtained clients now fail with `SdkErrorCode.SdkClosed`
  after shutdown, while already delegated transport calls remain
  caller-cancellable through their own `AbortSignal`.

### Fixed

- Made `TinkoffInvestCallOptions.signal` cancel local unary throttle waiting.
  A call cancelled while waiting is removed from its quota bucket so the
  following call can use the released slot.

## [0.3.3] - 2026-07-25

### Changed

- Updated `icore` to `2.0.4` and replaced the local application usage-error
  class and manual category check with the public `CliUsageError` and
  `isUsageError()` contracts. Cross-copy errors now retain the established CLI
  rendering and exit-code policy.
- Simplified `version`, `--version`, and `-v` output to one package-version
  line.
- Typed the command registry output with the public `TerminalCommandOutput`
  contract; `TerminalApp.runPrepared()` remains responsible for runtime output
  narrowing and render-phase errors.
- Replaced expanded compatibility command definitions with first-class `icore`
  aliases: `name` and `path` now keep canonical identity, `matchedPath` records
  the invoked path, and registry names contain preferred commands only.
- Declared `-h` and `-v` through native `icore` option aliases and rejected the
  undocumented `--h` and `--v` long forms as usage errors.
- Delegated complete candles CSV document rendering to the public
  `renderCsv()` primitive without changing its output contract.

## [0.3.2] - 2026-07-24

### Changed

- Marked the package as private and documented version-pinned installation from
  its GitHub tag; this release is not published to the npm registry.
- Made the 4 MiB gRPC receive message limit an explicit package-owned transport
  policy instead of inheriting the implicit `grpc-js` default.
- Moved the `useSsl` and `trackLimits` SDK instance defaults into the typed
  package config without changing per-instance override behavior.

### Fixed

- Added the omitted SignalService root contracts and `sdk.signals` facade,
  including its package-owned unary limit policy.
- Classified `pwd-fs` as a runtime dependency so the package CLI can start
  after installation from GitHub.

## [0.3.1] - 2026-07-17

### Changed

- Split unary throttling into transport-specific gRPC rule resolution and a
  transport-neutral application scheduler.

### Fixed

- Rejected non-positive and non-finite unary limits after merging mutable
  public defaults with per-instance overrides.

## [0.3.0] - 2026-07-17

### Added

- Added package `bin` metadata for the `tinkoff-invest-node-sdk` CLI binary.
- Added per-instance unary limit overrides through
  `TinkoffInvestOptions.unaryLimits`, merged with package defaults when an SDK
  instance is created.
- Added `defineUnaryLimits()` and `UnaryLimitsDefinition` for readable nested
  service and method limit declarations without changing the flat runtime
  `UnaryLimits` contract.

### Changed

- Replaced executable package unary-limit declarations with one typed,
  human-readable config that compiles service fallbacks, method rules, and
  shared quota groups into the compatible flat runtime policy.
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

- Restored the generated `OrderType` enum in the root package exports.
- Synchronized the public SDK service interfaces with the active generated
  service definitions, restoring typed access to 33 RPC methods.
- Updated default unary throttling with current service and method-specific
  T-Invest limits, including low-limit instrument lists and operation reports.
- Isolated unary throttling schedules by quota bucket so unrelated services no
  longer delay each other while methods with one shared quota remain
  aggregated.
- Matched unary service fallbacks by exact generated service name so
  `OrdersService` no longer catches `StopOrdersService` paths.
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
