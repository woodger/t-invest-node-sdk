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
    compile-proto.ts
  cli-runner.ts
  command-registry.ts
  commands/
  help/
  tinkoff-invest-node-sdk.ts
```

`domain` пока не выделен: SDK сейчас в основном оборачивает generated gRPC
contracts и не содержит самостоятельную provider-neutral доменную модель.

## Главная Идея

Слой должен выбираться по ответственности, а не по удобству imports:

- `application` описывает стабильные контракты и reusable application rules;
- `infrastructure` содержит внешние технологии и adapters;
- `bootstrap` собирает runtime entrypoints и связывает зависимости;
- `generated` содержит proto-generated contracts и не редактируется вручную;
- `generated-exports.ts` остается top-level generated public export exception.

Если новая логика не укладывается в эту карту, нужно сначала уточнить
архитектурное намерение и обновить документацию.
