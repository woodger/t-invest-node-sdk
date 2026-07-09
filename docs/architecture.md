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

src/generated/t_tech/invest/grpc
  -> generated proto contracts in upstream layout
```

`src/domain` сейчас не выделен: в SDK нет самостоятельной доменной модели,
отделенной от gRPC contract. Добавлять `domain` нужно только вместе с реальными
provider-neutral правилами или моделями.

## `application`

`application` содержит contracts и reusable правила, которые не должны знать о
`nice-grpc`.

Текущие зоны:

- `application/dto` - входные SDK options и другие application-level contracts;
- `application/dto/tinkoff-invest-services.ts` - публичные package-owned
  service interfaces SDK facade, отделенные от generated `*ServiceClient`;
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
- `infrastructure/report-values.ts` - общие scalar adapters для преобразования
  provider DTO значений вроде `MoneyValue`, `Quotation` и `Date` в стабильные
  report values. `MoneyValue` становится структурным `ReportMoney`, а
  command-specific table/text представление строится отдельно. Здесь не
  выбираются поля команд и не формируются command-specific output contracts.
- `infrastructure/output` - технические sinks для записи готового текста в
  `stdout` и `stderr`.

Здесь допустимы imports из `nice-grpc`, generated service definitions и
application services. Application не должен импортировать concrete
infrastructure modules.

## `bootstrap`

Runtime entrypoints разделены между публичными package entrypoints и
bootstrap-механикой.

Текущие зоны:

- `bootstrap/index.ts` - executable CLI entrypoint, который публикуется как
  package binary `dist/bootstrap/index.js`;
- `bootstrap/tinkoff-invest-node-sdk.ts` - публичный runtime facade SDK;
- `bootstrap/proto/compile-proto.ts` - proto generation mechanics через системный
  `protoc` и локальный `ts-proto` plugin;
- `bootstrap/args` - reusable guards и normalizers для CLI options;
- `bootstrap/cli` - CLI contract, registry, help, version, error formatting и
  runner layer;
- `bootstrap/commands` - handlers CLI-команд;
- `bootstrap/commands/*/reporter.ts` - presentation formatting application
  report contracts;

CLI слой сейчас поддерживает utility-команды `help`, `version` и API-команды
в preferred friendly форме `<domain> <resource/action>`. Публичные domains:
`account`, `instrument`, `market`, `order`, `stop-order`, `operation`,
`sandbox`, `stream`, `dev`. Proto generation доступен как
`dev compile-proto`.

Technical и legacy paths вида `account get-accounts`, `users get-accounts`,
`market get-candles`, `marketdata get-candles`, `instrument shares`,
`instruments shares`, `order post-order`, `orders post-order`,
`stop-order get-stop-orders`, `stoporders get-stop-orders`,
`operation get-portfolio`, `operations get-portfolio`,
`sandbox get-sandbox-accounts` и `compile-proto` остаются совместимыми aliases,
но help продвигает только preferred paths.

API-команды остаются тонкими bootstrap handlers:
`icore` terminal app валидирует raw CLI args и передает handler-у typed command options.
Command `cli.ts` создает generated request DTO из typed options, создает SDK
facade и передает provider response в reporter-модуль. Reporter-ы преобразуют generated DTO в
`application/reports` contracts, выбирают command-specific представление и
используют `infrastructure/renderers` для технического JSON/CSV/table
rendering.

`bootstrap/args` не вызывает SDK и не создает gRPC-клиенты. Он только проверяет
primitive CLI-контракты и нормализует общие `TinkoffInvestOptions` из CLI/ENV.

## Public Entrypoints

Корневые файлы держат только package entrypoint, runtime config и generated
exports exception. Public service interfaces экспортируются из application DTO.
Generated server-side service definitions/implementation types входят в root
public surface для nice-grpc server adapters; generated service clients остаются
внутри bootstrap/infrastructure:

- `src/index.ts` - основной package entrypoint;
- `src/config.ts` - публичная конфигурация unary limits;
- `src/config.types.ts` - типы публичной конфигурации;
- `src/bootstrap/generated-exports.ts` - aggregation layer для публичных generated exports.

Новый код должен импортировать реализацию из слоя-владельца. Root-level
compatibility wrappers не создаются.

## Generated Code

Raw proto-файлы хранятся без flattening в upstream layout
`contracts/t_tech/invest/grpc/**`. `src/generated/t_tech/invest/grpc/**`
зеркально воспроизводится из этого layout и не редактируется вручную.
`src/generated/**` и `src/bootstrap/generated-exports.ts` являются исключениями
из обычной слоевой структуры, потому что package entrypoint реэкспортирует
generated DTO/enums public API и server-side
`*ServiceDefinition` / `*ServiceImplementation` contracts. Generated
`*ServiceClient` contracts остаются внутренними transport contracts и не
являются root public exports.
