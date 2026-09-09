# Политика документации

> Type: Policy. Здесь описано, как выбирать source of truth для документации и не дублировать кодовые контракты в постоянных reference-страницах.

## Назначение

Документация должна вести к актуальному контракту, а не создавать рядом с кодом второй источник истины.

Если контракт уже задан runtime-механизмом, source file, proto contract или tests, Markdown должен ссылаться на него и объяснять работу с ним, а не копировать полный reference.

## Язык

Основной язык документации и новых записей в `CHANGELOG.md` — русский. Имена API, идентификаторы, команды, значения параметров и устойчивые технические термины сохраняются в исходном написании, если перевод снижает точность.

## Форматирование строк

Записывайте обычный абзац и продолжение одного пункта списка одной физической строкой, без ручного переноса по ширине. Начинайте новую строку только для нового элемента структуры Markdown: абзаца, заголовка, пункта списка, blockquote, таблицы или блока кода. Не используйте Markdown hard break через пробелы в конце строки и любые другие trailing spaces.

## Источники истины

Источники истины SDK:

- public package entrypoint: `src/index.ts`;
- SDK client API: `src/bootstrap/t-invest-node-sdk.ts`;
- application report contracts: `src/application/reports/**`;
- Clean Architecture design notes: `docs/clean-architecture/**`;
- runtime gRPC internals: `src/infrastructure/transport/grpc/**`;
- bundled TLS trust material: `certificates/russian-trusted-root-ca.pem`;
- unary quota source policy: `src/config.ts`;
- authoring и public runtime type contracts: `src/config.types.ts`;
- per-instance SDK config input: `src/application/dto/t-invest-options.ts`;
- public SDK error contract: `src/application/errors/sdk-error.ts`;
- unary config compilation и readable override shape adapter: `src/bootstrap/unary-limit-config.ts`;
- public `defaultConfig` и override resolution: `src/bootstrap/sdk-config.ts`;
- public unary limiter port и необязательная process-local реализация: `src/application/services/unary-limiter.ts`;
- transport-specific unary rule paths и resolution: `src/infrastructure/transport/grpc/unary-method-path.ts`, `src/infrastructure/transport/grpc/unary-limit-resolver.ts`;
- CLI entrypoint: `src/bootstrap/index.ts`, `src/bootstrap/cli/**`, `src/bootstrap/args/**`, `src/bootstrap/commands/**`;
- proto generation entrypoint: `src/bootstrap/commands/compile-proto/cli.ts` и `src/bootstrap/proto/compile-proto.ts`;
- CLI presentation/output mechanics: command-specific presentation в `src/bootstrap/commands/*/reporter.ts`, integration wiring в `src/bootstrap/cli/runner.ts` и публичный API `icore` версии из `package.json`;
- proto wire contracts: `contracts/*.proto`;
- proto upstream metadata: `contracts/upstream.json`;
- generated exports: `src/bootstrap/generated-exports.ts` и `src/generated/**`;
- test runner contract: `package.json` `test` script and `fwa` package behavior;
- package scripts: `package.json`.

Markdown должен указывать, где находится актуальный контракт и как с ним работать.

## Сгенерированный код и proto

Официальный контракт внешнего API находится в upstream, указанном в `contracts/upstream.json`. Его воспроизводимый локальный snapshot хранится в `contracts/*.proto`.

При изменении proto workflow документация должна объяснять:

- какой script запускать;
- какой generated code обновляется;
- где зафиксирован upstream source commit/release;
- где зафиксированы источники и выпуски вспомогательных proto contracts;
- как плоский upstream layout отображается в локальную структуру;
- какие файлы являются source contracts;
- какие файлы нельзя редактировать вручную.

Нельзя вручную документировать полный список generated methods, enum'ов и DTO, если они уже живут в proto/generated source.

## Тесты

Правила тестирования живут в:

- [Политика тестирования](./testing-policy.md);
- [Политика комментариев в тестах](./test-comment-style.md).

При изменении test runner, stale artifact behavior или порядка запуска тестов обновите:

- `package.json` `test` script;
- [Политика тестирования](./testing-policy.md);
- README summary, если меняется пользовательская команда.

Нельзя обновлять только Markdown reference, оставляя runner behavior устаревшим.

## Когда нужен отдельный Markdown-документ

Отдельный документ уместен, если он объясняет:

- workflow;
- architecture boundary;
- operational practice;
- policy;
- external API assumptions;
- связь runtime behavior с внешней документацией.

Не создавайте отдельный документ, если он просто переписывает:

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
