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
- `bootstrap/cli` - CLI entrypoint layer;
- `bootstrap/commands` - handlers CLI-команд;
- `bootstrap/help` - декларативный help registry и renderer;
- `bootstrap/command-registry.ts` - связывание command name с handler;
- `bootstrap/version.ts` - presentation-контракт версии.

CLI слой сейчас намеренно минимален: он поддерживает `help`, `version` и ошибку
для неизвестных команд. SDK-команды для работы с T-Invest API не добавлены,
потому что отдельные CLI use-cases еще не определены.

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
