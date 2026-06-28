# Разделение Форматирования И Вывода В CLI

> Type: Design Note. Документ фиксирует принятую границу между
> command-specific CLI formatting, механическим JSON/CSV/table rendering и
> доставкой готового текста в `stdout`/`stderr`.

## Контекст

CLI в текущем SDK устроен по примеру Inventory: отдельный top-level слой `cli`
не вводится, а CLI-команды живут в `bootstrap`.

При этом не вся логика вокруг вывода должна оставаться в `bootstrap`. Если
общие правила JSON, CSV или table rendering дублировать в каждой команде,
reporter-ы начнут расти из-за технических деталей формата. Если же положить в
`infrastructure` всю логику вывода, infrastructure начнет владеть
presentation policy конкретных CLI-команд.

Принятое разделение:

```text
src/bootstrap
  cli.ts
  command-registry.ts
  commands/
    accounts/
      cli.ts
      reporter.ts
    candles/
      cli.ts
      reporter.ts
    instrument/
      cli.ts
      reporter.ts
    last-prices/
      cli.ts
      reporter.ts
    orders/
      cli.ts
      reporter.ts
    portfolio/
      cli.ts
      reporter.ts
    positions/
      cli.ts
      reporter.ts

src/infrastructure
  renderers/
    csv-renderer.ts
    json-renderer.ts
    table-renderer.ts
  output/
    stdout-writer.ts
    stderr-writer.ts
```

## Основная Граница

Нужно разделять три операции:

```text
application report -> command-specific output values
```

Это responsibility `bootstrap/commands/*/reporter.ts`.

```text
output values -> JSON / CSV / table string
```

Это responsibility `infrastructure/renderers/*`.

```text
string -> stdout/stderr
```

Это responsibility `infrastructure/output/*`.

## Поток Команды

```text
bootstrap/commands/accounts/cli.ts
        ↓
SDK call
        ↓
bootstrap/commands/accounts/reporter.ts
        ↓
application report
        ↓
command-specific output values
        ↓
infrastructure/renderers/*
        ↓
string
        ↓
infrastructure/output/*
        ↓
stdout/stderr
```

`bootstrap` остается местом command orchestration и command-specific
presentation policy. `infrastructure` содержит только технические механизмы,
которые можно использовать повторно без знания о командах.

## Что Остается В Reporter Команды

`bootstrap/commands/<command>/reporter.ts` отвечает за смысл пользовательского
вывода:

- mapping generated response в `application/reports`;
- выбор полей;
- порядок колонок;
- имена колонок;
- представление enum/date/nullable values;
- stable JSON contract конкретной команды;
- redaction или normalization, если они зависят от команды.

Reporter может импортировать `infrastructure/renderers`, но renderer не должен
импортировать reporter.

## Что Лежит В Infrastructure Renderers

`infrastructure/renderers` отвечает только за механику текстового формата:

- pretty JSON и trailing newline;
- CSV escaping;
- CSV row joining;
- расчет ширины колонок;
- выравнивание plain-text таблицы.

Renderer не должен знать:

- названия CLI-команды;
- `AccountsReport` или `CandlesReport`;
- generated provider DTO;
- SDK clients;
- `stdout` или `stderr`;
- какие поля нужно показывать пользователю.

Если renderer начинает выбирать поля или скрывать данные, это уже
command-specific formatting, и такому коду место в
`bootstrap/commands/*/reporter.ts`.

## Что Лежит В Infrastructure Output

`infrastructure/output` отвечает только за запись готового текста:

- `stdout-writer` пишет строку в `stdout`;
- `stderr-writer` пишет строку в `stderr`.

Output writer не должен знать:

- JSON;
- CSV;
- таблицы;
- application reports;
- command names;
- правила отображения значений.

Он получает строку и передает ее во внешний поток.

## Почему Не `infrastructure/stdout` Для Форматирования

`stdout` - это канал доставки, а не формат вывода.

Если положить JSON/CSV/table formatting в stdout-слой, слой будет назван по
каналу записи, но фактически начнет отвечать за presentation policy:

```text
нежелательно:
infrastructure/output -> выбирает поля accounts
infrastructure/output -> строит CSV candles
infrastructure/output -> решает JSON contract команды
```

Корректная граница:

```text
bootstrap/commands/*/reporter.ts -> выбирает пользовательское представление
infrastructure/renderers/*       -> превращает значения в строку формата
infrastructure/output/*          -> пишет готовую строку
```

## Правило Для Новых Команд

При добавлении новой API-команды:

- `cli.ts` парсит command-specific args, создает SDK facade, вызывает API и
  закрывает SDK;
- `reporter.ts` строит stable report и command-specific output;
- общий JSON/CSV/table код переиспользуется из `infrastructure/renderers`;
- запись в `stdout`/`stderr` проходит через `infrastructure/output`;
- generated DTO не становится стабильным CLI output contract;
- output contract выбирается для конкретной команды, а не для будущего
  неизвестного списка команд.

Общие helpers для command output допустимы только если они убирают реальное
повторение и не переносят command-specific policy в `infrastructure`.

## Признаки Неверной Границы

Код лежит слишком глубоко в `infrastructure`, если он:

- знает имя команды;
- импортирует `application/reports` ради выбора пользовательских полей;
- форматирует enum/date по правилам конкретной команды;
- скрывает или нормализует данные конкретного output contract;
- меняется при изменении CLI JSON contract.

Код лежит слишком высоко в `bootstrap`, если он:

- повторяет CSV escaping;
- повторяет pretty JSON;
- повторяет расчет ширины таблицы;
- пишет напрямую в `process.stdout` там, где достаточно готовой строки.

## Итог

Текущий проект использует Inventory-style CLI placement:

```text
CLI executable -> src/bootstrap/bin/cli.ts -> dist/bootstrap/bin/cli.js
CLI runner     -> bootstrap/cli-runner.ts
CLI commands   -> bootstrap/commands
format mechanics -> infrastructure/renderers
stdout/stderr sinks -> infrastructure/output
```

Это держит package binary рядом с публичным package entrypoint, но оставляет
CLI mechanics в `bootstrap` и не смешивает presentation policy с технической
записью в системные потоки.
