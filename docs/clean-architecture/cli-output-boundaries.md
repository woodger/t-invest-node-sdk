# Разделение Форматирования И Вывода В CLI

> Type: Design Note. Документ фиксирует принятую границу между
> command-specific CLI formatting, generic JSON/CSV/table mechanics из `icore`
> и доставкой готового результата через `icore` `Output`.

## Контекст

CLI-команды живут в `bootstrap`, но не вся логика вокруг вывода имеет одну
ответственность. Команда определяет смысл пользовательского представления;
generic primitives сериализуют уже выбранные значения; terminal output
доставляет готовую строку или stream.

`icore` предоставляет generic mechanics как внешняя зависимость. Он не является
слоем проекта и не владеет application reports или output contract конкретной
команды.

Текущая структура:

```text
src/application
  reports/

src/infrastructure
  report-values.ts

src/bootstrap
  index.ts
  cli/
    contract.ts
    error.ts
    runner.ts
  commands/
    <command>/
      cli.ts
      reporter.ts

external dependency
  icore
    renderJson
    renderCsvRow
    renderTextTable
    TerminalApp
    Output
```

## Основная Граница

Нужно разделять три операции:

```text
application report/command-local event -> command-specific output values
```

Это responsibility `bootstrap/commands/*/reporter.ts`.

```text
output values -> JSON / CSV row / table string
```

Для общей механики reporter использует публичные render primitives `icore`.
Структура документа, headers и порядок rows остаются command-specific policy.
Trailing newline для JSON и text table задают generic primitives; для текущего
CSV-документа его добавляет reporter после сборки rows.

```text
string/AsyncIterable -> TerminalApp -> Output.write -> stdout
```

В штатном CLI flow это normal output responsibility `icore` `TerminalApp` и
`Output`, собранных в `bootstrap/cli/runner.ts`.

```text
warnings/errors -> Output.error -> stderr
```

Текст warnings определяет project CLI layer; текст errors и exit code -
project-owned error policy.

## Поток Команды

```text
src/bootstrap/index.ts
        ↓
bootstrap/cli/runner.ts
        ↓
icore command resolution + typed options
        ↓
bootstrap/commands/<command>/cli.ts
        ↓
SDK call
        ↓
bootstrap/commands/<command>/reporter.ts
        ↓
application report или command-local event contract
        ↓
command-specific output values
        ↓
icore render primitive или project-specific formatter
        ↓
string/AsyncIterable
        ↓
icore TerminalApp -> Output.write
        ↓
stdout
```

Runner отдельно владеет публичными short aliases, help/version shortcuts и
command warnings. Он направляет help/version через `app.output.write`, warnings
через `app.output.error`, а normal command result передает в terminal app.

Последний аварийный fallback executable entrypoint использует `console.error`.
Поэтому `icore` `Output` является контрактом штатного terminal flow, а не
абсолютно единственной записью в process streams во всех аварийных сценариях.

## Что Остается В Reporter Команды

`bootstrap/commands/<command>/reporter.ts` отвечает за смысл пользовательского
вывода:

- mapping unary response в `application/reports` или stream event в
  command-local event contract;
- выбор полей;
- порядок и имена колонок;
- представление enum/date/nullable values;
- stable JSON contract конкретной команды;
- CSV headers, порядок rows и document-level newline;
- redaction или normalization, если они зависят от команды;
- project-specific formats, например JSONL event shape.

Reporter может импортировать `renderJson`, `renderCsvRow` и `renderTextTable` из
`icore`, но generic primitive не должен определять поля или contract команды.

## Что Предоставляют Render Primitives `icore`

Generic primitives отвечают только за механику текстового формата:

- JSON serialization и trailing newline;
- CSV escaping и joining одной строки без document-level newline;
- расчет ширины, выравнивание и trailing newline plain-text таблицы.

Они не должны получать ответственность за:

