# API Commands

> Type: Design Note. Документ фиксирует текущую структуру CLI API-команд и
> проблему роста `bootstrap`.

## Контекст

В SDK появились API-команды. Публичная форма CLI строится как preferred
friendly path: `<domain> <resource/action>`.

Публичные domains:

- `account`;
- `instrument`;
- `market`;
- `order`;
- `stop-order`;
- `operation`;
- `sandbox`;
- `stream`;
- `dev`.

Technical и legacy paths остаются совместимыми aliases, но help и документация
продвигают только preferred paths. Список ниже фиксирует текущий CLI contract:

- `account list` -> `sdk.users.getAccounts`
  (`account get-accounts`, `users get-accounts`);
- `account info` -> `sdk.users.getInfo`
  (`account get-info`, `users get-info`);
- `account margin` -> `sdk.users.getMarginAttributes`
  (`account get-margin-attributes`, `users get-margin-attributes`);
- `account tariff` -> `sdk.users.getUserTariff`
  (`account get-user-tariff`, `users get-user-tariff`);
- `market candles` -> `sdk.marketdata.getCandles`
  (`market get-candles`, `marketdata get-candles`);
- `market close-prices` -> `sdk.marketdata.getClosePrices`
  (`market get-close-prices`, `marketdata get-close-prices`);
- `market last-prices` -> `sdk.marketdata.getLastPrices`
  (`market get-last-prices`, `marketdata get-last-prices`);
- `market trades` -> `sdk.marketdata.getLastTrades`
  (`market get-last-trades`, `marketdata get-last-trades`);
- `market order-book` -> `sdk.marketdata.getOrderBook`
  (`market get-order-book`, `marketdata get-order-book`);
- `market status` -> `sdk.marketdata.getTradingStatus`
  (`market get-trading-status`, `marketdata get-trading-status`);
- `market statuses` -> `sdk.marketdata.getTradingStatuses`
  (`market get-trading-statuses`, `marketdata get-trading-statuses`);
- `instrument search` -> `sdk.instruments.findInstrument`
  (`instrument find-instrument`, `instruments find-instrument`);
- `instrument show` -> `sdk.instruments.getInstrumentBy`
  (`instrument get-instrument-by`, `instruments get-instrument-by`);
- `instrument dividends` -> `sdk.instruments.getDividends`
  (`instrument get-dividends`, `instruments get-dividends`);
- `instrument schedules` -> `sdk.instruments.tradingSchedules`
  (`instrument trading-schedules`, `instruments trading-schedules`);
- `instrument favorite list` -> `sdk.instruments.getFavorites`
  (`instrument get-favorites`, `instruments get-favorites`);
- `instrument favorite edit` -> `sdk.instruments.editFavorites`
  (`instrument edit-favorites`, `instruments edit-favorites`);
- `instrument share list` -> `sdk.instruments.shares`
  (`instrument shares`, `instruments shares`);
- `instrument share show` -> `sdk.instruments.shareBy`
  (`instrument share-by`, `instruments share-by`);
- `instrument bond list` -> `sdk.instruments.bonds`
  (`instrument bonds`, `instruments bonds`);
- `instrument bond show` -> `sdk.instruments.bondBy`
  (`instrument bond-by`, `instruments bond-by`);
- `instrument bond coupons` -> `sdk.instruments.getBondCoupons`
  (`instrument get-bond-coupons`, `instruments get-bond-coupons`);
- `instrument bond accrued` -> `sdk.instruments.getAccruedInterests`
  (`instrument get-accrued-interests`, `instruments get-accrued-interests`);
- `instrument etf list` -> `sdk.instruments.etfs`
  (`instrument etfs`, `instruments etfs`);
- `instrument etf show` -> `sdk.instruments.etfBy`
  (`instrument etf-by`, `instruments etf-by`);
- `instrument currency list` -> `sdk.instruments.currencies`
  (`instrument currencies`, `instruments currencies`);
- `instrument currency show` -> `sdk.instruments.currencyBy`
  (`instrument currency-by`, `instruments currency-by`);
- `instrument future list` -> `sdk.instruments.futures`
  (`instrument futures`, `instruments futures`);
- `instrument future show` -> `sdk.instruments.futureBy`
  (`instrument future-by`, `instruments future-by`);
- `instrument future margin` -> `sdk.instruments.getFuturesMargin`
  (`instrument get-futures-margin`, `instruments get-futures-margin`);
- `instrument option list` -> `sdk.instruments.optionsBy`
  (`instrument options-by`, `instruments options-by`);
