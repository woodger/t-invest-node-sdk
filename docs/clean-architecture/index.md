# Clean Architecture Notes

> Type: Navigation. Этот раздел переносит и адаптирует Clean Architecture notes
> из Inventory под текущий компактный SDK.

Canonical source of truth по фактической карте слоев:
[Архитектура SDK](../architecture.md).

Policy source of truth по ограничениям и направлению зависимостей:
[Архитектурная политика](../policy/architecture.md).

## Зачем Этот Раздел

Текущий SDK меньше Inventory: здесь пока нет `domain`, `use-cases`,
`ports`, HTTP transport и dataset pipeline. Но уже появились `application`,
`infrastructure`, `bootstrap` и первые API-команды CLI.

Эти notes нужны для двух задач:

- объяснить, как применять Clean Architecture Lite к текущей структуре;
- зафиксировать, куда двигать `commands`-слой, если CLI formatting и adapters
  начнут расти.

## Документы

- [Application](./application.md) - роль `application` в текущем SDK.
- [DTO и Reports](./dto.md) - где живут boundary contracts.
- [API Commands](./api-commands.md) - текущий CLI flow и границы command layer.
- [Adapters](./adapters.md) - место CLI adapters, renderers и stdout sink.
- [Разделение форматирования и вывода в CLI](./cli-output-boundaries.md) -
  границы JSON/CSV/table formatting и записи в stdout.
- [Stream CLI Reference](../cli-stream-reference.md) - текущий контракт
  `stream run` и будущие stream-расширения.
- [Stream CLI Configuration Reference](../cli-stream-configuration.md) -
  JSON config для stream CLI.

## Текущая Карта

```text
src/application
  dto/
  reports/
  services/

src/infrastructure
  transport/
    grpc/
  output/
  renderers/

src/bootstrap
  args/
  bin/
    cli.ts
  cli/
    contract.ts
    error.ts
    help.ts
    registry.ts
    runner.ts
    usage-error.ts
    version.ts
  commands/
  proto/
    compile-proto.ts
  tinkoff-invest-node-sdk.ts
```

`domain` пока не выделен: SDK сейчас в основном оборачивает generated gRPC
contracts и не содержит самостоятельную provider-neutral доменную модель.

## Главная Идея

Слой должен выбираться по ответственности, а не по удобству imports:

- `application` описывает стабильные контракты и reusable application rules;
- `infrastructure` содержит внешние технологии и adapters;
- `bootstrap` собирает runtime entrypoints и связывает зависимости;
- `generated` содержит proto-generated contracts в плоском source layout и не редактируется вручную;
- `bootstrap/generated-exports.ts` остается generated DTO/enums и server-side contracts public export exception.

Если новая логика не укладывается в эту карту, нужно сначала уточнить
архитектурное намерение и обновить документацию.
