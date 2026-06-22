# Adapters

> Type: Design Note. Документ фиксирует текущий placement adapters, renderers
> и output sinks в SDK.

## Контекст

В Clean Architecture adapters находятся на внешней стороне application. Они
преобразуют внутренние contracts в форму конкретного внешнего интерфейса и
обратно.

В Inventory CLI-команды живут в `bootstrap`, а технические интеграции вынесены
наружу. В текущем SDK используется такой же компактный вариант: command-specific
CLI reporter-ы остаются рядом с командами в `bootstrap`, а механический
rendering и output sinks вынесены в `infrastructure`.

Focused правила по JSON/CSV/table formatting и stdout delivery описаны в
[Разделение форматирования и вывода в CLI](./cli-output-boundaries.md).

## Текущее Состояние

```text
src/infrastructure
  transport/
    grpc/
  output/
    stderr-writer.ts
    stdout-writer.ts
  renderers/
    csv-renderer.ts
    json-renderer.ts
    table-renderer.ts

src/bootstrap
  commands/*/reporter.ts
```

`infrastructure/transport/grpc` - технический adapter к `nice-grpc`:

- channel;
- metadata;
- middleware;
- typed clients.

`infrastructure/renderers` - технический renderer layer:

- pretty JSON;
- CSV escaping;
- plain-text table alignment.

Renderer-ы не знают про конкретные команды, generated DTO или application
services. Они получают уже выбранные значения и возвращают строку.

`infrastructure/output` - технические sinks:

- `stdout-writer`;
- `stderr-writer`.

Sinks принимают готовый текст и пишут его во внешний поток. Они не знают, как
строить JSON, CSV или таблицу.

`bootstrap/commands/*/reporter.ts` выполняет роль command-specific CLI adapter-а:

- принимает generated response;
- строит application report;
- выбирает поля, порядок и пользовательское представление;
- использует общие renderer-ы для технического JSON/CSV/table rendering.

## Adapter И Sink

CLI adapter и stdout sink - разные вещи.

```text
CLI adapter:
  application report -> JSON/CSV/table/string

stdout sink:
  string -> process.stdout
```

Если JSON/CSV/table formatter положить в `infrastructure/output`, слой будет
назван по конкретному каналу записи, но фактически начнет владеть presentation
policy. Поэтому output sinks и renderers разделены:

```text
src/infrastructure
  renderers/
    json-renderer.ts
    csv-renderer.ts
    table-renderer.ts
  output/
    stdout-writer.ts
    stderr-writer.ts
```

Граница:

- `bootstrap/commands/*/reporter.ts` знает про команду и ее output contract;
- `infrastructure/renderers` знает только про механику формата;
- `infrastructure/output` знает только про запись готовой строки;
- `application` не импортирует adapters.

## Dependency Direction

Допустимо:

```text
bootstrap/commands/*/reporter.ts -> application/reports
bootstrap -> infrastructure/renderers
bootstrap -> infrastructure/output
infrastructure/transport/grpc -> application/services
```

Недопустимо:

```text
application -> bootstrap/commands/*/reporter.ts
application -> bootstrap
infrastructure/renderers -> bootstrap/commands
infrastructure/output -> CLI report formatting
```

## Migration Notes

Перенос выполнен без изменения поведения:

1. Общие renderer-ы перенесены из `bootstrap` в `infrastructure/renderers`.
2. Добавлен общий `json-renderer`, чтобы не дублировать pretty JSON в командах.
3. Добавлены `stdout-writer` и `stderr-writer` как технические sinks.
4. `bootstrap/commands/*/reporter.ts` оставлены рядом с командами, как в
   Inventory.

Отдельный use-case слой нужен только когда command перестает быть простой
оберткой над одним SDK call.

## Короткое Правило

Если код отвечает на вопрос "как представить report пользователю", это CLI
adapter.

Если код отвечает на вопрос "как записать готовую строку в поток", это stdout
sink.

Если код отвечает на вопрос "какой сценарий выполнить", это application
use-case.