- `instrument option show` -> `sdk.instruments.optionBy`
  (`instrument option-by`, `instruments option-by`);
- `instrument asset list` -> `sdk.instruments.getAssets`
  (`instrument get-assets`, `instruments get-assets`);
- `instrument asset show` -> `sdk.instruments.getAssetBy`
  (`instrument get-asset-by`, `instruments get-asset-by`);
- `instrument brand list` -> `sdk.instruments.getBrands`
  (`instrument get-brands`, `instruments get-brands`);
- `instrument brand show` -> `sdk.instruments.getBrandBy`
  (`instrument get-brand-by`, `instruments get-brand-by`);
- `instrument country list` -> `sdk.instruments.getCountries`
  (`instrument get-countries`, `instruments get-countries`);
- `order list` -> `sdk.orders.getOrders`
  (`order get-orders`, `orders get-orders`);
- `order show` -> `sdk.orders.getOrderState`
  (`order get-order-state`, `orders get-order-state`);
- `order place` -> `sdk.orders.postOrder`
  (`order post-order`, `orders post-order`);
- `order cancel` -> `sdk.orders.cancelOrder`
  (`order cancel-order`, `orders cancel-order`);
- `order replace` -> `sdk.orders.replaceOrder`
  (`order replace-order`, `orders replace-order`);
- `operation list` -> `sdk.operations.getOperations`
  (`operation get-operations`, `operations get-operations`);
- `operation page` -> `sdk.operations.getOperationsByCursor`
  (`operation get-operations-by-cursor`, `operations get-operations-by-cursor`);
- `operation broker-report` -> `sdk.operations.getBrokerReport`
  (`operation get-broker-report`, `operations get-broker-report`);
- `operation foreign-dividends-report` -> `sdk.operations.getDividendsForeignIssuer`
  (`operation get-dividends-foreign-issuer`, `operations get-dividends-foreign-issuer`);
- `operation portfolio` -> `sdk.operations.getPortfolio`
  (`operation get-portfolio`, `operations get-portfolio`);
- `operation positions` -> `sdk.operations.getPositions`
  (`operation get-positions`, `operations get-positions`);
- `operation withdraw-limits` -> `sdk.operations.getWithdrawLimits`
  (`operation get-withdraw-limits`, `operations get-withdraw-limits`);
- `stop-order list` -> `sdk.stoporders.getStopOrders`
  (`stop-order get-stop-orders`, `stoporders get-stop-orders`);
- `stop-order place` -> `sdk.stoporders.postStopOrder`
  (`stop-order post-stop-order`, `stoporders post-stop-order`);
- `stop-order cancel` -> `sdk.stoporders.cancelStopOrder`
  (`stop-order cancel-stop-order`, `stoporders cancel-stop-order`);
- `sandbox account list` -> `sdk.sandbox.getSandboxAccounts`
  (`sandbox get-sandbox-accounts`);
- `sandbox account open` -> `sdk.sandbox.openSandboxAccount`
  (`sandbox open-sandbox-account`);
- `sandbox account close` -> `sdk.sandbox.closeSandboxAccount`
  (`sandbox close-sandbox-account`);
- `sandbox order list` -> `sdk.sandbox.getSandboxOrders`
  (`sandbox get-sandbox-orders`);
- `sandbox order show` -> `sdk.sandbox.getSandboxOrderState`
  (`sandbox get-sandbox-order-state`);
- `sandbox order place` -> `sdk.sandbox.postSandboxOrder`
  (`sandbox post-sandbox-order`);
- `sandbox order replace` -> `sdk.sandbox.replaceSandboxOrder`
  (`sandbox replace-sandbox-order`);
- `sandbox order cancel` -> `sdk.sandbox.cancelSandboxOrder`
  (`sandbox cancel-sandbox-order`);
- `sandbox position list` -> `sdk.sandbox.getSandboxPositions`
  (`sandbox get-sandbox-positions`);
- `sandbox operation list` -> `sdk.sandbox.getSandboxOperations`
  (`sandbox get-sandbox-operations`);
- `sandbox operation page` -> `sdk.sandbox.getSandboxOperationsByCursor`
  (`sandbox get-sandbox-operations-by-cursor`);
- `sandbox portfolio` -> `sdk.sandbox.getSandboxPortfolio`
  (`sandbox get-sandbox-portfolio`);
- `sandbox withdraw-limits` -> `sdk.sandbox.getSandboxWithdrawLimits`
  (`sandbox get-sandbox-withdraw-limits`);
