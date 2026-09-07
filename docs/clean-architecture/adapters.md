# Адаптеры

> Type: Design Note. Документ фиксирует текущий placement project adapters и
> границу bootstrap-интеграции с внешней зависимостью `icore`.

## Контекст

В Clean Architecture adapters находятся на внешней стороне application. Они
преобразуют внутренние contracts в форму конкретного внешнего интерфейса и
обратно.

В текущем SDK command-specific CLI adapter-ы остаются рядом с командами в
`bootstrap`. Generic option/command mechanics, механический JSON/CSV-row/table
rendering и terminal output предоставляет `icore`. Это внешняя зависимость, а
не новый project layer или директория внутри `infrastructure`.

Focused правила по форматированию и штатному stdout/stderr delivery описаны в
[Разделении форматирования и вывода в CLI](./cli-output-boundaries.md).

## Текущее Состояние

```text
src/application
  reports/

src/infrastructure
  interceptor/
  report-values.ts
  transport/
    grpc/

src/bootstrap
  cli/
    contract.ts
    error.ts
    runner.ts
  commands/*/
    cli.ts
    reporter.ts

external dependency
  icore
    option/command mechanics
    renderJson/renderCsv/renderCsvRow/renderTextTable
    TerminalApp/Output
```

`infrastructure/transport/grpc` - технический adapter к `nice-grpc`:

- channel;
- metadata;
- middleware;
- typed clients;
- mapping gRPC method path в transport-neutral `ThrottleRule`;
- mapping `nice-grpc` client failures в transport-neutral `SdkError`.

`unary-limit-resolver.ts` выбирает method rule или service fallback, разрешает
quota bucket и передает application scheduler-у только `bucket` и
`limitPerMinute`. Application не разбирает gRPC path.

`infrastructure/interceptor` содержит технические process hooks для warnings и
диагностического перехвата `stdout`. Это не штатный CLI output sink: normal
command output проходит через terminal app.

`infrastructure/report-values.ts` - принадлежащий проекту адаптер скалярных
значений:

- преобразует повторяющиеся provider scalar DTO values в reusable report values;
- сохраняет `MoneyValue` в JSON как структурный `ReportMoney`;
- предоставляет text helper для table cells вида `"amount currency"`;
- не знает command names, report shapes, columns, generic renderers или output
  delivery.

`bootstrap/commands/*/reporter.ts` выполняет роль command-specific CLI adapter-а:

- принимает generated response или stream event;
- строит application report, если он является контрактом команды;
- выбирает поля, порядок, headers и пользовательское представление;
- вызывает generic render primitives `icore`, когда они подходят формату;
- оставляет project-specific rendering, например JSONL event shape, у команды.

`bootstrap/cli/runner.ts` выполняет integration wiring:

- создает default `Output` или принимает injected `Output`;
- собирает lightweight `TerminalApp` для shortcuts и external errors;
- лениво загружает command registry и собирает command `TerminalApp`;
- направляет help, version и warnings через output facade;
- передает prepared command в terminal app для выполнения и записи результата.

## Адаптер и вывод

Command-specific presentation и terminal output - разные ответственности:

```text
CLI adapter:
  provider response/event
    -> application report или command-local event contract
    -> command-specific output values
    -> string через generic primitive или project-specific formatter

normal output:
  string/AsyncIterable -> TerminalApp -> Output.write -> stdout

diagnostics:
  warnings/errors -> Output.error -> stderr
```

Reporter знает смысл команды и ее output contract. `icore` render primitives
знают только общую механику формата: JSON serialization, CSV escaping/document
joining и plain-text table alignment. `icore` `Output` знает только delivery
готового результата или diagnostics и backpressure.

Локальные wrappers над этими primitives не нужны, пока у проекта нет
самостоятельного поведения или контракта поверх generic API.

## Направление зависимостей

Допустимо:

```text
bootstrap/commands/*/reporter.ts -> application/reports
bootstrap/commands/*/reporter.ts -> infrastructure/report-values.ts
bootstrap/commands/*/reporter.ts -> icore presentation primitives
bootstrap/cli/runner.ts          -> icore TerminalApp/Output
infrastructure/report-values.ts  -> application/reports
infrastructure/transport/grpc    -> application services/contracts
infrastructure/unary resolver    -> application ThrottleRule
```

Недопустимо:

```text
application -> bootstrap/commands/*/reporter.ts
application -> icore CLI/presentation mechanics
infrastructure/report-values.ts -> command-specific report formatting
generic output facade -> выбор полей или JSON contract команды
```

Прямой import `icore` из `bootstrap` не меняет направление project layers:
bootstrap остается внешним composition/presentation слоем и интегрирует
external mechanics с локальными contracts.

## История перехода

Текущая модель появилась после переноса generic presentation/output mechanics
в `icore`:

1. Project-owned generic renderers и stdout/stderr writers удалены.
2. Reporter-ы вызывают публичные `icore` render primitives напрямую, без
   локальных forwarding wrappers.
3. Bootstrap CLI собирает `TerminalApp` и `Output`, но сохраняет project-owned
   alias inventory, help/version shortcuts, warnings и error policy; command
   aliases передаются в canonical definitions и разрешаются самим `icore`.
4. `application/reports`, command-specific presentation и
   `infrastructure/report-values.ts` остались project-owned contracts.

Отдельный use-case слой нужен только когда command перестает быть простой
оберткой над одним SDK call.

## Короткое Правило

Если код отвечает на вопрос "что и как показать для конкретной команды", это
command reporter.

Если код отвечает на вопрос "как механически сериализовать выбранные значения",
используется подходящий public primitive `icore`.

Если код отвечает на вопрос "как доставить готовый результат", это
`TerminalApp`/`Output`, собранные в CLI runner-е.

Если код отвечает на вопрос "какой сценарий выполнить", это application
use-case.
