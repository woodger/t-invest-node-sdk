# Документация проекта

> Type: Navigation. Здесь собраны ссылки на актуальные документы. Пользовательские контракты остаются в README, коде, CLI help и tests.

## Начать отсюда

- Пользовательская установка, быстрый старт, SDK options и release workflow: [README](../readme.md).
- Законченные сценарии работы с SDK, потоками, ошибками и Consumer-тестами: [Руководства для Consumer-ов](./guides/index.md).
- История версий и инструкции по миграции: [CHANGELOG](../CHANGELOG.md).
- Текущая карта слоев и ownership: [Архитектура SDK](./architecture.md).
- Правила внесения изменений: [Политики проекта](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/index.md).

## CLI

- Поддерживаемые команды, preferred paths и compatibility aliases: [API-команды](./clean-architecture/api-commands.md).
- Контракт `stream run`: [Справочник потокового CLI](./cli-stream-reference.md).
- JSON-конфигурация streaming-команд: [Справочник конфигурации потокового CLI](./cli-stream-configuration.md).
- Границы command-specific formatting, render primitives и terminal output: [Разделение форматирования и вывода в CLI](./clean-architecture/cli-output-boundaries.md).

Актуальные команды и опции также показывает встроенный `--help`. Runtime-контракт CLI задают `src/bootstrap/cli/**`, `src/bootstrap/commands/**` и соответствующие tests.

## Руководства

- [Первый SDK-вызов](./guides/getting-started.md).
- [Unary-вызовы](./guides/unary-calls.md).
- [Потоки и отмена](./guides/streams-and-cancellation.md).
- [Ошибки и lifecycle](./guides/errors-and-lifecycle.md).
- [Собственная реализация unary limiter-а](./guides/custom-unary-limiter.md).
- [Mock-сервисы через public exports](./guides/testing-with-service-definitions.md).

В guides разобраны законченные Consumer workflows. Полный список методов, DTO и enum доступен в public types и proto/generated contracts.

## SDK и runtime policies

- Публичный package entrypoint: [`src/index.ts`](https://github.com/woodger/t-invest-node-sdk/blob/main/src/index.ts).
- Лимиты provider-а, unary limiter port и quota buckets: [Лимитная политика](./limits-policy.md).
- Bundled CA, per-instance trust override и границы TLS policy: [TLS-доверие](./tls-policy.md).
- Происхождение, границы распространения и техническое подключение bundled CA: [Встроенный Russian Trusted Root CA](./bundled-ca.md).
- Архитектурные заметки по application, DTO, отчётам и адаптерам: [Заметки по Clean Architecture](./clean-architecture/index.md).
- Граница project adapters и внешнего API `icore`: [Адаптеры](./clean-architecture/adapters.md).
- Неутверждённые варианты будущих изменений: [Roadmap и рабочие идеи](./roadmap.md).

## Proto и generated contracts

Процесс генерации описан в разделе [«Генерация proto»](../readme.md#генерация-proto). [`contracts/upstream.json`](https://github.com/woodger/t-invest-node-sdk/blob/main/contracts/upstream.json) хранит официальный upstream и закреплённые tag и commit. Актуальные wire-контракты находятся в `contracts/*.proto`, а generated sources — в `src/generated/**`; Markdown не дублирует их как отдельный справочник.

## Источники истины

Подробные правила выбора источника истины и обновления документации: [Политика документации](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/documentation-policy.md).

Кратко:

- public exports задаёт [`src/index.ts`](https://github.com/woodger/t-invest-node-sdk/blob/main/src/index.ts);
- scripts и версии зависимостей задаёт [`package.json`](../package.json);
- поведение CLI задают runtime source и tests;
- wire API задают vendored proto contracts и upstream metadata;
- Markdown объясняет workflows и границы, а также указывает путь к актуальному контракту.
