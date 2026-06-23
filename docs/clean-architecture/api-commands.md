# API Commands

> Type: Design Note. Документ фиксирует текущую структуру CLI API-команд и
> проблему роста `bootstrap`.

## Контекст

В SDK появились API-команды:

- `users get-accounts` -> `sdk.users.getAccounts`;
- `users get-info` -> `sdk.users.getInfo`;
- `users get-margin-attributes` -> `sdk.users.getMarginAttributes`;
- `users get-user-tariff` -> `sdk.users.getUserTariff`;
- `marketdata get-candles` -> `sdk.marketdata.getCandles`;
- `marketdata get-close-prices` -> `sdk.marketdata.getClosePrices`;
- `instruments find-instrument` -> `sdk.instruments.findInstrument`;
- `instruments get-accrued-interests` -> `sdk.instruments.getAccruedInterests`;
- `instruments get-bond-coupons` -> `sdk.instruments.getBondCoupons`;
- `instruments bond-by` -> `sdk.instruments.bondBy`;
- `instruments bonds` -> `sdk.instruments.bonds`;
- `instruments get-brand-by` -> `sdk.instruments.getBrandBy`;
- `instruments get-brands` -> `sdk.instruments.getBrands`;
- `instruments get-countries` -> `sdk.instruments.getCountries`;
- `instruments currencies` -> `sdk.instruments.currencies`;
- `instruments currency-by` -> `sdk.instruments.currencyBy`;
- `instruments etf-by` -> `sdk.instruments.etfBy`;
- `instruments etfs` -> `sdk.instruments.etfs`;
- `instruments get-dividends` -> `sdk.instruments.getDividends`;
- `instruments get-favorites` -> `sdk.instruments.getFavorites`;
- `instruments future-by` -> `sdk.instruments.futureBy`;
- `instruments futures` -> `sdk.instruments.futures`;
- `instruments get-futures-margin` -> `sdk.instruments.getFuturesMargin`;
- `instruments get-instrument-by` -> `sdk.instruments.getInstrumentBy`;
- `instruments share-by` -> `sdk.instruments.shareBy`;
- `instruments shares` -> `sdk.instruments.shares`;
- `instruments trading-schedules` -> `sdk.instruments.tradingSchedules`;
- `marketdata get-last-prices` -> `sdk.marketdata.getLastPrices`;
- `marketdata get-last-trades` -> `sdk.marketdata.getLastTrades`;
- `marketdata get-order-book` -> `sdk.marketdata.getOrderBook`;
- `marketdata get-trading-status` -> `sdk.marketdata.getTradingStatus`;
- `marketdata get-trading-statuses` -> `sdk.marketdata.getTradingStatuses`;
- `orders get-orders` -> `sdk.orders.getOrders`;
- `orders get-order-state` -> `sdk.orders.getOrderState`;
- `operations get-operations` -> `sdk.operations.getOperations`;
- `operations get-operations-by-cursor` -> `sdk.operations.getOperationsByCursor`;
- `operations get-portfolio` -> `sdk.operations.getPortfolio`;
- `operations get-positions` -> `sdk.operations.getPositions`;
- `operations get-withdraw-limits` -> `sdk.operations.getWithdrawLimits`;
- `stoporders get-stop-orders` -> `sdk.stoporders.getStopOrders`.

Этот список не считается конечным. Новые API-команды добавляются
инкрементально, когда выбран конкретный SDK method и понятен CLI-контракт
команды. Публичный CLI path зеркалит SDK/gRPC contract в форме
`<service> <method>`, где `method` - kebab-case имя SDK method. Общий command
framework заранее не вводится.

## To Introduce

Команды ниже пока не являются текущим CLI-контрактом. Этот список фиксирует
отложенные группы API-команд, которые нужно вводить отдельно и осознанно.

Sandbox service откладывается целиком:

