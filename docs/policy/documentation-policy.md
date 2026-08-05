# Политика документации

> Type: Policy. Этот документ задает правила выбора source of truth для документации и запрещает дублировать кодовые контракты в постоянных reference-страницах.

## Назначение

Документация должна помогать найти актуальный контракт, а не создавать второй источник истины рядом с кодом.

Если контракт уже выражен runtime-механизмом, source file, proto contract или tests, Markdown-документ должен ссылаться на этот источник и объяснять маршрут работы, а не копировать полный reference.

## Source of truth

Для SDK действуют следующие источники истины:

- public package entrypoint: `src/index.ts`;
- SDK client API: `src/bootstrap/tinkoff-invest-node-sdk.ts`;
- application report contracts: `src/application/reports/**`;
- Clean Architecture design notes: `docs/clean-architecture/**`;
- runtime gRPC internals: `src/infrastructure/transport/grpc/**`;
- bundled TLS trust material: `certificates/russian-trusted-root-ca.pem`;
- unary throttling source policy: `src/config.ts`;
- authoring и public runtime type contracts: `src/config.types.ts`;
- per-instance SDK config input:
  `src/application/dto/tinkoff-invest-options.ts`;
- public SDK error contract: `src/application/errors/sdk-error.ts`;
- unary config compilation и readable override shape adapter:
  `src/bootstrap/unary-limit-config.ts`;
- public `defaultConfig` и override resolution: `src/bootstrap/sdk-config.ts`;
- transport-neutral throttling runtime:
  `src/application/services/unary-throttle.service.ts`;
- transport-specific unary rule paths и resolution:
  `src/infrastructure/transport/grpc/unary-limits.ts`,
  `src/infrastructure/transport/grpc/unary-limit-resolver.ts`;
- CLI entrypoint: `src/bootstrap/index.ts`, `src/bootstrap/cli/**`, `src/bootstrap/args/**`, `src/bootstrap/commands/**`;
- proto generation entrypoint: `src/bootstrap/commands/compile-proto/cli.ts` и `src/bootstrap/proto/compile-proto.ts`;
- CLI presentation/output mechanics: command-specific presentation в `src/bootstrap/commands/*/reporter.ts`, integration wiring в `src/bootstrap/cli/runner.ts` и публичный API `icore` версии из `package.json`;
- proto wire contracts: `contracts/*.proto`;
- proto upstream metadata: `contracts/upstream.json`;
- generated exports: `src/bootstrap/generated-exports.ts` и `src/generated/**`;
- test runner contract: `package.json` `test` script and `fwa` package behavior;
- package scripts: `package.json`.

Markdown должен объяснять, где находится актуальный контракт и как с ним работать.

## Generated code и proto

Официальный контракт внешнего API живет в upstream, зафиксированном в
`contracts/upstream.json`. Воспроизводимый локальный snapshot хранится в
`contracts/*.proto`.

Если меняется proto workflow, documentation update должен объяснить:

- какой script запускать;
- какой generated code обновляется;
- где зафиксирован upstream source commit/release;
- как плоский upstream layout отображается в локальную структуру;
- какие файлы являются source contracts;
- какие файлы нельзя редактировать вручную.

Нельзя вручную документировать полный список generated methods, enum'ов и DTO, если они уже живут в proto/generated source.

## Тесты

Правила тестирования живут в:

- [Политика тестирования](./testing-policy.md);
- [Политика комментариев в тестах](./test-comment-style.md).

Если меняется test runner, stale artifact behavior или порядок запуска тестов, нужно обновить:

- `package.json` `test` script;
- [Политика тестирования](./testing-policy.md);
- README summary, если меняется пользовательская команда.

Нельзя обновлять только Markdown reference, оставляя runner behavior устаревшим.

## Когда нужен отдельный Markdown-документ

Отдельный документ допустим, если он объясняет:

- workflow;
- architecture boundary;
- operational practice;
- policy;
- external API assumptions;
- связь runtime behavior с внешней документацией.

Отдельный документ не нужен, если он просто переписывает:

- полный public API из `src/index.ts`;
- generated DTO и enum'ы;
- package scripts без дополнительных правил;
- тестовые команды без контекста;
- кодовые comments.

## README и docs

README должен оставаться кратким входом в проект:

- установка;
- быстрый старт;
- основные ссылки;
- важные workflow.

Подробные правила и политики должны жить в `docs/`.

`docs/index.md` должен быть навигационной точкой, а не вторым README.

## Минимальное правило

Markdown должен отвечать на вопрос "где актуальный контракт и как с ним работать".

Сам контракт должен жить там, где его проверяет runtime, types, proto или tests.
