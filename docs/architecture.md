# Архитектура SDK

> Type: Reference. Этот документ фиксирует текущую карту слоев SDK и служит
> practical companion к [архитектурной политике](./policy/architecture.md).

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

- `infrastructure/grpc` - создание `nice-grpc` channel, metadata, middleware и
  typed clients.

Здесь допустимы imports из `nice-grpc`, generated service definitions и
application services. Application не должен импортировать concrete
infrastructure modules.

## `bootstrap`

`bootstrap` собирает runtime entrypoints.

Текущие зоны:

- `bootstrap/tinkoff-invest-node-sdk.ts` - публичный runtime facade SDK;
- `bootstrap/args` - reusable guards и normalizers для CLI options;
- `bootstrap/cli` - CLI entrypoint layer;
- `bootstrap/commands` - handlers CLI-команд;
- `bootstrap/commands/*/reporter.ts` - presentation formatting application
  report contracts;
- `bootstrap/help` - декларативный help registry и renderer;
- `bootstrap/table-renderer.ts` - общий renderer простых plain-text таблиц для
  CLI presentation layer;
- `bootstrap/command-registry.ts` - связывание command name с handler;
- `bootstrap/version.ts` - presentation-контракт версии.

CLI слой сейчас поддерживает `help`, `version`, `accounts`, `candles` и ошибку
для неизвестных команд. API-команды остаются тонкими bootstrap handlers:
они валидируют CLI-контракт, создают SDK facade и передают provider response в
reporter-модуль. Reporter-ы преобразуют generated DTO в
`application/reports` contracts и форматируют вывод для CLI.

`bootstrap/args` не вызывает SDK и не создает gRPC-клиенты. Он только проверяет
primitive CLI-контракты и нормализует общие `TinkoffInvestOptions` из CLI/ENV.

## Public Compatibility Entrypoints

Корневые файлы сохраняют совместимость существующих imports:

- `src/index.ts` - основной package entrypoint;
- `src/config.ts` - публичная конфигурация unary limits;
- `src/tinkoff-invest-node-sdk.ts` - re-export публичного SDK facade и options;
- `src/sdk-internals.ts` - compatibility re-export для gRPC internals;
- `src/throttle.ts` - compatibility re-export throttling service.

Новый код должен импортировать реализацию из слоя-владельца, а не из
compatibility wrappers.

## Generated Code

`src/generated/**` воспроизводится из `contracts/*.proto` и не редактируется
вручную.

Публичные generated exports собраны в `src/generated-exports.ts`.