- названия CLI-команд;
- `AccountsReport`, `CandlesReport` или другие project reports;
- generated provider DTO;
- SDK clients;
- выбор пользовательских полей;
- command-specific redaction или normalization;
- сборку CSV-документа конкретной команды.

Если общей primitive недостаточно, project-specific formatter остается рядом с
reporter-ом. Это не повод создавать forwarding wrapper, который только повторяет
public API `icore`.

## Что Предоставляют `TerminalApp` И `Output`

`bootstrap/cli/runner.ts` создает default output через `createOutput` или
принимает injected `Output`, после чего передает его в `createTerminalApp`.

Output boundary отвечает за:

- запись готового normal result через `Output.write` в stdout;
- запись warnings/errors через `Output.error` в stderr;
- ожидание asynchronous writes и backpressure;
- единый terminal error delivery через project-owned error policy.

Output boundary не должен знать:

- JSON, CSV или таблицы;
- application reports;
- command names;
- правила отображения значений;
- какие поля нужно скрыть или показать.

Project `terminalErrorPolicy` определяет текст ошибки и exit code. `icore`
terminal app применяет policy и выполняет delivery. Поэтому error ownership
также разделено, а не целиком передано зависимости.

Command registry типизирует результаты публичным `TerminalCommandOutput` из
`icore`. Текущие SDK commands возвращают строки, async string streams или
`undefined`; runtime narrowing выполняет `TerminalApp.runPrepared()` через
собственный публичный guard, поэтому локальная повторная проверка не нужна.

## Почему Не Нужны Локальные Generic Wrappers

Удаленные project-owned renderers и writers больше не являются архитектурными
точками расширения. Wrapper без собственного контракта добавит второй source of
truth и снова позволит документации и runtime разойтись.

Локальный adapter оправдан, только если он добавляет самостоятельное
project-specific поведение:

- новый stable contract;
- reuse нескольких команд поверх generic primitives;
- policy, которой нет в `icore`;
- изоляцию внешней зависимости, необходимую для наблюдаемого поведения.

Сам по себе более короткий import или предполагаемая будущая замена зависимости
не является достаточной причиной.

## Правило Для Новых Команд

При добавлении новой API-команды:

- declarative option schema передается command mechanics `icore`;
- `cli.ts` получает typed options, выполняет API-specific validation, строит
  generated request, вызывает SDK и закрывает его;
- `reporter.ts` строит stable report и command-specific output;
- generic JSON/CSV-row/table mechanics переиспользуется из public API `icore`;
- повторяющиеся scalar value conversions переиспользуются из
  `infrastructure/report-values.ts`;
- handler возвращает готовую строку или stream terminal app и не пишет normal
  result напрямую в `process.stdout`;
- generated DTO не становится стабильным CLI output contract;
- output contract выбирается для конкретной команды, а не для будущего
  неизвестного списка команд.

## Признаки Неверной Границы

Command-specific policy утекла в generic mechanics, если код:

- знает имя команды;
- импортирует `application/reports` ради выбора пользовательских полей;
- форматирует enum/date по правилам конкретной команды;
- скрывает или нормализует данные конкретного output contract;
- меняется при изменении CLI JSON contract.

Technical mechanics необоснованно дублируется в reporter-е, если код:

- повторяет CSV escaping;
- повторяет generic pretty JSON;
- повторяет расчет ширины таблицы;
- пишет normal result напрямую в `process.stdout`, хотя достаточно вернуть его
  terminal app.

## Итог

```text
CLI executable       -> src/bootstrap/index.ts
CLI runner           -> src/bootstrap/cli/runner.ts
CLI error policy     -> src/bootstrap/cli/error.ts
CLI commands         -> src/bootstrap/commands
stable unary reports -> src/application/reports
scalar adapters      -> src/infrastructure/report-values.ts
format mechanics     -> public render primitives `icore`
normal output        -> `icore` TerminalApp -> Output.write -> stdout
diagnostics          -> `icore` Output.error -> stderr
```

Так project-owned presentation policy не смешивается с generic serialization и
технической доставкой результата.