- `sandbox open-sandbox-account`;
- `sandbox get-sandbox-accounts`;
- `sandbox close-sandbox-account`;
- `sandbox post-sandbox-order`;
- `sandbox replace-sandbox-order`;
- `sandbox get-sandbox-orders`;
- `sandbox cancel-sandbox-order`;
- `sandbox get-sandbox-order-state`;
- `sandbox get-sandbox-positions`;
- `sandbox get-sandbox-operations`;
- `sandbox get-sandbox-operations-by-cursor`;
- `sandbox get-sandbox-portfolio`;
- `sandbox sandbox-pay-in`;
- `sandbox get-sandbox-withdraw-limits`.

Команды с side effects откладываются отдельно от read-only CLI-команд:

- `orders post-order`;
- `orders cancel-order`;
- `orders replace-order`;
- `stoporders post-stop-order`;
- `stoporders cancel-stop-order`;
- `instruments edit-favorites`.

Перед реализацией таких команд нужно явно определить CLI-контракт,
идемпотентность/повторный запуск, формат подтверждения опасных действий и
ожидаемое поведение при ошибках provider-а.

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
    instruments-args.ts
    accounts/
      cli.ts
      reporter.ts
    user-info/
      cli.ts
      reporter.ts
    margin-attributes/
      cli.ts
      reporter.ts
    user-tariff/
      cli.ts
      reporter.ts
    candles/
      cli.ts
      reporter.ts
    close-prices/
      cli.ts
      reporter.ts
    find-instrument/
      cli.ts
      reporter.ts
    accrued-interests/
      cli.ts
      reporter.ts
    bond-coupons/
      cli.ts
      reporter.ts
    bond/
      cli.ts
      reporter.ts
    bonds/
      cli.ts
      reporter.ts
    brand/
      cli.ts
      reporter.ts
    brands/
      cli.ts
      reporter.ts
    countries/
      cli.ts
      reporter.ts
    currencies/
      cli.ts
      reporter.ts
    currency/
      cli.ts
      reporter.ts
    etf/
      cli.ts
      reporter.ts
    etfs/
      cli.ts
      reporter.ts
    dividends/
      cli.ts
      reporter.ts
    favorites/
      cli.ts
      reporter.ts
    future/
      cli.ts
      reporter.ts
    futures/
      cli.ts
      reporter.ts
    futures-margin/
      cli.ts
      reporter.ts
    instrument/
      cli.ts
      reporter.ts
    share/
      cli.ts
      reporter.ts
    shares/
      cli.ts
      reporter.ts
    trading-schedules/
      cli.ts
      reporter.ts
    last-prices/
      cli.ts
      reporter.ts
    last-trades/
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
    order-state/
      cli.ts
      reporter.ts
    operations/
      cli.ts
      reporter.ts
    operations-by-cursor/
      cli.ts
      reporter.ts
    portfolio/
      cli.ts
      reporter.ts
    positions/
      cli.ts
      reporter.ts
    withdraw-limits/
      cli.ts
      reporter.ts
    stop-orders/
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
    margin-attributes/
      cli.ts
      reporter.ts
    user-tariff/
      cli.ts
      reporter.ts
    candles/
      cli.ts
      reporter.ts
    close-prices/
      cli.ts
      reporter.ts
    find-instrument/
      cli.ts
      reporter.ts
    accrued-interests/
      cli.ts
      reporter.ts
    bond-coupons/
      cli.ts
      reporter.ts
    brand/
      cli.ts
      reporter.ts
    brands/
      cli.ts
      reporter.ts
    countries/
      cli.ts
      reporter.ts
    dividends/
      cli.ts
      reporter.ts
    favorites/
      cli.ts
      reporter.ts
    futures-margin/
      cli.ts
      reporter.ts
    instrument/
      cli.ts
      reporter.ts
    trading-schedules/
      cli.ts
      reporter.ts
    last-prices/
      cli.ts
      reporter.ts
    last-trades/
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
    order-state/
      cli.ts
      reporter.ts
    operations/
      cli.ts
      reporter.ts
    operations-by-cursor/
      cli.ts
      reporter.ts
    portfolio/
      cli.ts
      reporter.ts
    positions/
      cli.ts
      reporter.ts
    withdraw-limits/
      cli.ts
      reporter.ts
    stop-orders/
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
