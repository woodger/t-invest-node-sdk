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
- throttling policy implementation: `src/application/services/unary-throttle.service.ts`, `src/config.ts` и `src/config.types.ts`;
- CLI entrypoint: `src/bootstrap/cli.ts`, `src/bootstrap/args/**`, `src/bootstrap/command-registry.ts`, `src/bootstrap/commands/**`, `src/bootstrap/help/**`, `src/bootstrap/version.ts`;
- proto generation entrypoint: `src/bootstrap/compile-proto.ts`;
- CLI rendering/output mechanics: `src/infrastructure/renderers/**`, `src/infrastructure/output/**`;
- proto wire contracts: `contracts/*.proto`;
- generated exports: `src/generated-exports.ts` и `src/generated/**`;
- test runner contract: `src/suite.ts`;
- package scripts: `package.json`.

Markdown должен объяснять, где находится актуальный контракт и как с ним работать.

## Generated code и proto

Контракт внешнего API в первую очередь живет в `contracts/*.proto`.

Если меняется proto workflow, documentation update должен объяснить:

- какой script запускать;
- какой generated code обновляется;
- какие файлы являются source contracts;
- какие файлы нельзя редактировать вручную.

Нельзя вручную документировать полный список generated methods, enum'ов и DTO, если они уже живут в proto/generated source.

## Тесты

Правила тестирования живут в:

- [Политика тестирования](./testing-policy.md);
- [Политика комментариев в тестах](./test-comment-style.md).

Если меняется test runner, stale artifact behavior или порядок запуска тестов, нужно обновить:

- `src/suite.ts`;
- tests runner helper-ов;
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
