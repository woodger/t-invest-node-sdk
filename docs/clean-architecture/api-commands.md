# API Commands

> Type: Design Note. Документ фиксирует текущую структуру CLI API-команд и
> проблему роста `bootstrap`.

## Контекст

В SDK появились API-команды:

- `users get-accounts` -> `sdk.users.getAccounts`;
- `users get-info` -> `sdk.users.getInfo`;
- `marketdata get-candles` -> `sdk.marketdata.getCandles`;
- `instruments get-instrument-by` -> `sdk.instruments.getInstrumentBy`;
- `marketdata get-last-prices` -> `sdk.marketdata.getLastPrices`;
- `marketdata get-order-book` -> `sdk.marketdata.getOrderBook`;
- `marketdata get-trading-status` -> `sdk.marketdata.getTradingStatus`;
- `marketdata get-trading-statuses` -> `sdk.marketdata.getTradingStatuses`;
- `orders get-orders` -> `sdk.orders.getOrders`;
- `operations get-portfolio` -> `sdk.operations.getPortfolio`;
- `operations get-positions` -> `sdk.operations.getPositions`.

Этот список не считается конечным. Новые API-команды добавляются
инкрементально, когда выбран конкретный SDK method и понятен CLI-контракт
команды. Публичный CLI path зеркалит SDK/gRPC contract в форме
`<service> <method>`, где `method` - kebab-case имя SDK method. Общий command
framework заранее не вводится.

Команда делает несколько разных вещей:

1. принимает CLI args;
2. валидирует primitive flags;
3. создает `TinkoffInvestNodeSDK`;
4. вызывает API method;
5. преобразует response в stable report;
6. форматирует report в JSON/CSV/table;
7. возвращает строку для вывода.

Если все эти обязанности оставить в `bootstrap`, command layer быстро станет
местом для любой логики вокруг CLI.

## Текущая Структура

```text
src/bootstrap
  args/
  cli.ts
  command-registry.ts
  commands/
    accounts/
      cli.ts
      reporter.ts
    user-info/
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
    order-book/
      cli.ts
      reporter.ts
    trading-status/
      cli.ts
      reporter.ts
    trading-statuses/
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
  output/
    stderr-writer.ts
    stdout-writer.ts
  renderers/
    csv-renderer.ts
    json-renderer.ts
    table-renderer.ts
```

`cli.ts` сейчас отвечает за:

- whitelist CLI args;
- разбор command-specific flags;
- создание SDK facade;
- вызов API;
- закрытие SDK.

`reporter.ts` сейчас отвечает за:

- mapping generated response в application report;
- выбор command-specific output contract;
- подготовку значений для JSON/CSV/table output.

`infrastructure/renderers/*` сейчас отвечает за:

- технические детали pretty JSON, plain-text table и CSV row rendering.

`infrastructure/output/*` сейчас отвечает за:

- запись готового текста в `stdout` или `stderr`.

Директории внутри `bootstrap/commands/*` сейчас остаются компактными именами
adapter-модулей. Они не задают публичный CLI path: публичный контракт команды
фиксируется в `bootstrap/command-registry.ts` и `bootstrap/help/commands.ts`.

## Что Уже Хорошо

- CLI args validation отделена в `bootstrap/args`;
- stable output shape вынесен в `application/reports`;
- команды закрывают SDK в `finally`;
- formatting logic вынесена из `cli.ts`;
- JSON pretty-print, table alignment и CSV escaping не дублируются в command
  reporter-ах;
- `stdout`/`stderr` delivery отделен от построения JSON/CSV/table.

## Текущая Проблема

`bootstrap` по смыслу должен быть composition/entrypoint layer:

```text
parse entrypoint -> assemble dependencies -> call command -> return status/output
```

В `bootstrap` остается command-specific presentation/adaptation logic:

```text
generated response -> stable report
application report -> command-specific output values
```

Это осознанный компактный вариант, близкий к Inventory. Риск появляется, если
технические `infrastructure/renderers` начнут выбирать поля, делать redaction,
normalization или версионировать output конкретной команды.

Подробные правила разделения command-specific formatting, общих renderers и
stdout delivery описаны в
[Разделение форматирования и вывода в CLI](./cli-output-boundaries.md).

## Важное Разделение

Нужно различать две ответственности:

```text
report -> string
```

Это CLI adapter/presentation formatting.

```text
string -> stdout
```

Это output sink. `stdout` не должен знать, как строить JSON, CSV или table.

## Принятое Разделение

```text
src/bootstrap
  args/
  cli.ts
  command-registry.ts
  commands/
    accounts/
      cli.ts
      reporter.ts
    user-info/
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
    order-book/
      cli.ts
      reporter.ts
    trading-status/
      cli.ts
      reporter.ts
    trading-statuses/
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

Граница:

- `bootstrap/commands/*/cli.ts` - command entrypoint, parsing и SDK lifecycle;
- `bootstrap/commands/*/reporter.ts` - generated response -> application report
  и command-specific CLI output;
- `src/infrastructure/renderers/**` - механика JSON/CSV/table rendering;
- `src/infrastructure/output/**` - запись готовой строки в stream;
- `application/reports/**` - stable output contracts.

## Когда Нужен Use-Case

Текущие API-команды тонкие: они вызывают один SDK method и форматируют результат.
Для таких команд отдельный use-case не обязателен.

Use-case стоит выделять, если появляется хотя бы одно:

- несколько API calls в одном сценарии;
- retry/fallback/cache decision;
- сценарные ошибки и partial success;
- provider-neutral contract;
- reuse того же сценария вне CLI;
- тесты начинают мокать слишком много деталей SDK.

## Правило Для Новых Команд

- не добавлять новую formatting logic в `cli.ts`;
- держать command handler тонким;
- описывать stable output в `application/reports`;
- держать command-specific output policy в `bootstrap/commands/*/reporter.ts`;
- использовать `infrastructure/renderers` только для общей механики формата;
- не класть JSON/CSV/table formatting в stdout sink;
- регистрировать команду в `bootstrap/command-registry.ts` только в canonical
  форме `<service> <method>`;
- не добавлять short aliases для API-команд;
- добавлять help metadata в `bootstrap/help/commands.ts`;
- добавлять тесты рядом с конкретными файлами команды;
- не вводить общий command framework до появления реального повторения в
  нескольких командах;
- сверять новые output-решения с
  [Разделением форматирования и вывода в CLI](./cli-output-boundaries.md).

## Когда Обобщать Commands

Обобщение command lifecycle допустимо только после появления повторения с
одинаковой ответственностью.

До этого каждая команда остается явной:

```text
bootstrap/commands/<command-adapter>/cli.ts
bootstrap/commands/<command-adapter>/reporter.ts
application/reports/<command-adapter>.report.ts
```

Допустимые причины для extract-а:

- один и тот же SDK lifecycle повторяется в 3+ API-командах;
- одинаковый parsing/validation pattern больше не выражается существующими
  `ArgGuards`;
- tests начинают дублировать setup без изменения сценария;
- общий код получает понятную ответственность и не скрывает command-specific
  различия.

Недопустимые причины:

- будущий список команд неизвестен, поэтому хочется подготовить framework;
- две команды выглядят похожими внешне, но имеют разные request/report/output
  правила;
- хочется сократить количество строк в `commands/*/cli.ts`.