- `sandbox pay-in` -> `sdk.sandbox.sandboxPayIn`
  (`sandbox sandbox-pay-in`);
- `stream run` -> stream selected by JSON config;
- `dev compile-proto` -> TypeScript contract generation (`compile-proto`).

Новые API-команды добавляются инкрементально, когда выбран конкретный SDK
method и понятен CLI-контракт команды. Preferred path должен быть добавлен в
command definition и help, а technical/legacy aliases - только через единый
alias layer.

## To Introduce

Команды ниже пока не являются текущим CLI-контрактом. Этот список фиксирует
отложенные группы API-команд, которые нужно вводить отдельно и осознанно.

Реализованные команды с side effects являются текущим CLI-контрактом и по
умолчанию требуют явный `--confirm` через
`defaultConfig.requireSideEffectConfirmation`. CLI не генерирует idempotency
keys автоматически:
`order place` принимает `--order-id`, а `order replace` принимает
`--idempotency-key`.

`sandbox pay-in` принимает `--currency=rub|usd`. Неизвестные currency
значения отклоняются CLI parser-ом, а `--currency=usd` завершается ошибкой как
явно неподдержанный provider-кейс.

Stream API вводится отдельно от unary CLI-команд через utility-команду
`stream run --config=PATH`. CLI-контракт для долгоживущих подписок, завершения
процесса и формата событий описан в
[Stream CLI Reference](../cli-stream-reference.md) и
[Stream CLI Configuration Reference](../cli-stream-configuration.md).

Текущая реализация поддерживает server-side streams и статический initial
request contract для bidirectional market data stream:

- `sdk.marketdataStream.marketDataStream`;
- `sdk.marketdataStream.marketDataServerSideStream`;
- `sdk.operationsStream.portfolioStream`;
- `sdk.operationsStream.positionsStream`;
- `sdk.ordersStream.tradesStream`.

Динамические bidirectional request sources остаются отложенным API-контрактом.

Deprecated generated methods не вводятся как публичные CLI-команды:

- `sdk.instruments.options` - deprecated в generated contract; вместо него
  используется `instrument option list` / `sdk.instruments.optionsBy`.

Перед расширением stream command нужно сверять поведение с этими
reference-документами и отдельно фиксировать любые изменения контракта.

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
    command-options.ts
    instrument-id-options.ts
    instruments-args.ts
    side-effect-args.ts
  bin/
    cli.ts
  commands/
    registry.ts
    <command-adapter>/
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
- разбор command-specific flags через декларативные `icore` schemas;
- mapping typed command options в generated request DTO;
- создание SDK facade;
- вызов API;
- закрытие SDK.

Boolean CLI options follow `icore` flag syntax: `--flag` and, when the
command supports a negative override, `--no-flag`. Assigned boolean values
like `--flag=true` or `--flag=false` are not part of the public CLI contract.

Внутри command module нужно различать два вида helper-ов:

```text
parse*          -> raw CLI option parsing / focused parser checks
create*Request -> typed command options -> generated request DTO
```

`parse*` helper может принимать raw option map, если тестируется именно CLI
parser behavior: format, enum, comma-separated list или normalization error.
`create*Request` не должен принимать raw CLI args. Он получает typed options,
которые уже прошли `icore`, и отвечает за generated request DTO shape и
request-level validation вроде date range или mutually exclusive modes.

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
фиксируется в `bootstrap/cli/registry.ts` и `bootstrap/cli/help.ts`.

## Что Уже Хорошо

- CLI args validation отделена в `bootstrap/args`;
- raw CLI parsing отделен от typed generated request mapping;
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
    command-options.ts
    instrument-id-options.ts
    instruments-args.ts
    side-effect-args.ts
  bin/
    cli.ts
  commands/
    registry.ts
    <command-adapter>/
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
- регистрировать команду в `bootstrap/cli/registry.ts` в canonical форме
  `<domain> <command>`;
- не добавлять short aliases для API-команд;
- добавлять help metadata в `bootstrap/cli/help.ts`;
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
  `icore` option schemas;
- tests начинают дублировать setup без изменения сценария;
- общий код получает понятную ответственность и не скрывает command-specific
  различия.

Недопустимые причины:

- будущий список команд неизвестен, поэтому хочется подготовить framework;
- две команды выглядят похожими внешне, но имеют разные request/report/output
  правила;
- хочется сократить количество строк в `commands/*/cli.ts`.
