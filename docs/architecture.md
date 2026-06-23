# Архитектура SDK

> Type: Reference. Этот документ фиксирует текущую карту слоев SDK и служит
> practical companion к [архитектурной политике](./policy/architecture.md).
> Дополнительные design notes по развитию слоев находятся в
> [Clean Architecture Notes](./clean-architecture/index.md).

Проект использует Clean Architecture Lite. Слои выделяются только там, где у
кода есть самостоятельная ответственность.

## Карта слоев

```text
src/bootstrap
  -> src/infrastructure
  -> src/application

src/infrastructure
  -> src/application

src/application
  -> чистые DTO и application services

src/generated
  -> generated proto contracts
```

`src/domain` сейчас не выделен: в SDK нет самостоятельной доменной модели,
отделенной от gRPC contract. Добавлять `domain` нужно только вместе с реальными
provider-neutral правилами или моделями.

## `application`

`application` содержит contracts и reusable правила, которые не должны знать о
`nice-grpc`.

Текущие зоны:

- `application/dto` - входные SDK options и другие application-level contracts;
- `application/reports` - стабильные output/report contracts API-команд;
- `application/services` - reusable application services, например unary
  throttling.

## `infrastructure`

`infrastructure` содержит внешние технологии и adapter-level wiring.

Текущие зоны:

- `infrastructure/transport/grpc` - создание `nice-grpc` channel, metadata,
  middleware и typed clients.
- `infrastructure/renderers` - механический рендеринг готовых данных в JSON,
  CSV-строки и plain-text таблицы. Здесь не выбираются поля команд и не
  формируются command-specific output contracts.
- `infrastructure/output` - технические sinks для записи готового текста в
  `stdout` и `stderr`.

Здесь допустимы imports из `nice-grpc`, generated service definitions и
application services. Application не должен импортировать concrete
infrastructure modules.

## `bootstrap`

`bootstrap` собирает runtime entrypoints.

Текущие зоны:

- `bootstrap/tinkoff-invest-node-sdk.ts` - публичный runtime facade SDK;
- `bootstrap/compile-proto.ts` - package script entrypoint для proto generation
  через локальный compiler из `grpc-tools`;
- `bootstrap/args` - reusable guards и normalizers для CLI options;
- `bootstrap/cli.ts` - CLI entrypoint layer;
- `bootstrap/commands` - handlers CLI-команд;
- `bootstrap/commands/*/reporter.ts` - presentation formatting application
  report contracts;
- `bootstrap/help` - декларативный help registry и renderer;
- `bootstrap/command-registry.ts` - связывание command name с handler;
- `bootstrap/version.ts` - presentation-контракт версии.

CLI слой сейчас поддерживает `help`, `version` и API-команды в canonical форме
`<service> <method>`: `users get-accounts`, `users get-info`,
`users get-margin-attributes`, `users get-user-tariff`,
`marketdata get-candles`, `marketdata get-close-prices`,
`instruments find-instrument`, `instruments get-accrued-interests`,
`instruments get-bond-coupons`, `instruments bond-by`, `instruments bonds`,
`instruments get-brand-by`, `instruments get-brands`,
`instruments get-countries`, `instruments currencies`, `instruments currency-by`,
`instruments etf-by`, `instruments etfs`, `instruments get-dividends`, `instruments get-favorites`,
`instruments future-by`, `instruments futures`, `instruments get-futures-margin`,
`instruments get-instrument-by`,
`instruments share-by`, `instruments shares`, `instruments trading-schedules`,
`marketdata get-last-prices`,
`marketdata get-last-trades`,
`marketdata get-order-book`, `marketdata get-trading-status`,
`marketdata get-trading-statuses`, `orders get-orders`,
`orders get-order-state`, `operations get-operations`,
`operations get-operations-by-cursor`, `operations get-portfolio`,
`operations get-positions`, `operations get-withdraw-limits`,
`stoporders get-stop-orders`.
API-команды остаются тонкими bootstrap handlers:
они валидируют CLI-контракт, создают SDK facade и передают provider response в
reporter-модуль. Reporter-ы преобразуют generated DTO в
`application/reports` contracts, выбирают command-specific представление и
используют `infrastructure/renderers` для технического JSON/CSV/table
rendering.

`bootstrap/args` не вызывает SDK и не создает gRPC-клиенты. Он только проверяет
primitive CLI-контракты и нормализует общие `TinkoffInvestOptions` из CLI/ENV.

## Public Entrypoints

Корневые файлы держат только package entrypoint, runtime config и generated
exports exception:

- `src/index.ts` - основной package entrypoint;
- `src/config.ts` - публичная конфигурация unary limits;
- `src/config.types.ts` - типы публичной конфигурации;
- `src/generated-exports.ts` - aggregation layer для публичных generated exports.

Новый код должен импортировать реализацию из слоя-владельца. Root-level
compatibility wrappers не создаются.

## Generated Code

`src/generated/**` воспроизводится из `contracts/**/*.proto` и не редактируется
вручную. `src/generated/**` и `src/generated-exports.ts` являются
top-level исключением из компактной структуры `src`, потому что package
entrypoint реэкспортирует generated public API.
