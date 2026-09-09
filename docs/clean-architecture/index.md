# Заметки по Clean Architecture

> Type: Navigation. Здесь собраны адаптированные для компактного SDK заметки по Clean Architecture из Inventory.

Фактическая карта слоёв приведена в документе [«Архитектура SDK»](../architecture.md).

Ограничения и направление зависимостей задаёт [архитектурная политика](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/architecture.md).

## Зачем этот раздел

Текущий SDK меньше Inventory: здесь пока нет `domain`, `use-cases`, `ports`, HTTP transport и dataset pipeline. Но уже появились `application`, `infrastructure`, `bootstrap` и первые API-команды CLI.

Этот раздел решает две задачи:

- объяснить, как применять Clean Architecture Lite к текущей структуре;
- показать, куда развивать `commands`-слой, если CLI formatting и adapters начнут расти.

## Документы

- [Application-слой](./application.md) - роль `application` в текущем SDK.
- [DTO и Reports](./dto.md) - где живут boundary contracts.
- [API-команды](./api-commands.md) - текущий CLI flow и границы command layer.
- [Adapters](./adapters.md) - место project adapters и граница с `icore`.
- [Разделение форматирования и вывода в CLI](./cli-output-boundaries.md) - границы command-specific formatting, generic primitives и terminal output.
- [Справочник потокового CLI](../cli-stream-reference.md) - текущий контракт `stream run` и будущие stream-расширения.
- [Справочник конфигурации потокового CLI](../cli-stream-configuration.md) - JSON config для stream CLI.

## Текущая карта

```text
src/application
  dto/
  errors/
  reports/
  services/

src/infrastructure
  interceptor/
  report-values.ts
  transport/
    grpc/

src/bootstrap
  index.ts
  args/
  cli/
    contract.ts
    error.ts
    help-catalog.ts
    help.ts
    registry.ts
    runner.ts
    version.ts
  commands/
  proto/
    compile-proto.ts
  t-invest-node-sdk.ts

external dependency
  icore
    option/command mechanics
    JSON/CSV-row/table primitives
    TerminalApp/Output
```

Отдельного `domain` пока нет: SDK в основном оборачивает generated gRPC contracts и не содержит самостоятельной provider-neutral доменной модели.

## Главная идея

Выбирайте слой по ответственности, а не по удобству imports:

- `application` описывает стабильные контракты и reusable application rules;
- `infrastructure` содержит внешние технологии и adapters;
- `bootstrap` собирает runtime entrypoints, связывает зависимости и интегрирует публичный API `icore` с project-owned CLI contracts;
- `generated` содержит proto-generated contracts в плоском source layout; вручную этот код не редактируется;
- `bootstrap/generated-exports.ts` остается generated DTO/enums и server-side contracts public export exception.

Если новая логика не укладывается в эту карту, сначала уточните архитектурное намерение и обновите документацию.
