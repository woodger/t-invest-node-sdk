# Adapters

> Type: Design Note. Документ фиксирует варианты placement для adapters и
> output formatting в текущем SDK.

## Контекст

В Clean Architecture adapters находятся на внешней стороне application. Они
преобразуют внутренние contracts в форму конкретного внешнего интерфейса и
обратно.

В Inventory adapters живут в `infrastructure/adapters/**`. В текущем SDK пока
есть только `infrastructure/grpc/**`, а CLI reporter-ы и renderers временно
лежат в `bootstrap`.

## Текущее Состояние

```text
src/infrastructure
  grpc/

src/bootstrap
  commands/*/reporter.ts
  csv-renderer.ts
  table-renderer.ts
```

`infrastructure/grpc` - технический adapter к `nice-grpc`:

- channel;
- metadata;
- middleware;
- typed clients.

`bootstrap/commands/*/reporter.ts` сейчас выполняет роль CLI adapter-а:

- принимает generated response;
- строит application report;
- форматирует report для CLI.

Это допустимый промежуточный шаг для маленького проекта, но не лучший
долгосрочный placement.

## Adapter И Sink

CLI adapter и stdout sink - разные вещи.

```text
CLI adapter:
  application report -> JSON/CSV/table/string

stdout sink:
  string -> process.stdout
```

Если JSON/CSV/table formatter положить в `infrastructure/stdout`, слой будет
назван по конкретному каналу записи, но фактически будет владеть presentation
policy. Это смешивает ответственности.

## Варианты Placement

### `src/presentation/cli`

Плюсы:

- название прямо говорит о presentation formatting;
- stdout остается отдельным sink;
- bootstrap не растет.

Минусы:

- добавляется новый top-level слой, которого сейчас нет в проекте.

### `src/interface-adapters/cli`

Плюсы:

- ближе к терминологии Clean Architecture;
- хорошо описывает роль `application report -> external interface`;
- отделяет adapter от technical sink.

Минусы:

- тоже добавляет новый top-level слой;
- потребуется расширить архитектурную policy.

### `src/infrastructure/adapters/cli`

Плюсы:

- ближе к структуре Inventory;
- adapters живут рядом с другой внешней интеграцией;
- не добавляет отдельный top-level слой.

Минусы:

- нужно строго отделять CLI formatting от stdout sink;
- есть риск складывать в infrastructure любую presentation logic без ясной
  границы.

## Рабочий Вариант Для Текущего SDK

Если не вводить новый top-level слой, наиболее практичный вариант:

```text
src/infrastructure
  adapters/
    cli/
      commands/
      renderers/
    stdout/
```

Граница:

- `adapters/cli` знает про `application/reports` и CLI output formats;
- `adapters/stdout` знает только про запись готовой строки;
- `bootstrap` собирает command handler, SDK facade и adapter;
- `application` не импортирует adapters.

## Dependency Direction

Допустимо:

```text
bootstrap -> infrastructure/adapters/cli -> application/reports
bootstrap -> infrastructure/adapters/stdout
infrastructure/grpc -> application/services
```

Недопустимо:

```text
application -> infrastructure/adapters/cli
application -> bootstrap
infrastructure/adapters/stdout -> CLI report formatting
```

## Migration Notes

Без изменения поведения можно двигаться маленькими шагами:

1. Перенести `bootstrap/*-renderer.ts` в `infrastructure/adapters/cli/renderers`.
2. Перенести `bootstrap/commands/*/reporter.ts` в
   `infrastructure/adapters/cli/commands/*/reporter.ts`.
3. Оставить `bootstrap/commands/*/cli.ts` как тонкие entrypoints.
4. Если появится реальный output sink abstraction, добавить
   `infrastructure/adapters/stdout`.

Отдельный use-case слой нужен только когда command перестает быть простой
оберткой над одним SDK call.

## Короткое Правило

Если код отвечает на вопрос "как представить report пользователю", это CLI
adapter.

Если код отвечает на вопрос "как записать готовую строку в поток", это stdout
sink.

Если код отвечает на вопрос "какой сценарий выполнить", это application
use-case.
