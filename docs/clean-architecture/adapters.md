# Адаптеры

> Type: Design Note. Здесь описаны текущее место project adapters и граница bootstrap-интеграции с внешней зависимостью `icore`.

## Контекст

В Clean Architecture adapters находятся с внешней стороны application. Они переводят внутренние contracts в формат конкретного внешнего интерфейса и обратно.

В SDK command-specific CLI adapter-ы находятся рядом с командами в `bootstrap`. `icore` предоставляет общую механику options и commands, JSON/CSV-row/table rendering и terminal output. Это внешняя зависимость, а не новый project layer или директория внутри `infrastructure`.

Правила форматирования и штатной записи в stdout/stderr описаны в документе [«Разделение форматирования и вывода в CLI»](./cli-output-boundaries.md).

## Текущее состояние

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
- mapping gRPC method path в transport-neutral `TInvestUnaryQuota`;
- mapping `nice-grpc` client failures в transport-neutral `SdkError`.

`unary-limit-resolver.ts` выбирает method rule или service fallback и разрешает quota bucket. Middleware передаёт Consumer-owned limiter-у полный `path`, `bucket`, `maxRequests`, `windowMs` и `AbortSignal`. Application port не разбирает gRPC path и не владеет transport lifecycle.

`infrastructure/interceptor` содержит технический process hook для известных warnings. Обычный вывод команд проходит через terminal app.

`infrastructure/report-values.ts` - принадлежащий проекту адаптер скалярных значений:

- преобразует повторяющиеся provider scalar DTO values в reusable report values;
- сохраняет `MoneyValue` в JSON как структурный `ReportMoney`;
- предоставляет text helper для table cells вида `"amount currency"`;
- не знает command names, report shapes, columns, generic renderers или output delivery.

`bootstrap/commands/*/reporter.ts` служит command-specific CLI adapter-ом:

- принимает generated response или stream event;
- строит application report, если команда использует такой контракт;
- выбирает поля, порядок, headers и пользовательское представление;
- вызывает generic render primitives `icore`, когда они подходят формату;
- оставляет project-specific rendering, например JSONL event shape, у команды.

`bootstrap/cli/runner.ts` связывает компоненты CLI:

- создает default `Output` или принимает injected `Output`;
- собирает lightweight `TerminalApp` для shortcuts и external errors;
- лениво загружает command registry и собирает command `TerminalApp`;
- направляет help, version и warnings через output facade;
- передаёт prepared command в terminal app, который выполняет её и записывает результат.

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

Reporter знает смысл команды и её output contract. Render primitives из `icore` отвечают только за общую механику формата: JSON serialization, CSV escaping/document joining и выравнивание plain-text table. `Output` из `icore` отвечает только за доставку готового результата или diagnostics с учётом backpressure.

Локальные wrappers над этими primitives не нужны, пока у проекта нет самостоятельного поведения или контракта поверх generic API.

## Направление зависимостей

Допустимо:

```text
bootstrap/commands/*/reporter.ts -> application/reports
bootstrap/commands/*/reporter.ts -> infrastructure/report-values.ts
bootstrap/commands/*/reporter.ts -> icore presentation primitives
bootstrap/cli/runner.ts          -> icore TerminalApp/Output
infrastructure/report-values.ts  -> application/reports
infrastructure/transport/grpc    -> application services/contracts
infrastructure/unary resolver    -> application TInvestUnaryQuota
infrastructure/grpc middleware   -> application TInvestUnaryLimiter
```

Недопустимо:

```text
application -> bootstrap/commands/*/reporter.ts
application -> icore CLI/presentation mechanics
infrastructure/report-values.ts -> command-specific report formatting
generic output facade -> выбор полей или JSON contract команды
```

Прямой import `icore` из `bootstrap` не меняет направление project layers: bootstrap остаётся внешним composition/presentation слоем и связывает external mechanics с локальными contracts.

## История перехода

Текущая модель сложилась после переноса общей механики presentation/output в `icore`:

1. Project-owned generic renderers и stdout/stderr writers удалены.
2. Reporter-ы вызывают публичные `icore` render primitives напрямую, без локальных forwarding wrappers.
3. Bootstrap CLI собирает `TerminalApp` и `Output`, но сохраняет project-owned alias inventory, help/version shortcuts, warnings и error policy; command aliases передаются в canonical definitions и разрешаются самим `icore`.
4. `application/reports`, command-specific presentation и `infrastructure/report-values.ts` остались project-owned contracts.

Отдельный use-case слой понадобится, только если command перестанет быть простой обёрткой над одним SDK call.

## Короткое правило

Если код отвечает на вопрос "что и как показать для конкретной команды", это command reporter.

Если код отвечает на вопрос "как механически сериализовать выбранные значения", используйте подходящий public primitive `icore`.

Если код отвечает на вопрос "как доставить готовый результат", это `TerminalApp`/`Output`, собранные в CLI runner-е.

Если код отвечает на вопрос "какой сценарий выполнить", это application use-case.
