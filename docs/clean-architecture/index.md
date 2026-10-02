# Заметки по Clean Architecture

> Type: Navigation. Здесь собраны адаптированные для компактного SDK заметки по Clean Architecture из Inventory.

Фактическая карта слоёв приведена в документе [«Архитектура SDK»](../architecture.md).

Ограничения и направление зависимостей задаёт [архитектурная политика](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/architecture.md).

## Зачем этот раздел

Текущий SDK меньше Inventory: здесь нет отдельного `domain`, `application/use-cases`, HTTP transport и dataset pipeline. Слои `application`, `infrastructure` и `bootstrap` обслуживают SDK facade и CLI-команды. Публичный port `TInvestUnaryLimiter` находится в `application/services`; отдельного каталога `ports` нет.

Этот раздел решает две задачи:

- объяснить, как применять Clean Architecture Lite к текущей структуре;
- показать, куда развивать `commands`-слой, если CLI formatting и adapters начнут расти.

## Документы

- [Application-слой, DTO и отчёты](./application.md) - contracts, reusable правила и mapping между boundaries.
- [API-команды](./api-commands.md) - текущий CLI flow и границы command layer; пользовательский список команд находится в [справочнике CLI](../cli-reference.md).
- [Адаптеры, форматирование и вывод в CLI](./cli-output-boundaries.md) - project adapters, направление зависимостей, command-specific formatting, generic primitives и terminal output.
- [Справочник потокового CLI](../cli-stream-reference.md) - текущий контракт `stream run`.
- [Справочник конфигурации потокового CLI](../cli-stream-configuration.md) - JSON config для stream CLI.

## Текущая карта

Актуальная карта слоёв и ownership поддерживается в [архитектуре SDK](../architecture.md#карта-слоев). SDK оборачивает generated gRPC contracts и не содержит самостоятельной provider-neutral доменной модели.

## Главная идея

Выбирайте слой по ответственности, а не по удобству imports:

- `application` описывает стабильные контракты и reusable application rules;
- `infrastructure` содержит внешние технологии и adapters;
- `bootstrap` собирает runtime entrypoints, связывает зависимости и интегрирует публичный API `icore` с project-owned CLI contracts;
- `generated` содержит proto-generated contracts в плоском source layout; вручную этот код не редактируется;
- `bootstrap/generated-exports.ts` остается generated DTO/enums и server-side contracts public export exception.

Если новая логика не укладывается в эту карту, сначала уточните архитектурное намерение и обновите документацию.
