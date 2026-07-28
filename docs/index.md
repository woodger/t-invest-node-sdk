# Документация проекта

> Type: Navigation. Эта страница помогает выбрать актуальный документ и не
> дублирует пользовательские контракты из README, кода, CLI help или tests.

## Начать отсюда

- Пользовательская установка, быстрый старт, SDK options, примеры и release
  workflow: [README](../readme.md).
- История версий и инструкции по миграции:
  [CHANGELOG](../CHANGELOG.md).
- Текущая карта слоев и ownership:
  [Архитектура SDK](./architecture.md).
- Правила внесения изменений:
  [Политики проекта](./policy/index.md).

## CLI

- Поддерживаемые команды, preferred paths и compatibility aliases:
  [API Commands](./clean-architecture/api-commands.md).
- Контракт `stream run`:
  [Stream CLI Reference](./cli-stream-reference.md).
- JSON-конфигурация streaming-команд:
  [Stream CLI Configuration Reference](./cli-stream-configuration.md).
- Границы command-specific formatting, render primitives и terminal output:
  [Разделение форматирования и вывода в CLI](./clean-architecture/cli-output-boundaries.md).

Актуальные команды и опции также доступны через встроенный `--help`. Runtime
контракт CLI принадлежит `src/bootstrap/cli/**`,
`src/bootstrap/commands/**` и соответствующим tests.

## SDK и runtime policies

- Публичный package entrypoint: [`src/index.ts`](../src/index.ts).
- Лимиты provider-а, локальный throttling и quota buckets:
  [Лимитная политика](./limits-policy.md).
- Design notes по application, DTO/reports и adapters:
  [Clean Architecture Notes](./clean-architecture/index.md).
- Граница project adapters и внешнего API `icore`:
  [Adapters](./clean-architecture/adapters.md).

## Proto и generated contracts

Workflow генерации описан в разделе
[«Генерация proto»](../readme.md#генерация-proto). Официальный upstream,
зафиксированные tag и commit хранятся в
[`contracts/upstream.json`](../contracts/upstream.json). Wire contracts в
`contracts/*.proto` и generated sources в `src/generated/**` не заменяются
ручным Markdown reference.

## Source of truth

Подробные правила выбора источника истины и обновления документации:
[Политика документации](./policy/documentation-policy.md).

Кратко:

- public exports определяет [`src/index.ts`](../src/index.ts);
- scripts и dependency versions определяет
  [`package.json`](../package.json);
- CLI behavior определяют runtime source и tests;
- wire API определяют vendored proto contracts и upstream metadata;
- Markdown объясняет workflow, границы и маршрут к актуальному контракту.
