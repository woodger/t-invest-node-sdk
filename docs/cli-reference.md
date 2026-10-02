# Справочник CLI

> Type: Reference. Здесь собраны поддерживаемые команды, preferred paths, compatibility aliases и ограничения текущего CLI. Актуальные опции показывает встроенный `--help`; runtime-контракт задают registry, handlers и tests.

## Домены и справка

SDK публикует команды в форме `<domain> <resource/action>`.

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

После установки пакета справка доступна через:

```sh
npm exec -- t-invest-node-sdk --help
npm exec -- t-invest-node-sdk market --help
npm exec -- t-invest-node-sdk market order-book --help
```

Technical и legacy paths работают как compatibility aliases. Help показывает preferred paths; совместимые пути перечислены в скобках рядом с каждой командой.

## Команды и совместимые пути

- `account list` -> `sdk.users.getAccounts` (`account get-accounts`, `users get-accounts`);
- `account info` -> `sdk.users.getInfo` (`account get-info`, `users get-info`);
- `account margin` -> `sdk.users.getMarginAttributes` (`account get-margin-attributes`, `users get-margin-attributes`);
- `account tariff` -> `sdk.users.getUserTariff` (`account get-user-tariff`, `users get-user-tariff`);
- `market candles` -> `sdk.marketData.getCandles` (`market get-candles`, `marketdata get-candles`);
- `market close-prices` -> `sdk.marketData.getClosePrices` (`market get-close-prices`, `marketdata get-close-prices`);
- `market last-prices` -> `sdk.marketData.getLastPrices` (`market get-last-prices`, `marketdata get-last-prices`);
- `market trades` -> `sdk.marketData.getLastTrades` (`market get-last-trades`, `marketdata get-last-trades`);
- `market order-book` -> `sdk.marketData.getOrderBook` (`market get-order-book`, `marketdata get-order-book`);
- `market status` -> `sdk.marketData.getTradingStatus` (`market get-trading-status`, `marketdata get-trading-status`);
- `market statuses` -> `sdk.marketData.getTradingStatuses` (`market get-trading-statuses`, `marketdata get-trading-statuses`);
- `instrument search` -> `sdk.instruments.findInstrument` (`instrument find-instrument`, `instruments find-instrument`);
- `instrument show` -> `sdk.instruments.getInstrumentBy` (`instrument get-instrument-by`, `instruments get-instrument-by`);
- `instrument dividends` -> `sdk.instruments.getDividends` (`instrument get-dividends`, `instruments get-dividends`);
- `instrument schedules` -> `sdk.instruments.tradingSchedules` (`instrument trading-schedules`, `instruments trading-schedules`);
- `instrument favorite list` -> `sdk.instruments.getFavorites` (`instrument get-favorites`, `instruments get-favorites`);
- `instrument favorite edit` -> `sdk.instruments.editFavorites` (`instrument edit-favorites`, `instruments edit-favorites`);
- `instrument share list` -> `sdk.instruments.shares` (`instrument shares`, `instruments shares`);
- `instrument share show` -> `sdk.instruments.shareBy` (`instrument share-by`, `instruments share-by`);
- `instrument bond list` -> `sdk.instruments.bonds` (`instrument bonds`, `instruments bonds`);
- `instrument bond show` -> `sdk.instruments.bondBy` (`instrument bond-by`, `instruments bond-by`);
- `instrument bond coupons` -> `sdk.instruments.getBondCoupons` (`instrument get-bond-coupons`, `instruments get-bond-coupons`);
- `instrument bond accrued` -> `sdk.instruments.getAccruedInterests` (`instrument get-accrued-interests`, `instruments get-accrued-interests`);
- `instrument etf list` -> `sdk.instruments.etfs` (`instrument etfs`, `instruments etfs`);
- `instrument etf show` -> `sdk.instruments.etfBy` (`instrument etf-by`, `instruments etf-by`);
- `instrument currency list` -> `sdk.instruments.currencies` (`instrument currencies`, `instruments currencies`);
- `instrument currency show` -> `sdk.instruments.currencyBy` (`instrument currency-by`, `instruments currency-by`);
- `instrument future list` -> `sdk.instruments.futures` (`instrument futures`, `instruments futures`);
- `instrument future show` -> `sdk.instruments.futureBy` (`instrument future-by`, `instruments future-by`);
- `instrument future margin` -> `sdk.instruments.getFuturesMargin` (`instrument get-futures-margin`, `instruments get-futures-margin`);
- `instrument option list` -> `sdk.instruments.optionsBy` (`instrument options-by`, `instruments options-by`);
- `instrument option show` -> `sdk.instruments.optionBy` (`instrument option-by`, `instruments option-by`);
- `instrument asset list` -> `sdk.instruments.getAssets` (`instrument get-assets`, `instruments get-assets`);
- `instrument asset show` -> `sdk.instruments.getAssetBy` (`instrument get-asset-by`, `instruments get-asset-by`);
- `instrument brand list` -> `sdk.instruments.getBrands` (`instrument get-brands`, `instruments get-brands`);
- `instrument brand show` -> `sdk.instruments.getBrandBy` (`instrument get-brand-by`, `instruments get-brand-by`);
- `instrument country list` -> `sdk.instruments.getCountries` (`instrument get-countries`, `instruments get-countries`);
- `order list` -> `sdk.orders.getOrders` (`order get-orders`, `orders get-orders`);
- `order show` -> `sdk.orders.getOrderState` (`order get-order-state`, `orders get-order-state`);
- `order place` -> `sdk.orders.postOrder` (`order post-order`, `orders post-order`);
- `order cancel` -> `sdk.orders.cancelOrder` (`order cancel-order`, `orders cancel-order`);
- `order replace` -> `sdk.orders.replaceOrder` (`order replace-order`, `orders replace-order`);
- `operation list` -> `sdk.operations.getOperations` (`operation get-operations`, `operations get-operations`);
- `operation page` -> `sdk.operations.getOperationsByCursor` (`operation get-operations-by-cursor`, `operations get-operations-by-cursor`);
- `operation broker-report` -> `sdk.operations.getBrokerReport` (`operation get-broker-report`, `operations get-broker-report`);
- `operation foreign-dividends-report` -> `sdk.operations.getDividendsForeignIssuer` (`operation get-dividends-foreign-issuer`, `operations get-dividends-foreign-issuer`);
- `operation portfolio` -> `sdk.operations.getPortfolio` (`operation get-portfolio`, `operations get-portfolio`);
- `operation positions` -> `sdk.operations.getPositions` (`operation get-positions`, `operations get-positions`);
- `operation withdraw-limits` -> `sdk.operations.getWithdrawLimits` (`operation get-withdraw-limits`, `operations get-withdraw-limits`);
- `stop-order list` -> `sdk.stopOrders.getStopOrders` (`stop-order get-stop-orders`, `stoporders get-stop-orders`);
- `stop-order place` -> `sdk.stopOrders.postStopOrder` (`stop-order post-stop-order`, `stoporders post-stop-order`);
- `stop-order cancel` -> `sdk.stopOrders.cancelStopOrder` (`stop-order cancel-stop-order`, `stoporders cancel-stop-order`);
- `sandbox account list` -> `sdk.sandbox.getSandboxAccounts` (`sandbox get-sandbox-accounts`);
- `sandbox account open` -> `sdk.sandbox.openSandboxAccount` (`sandbox open-sandbox-account`);
- `sandbox account close` -> `sdk.sandbox.closeSandboxAccount` (`sandbox close-sandbox-account`);
- `sandbox order list` -> `sdk.sandbox.getSandboxOrders` (`sandbox get-sandbox-orders`);
- `sandbox order show` -> `sdk.sandbox.getSandboxOrderState` (`sandbox get-sandbox-order-state`);
- `sandbox order place` -> `sdk.sandbox.postSandboxOrder` (`sandbox post-sandbox-order`);
- `sandbox order replace` -> `sdk.sandbox.replaceSandboxOrder` (`sandbox replace-sandbox-order`);
- `sandbox order cancel` -> `sdk.sandbox.cancelSandboxOrder` (`sandbox cancel-sandbox-order`);
- `sandbox position list` -> `sdk.sandbox.getSandboxPositions` (`sandbox get-sandbox-positions`);
- `sandbox operation list` -> `sdk.sandbox.getSandboxOperations` (`sandbox get-sandbox-operations`);
- `sandbox operation page` -> `sdk.sandbox.getSandboxOperationsByCursor` (`sandbox get-sandbox-operations-by-cursor`);
- `sandbox portfolio` -> `sdk.sandbox.getSandboxPortfolio` (`sandbox get-sandbox-portfolio`);
- `sandbox withdraw-limits` -> `sdk.sandbox.getSandboxWithdrawLimits` (`sandbox get-sandbox-withdraw-limits`);
- `sandbox pay-in` -> `sdk.sandbox.sandboxPayIn` (`sandbox sandbox-pay-in`);
- `stream run` -> поток выбирается в JSON config;
- `dev compile-proto` -> TypeScript contract generation (`compile-proto`).
- `help` -> встроенная справка по CLI, домену или команде;
- `version` -> версия пакета.

## Побочные эффекты и idempotency

Действующие команды с side effects входят в текущий CLI-контракт и по умолчанию требуют явный `--confirm` через `defaultConfig.requireSideEffectConfirmation`. CLI не генерирует idempotency keys автоматически: `order place` принимает `--order-id`, а `order replace` — `--idempotency-key`.

`sandbox pay-in` принимает `--currency=rub|usd`. CLI parser отклоняет неизвестные currency values, а для явно неподдержанного provider-кейса `--currency=usd` команда возвращает ошибку.

## Потоковые команды и ограничения

Для Stream API есть отдельная utility-команда `stream run --config=PATH`. Контракт долгоживущих подписок, завершения процесса и формата событий описан в [справочнике потокового CLI](./cli-stream-reference.md) и [справочнике его конфигурации](./cli-stream-configuration.md).

Сейчас CLI поддерживает server-side streams и статический initial request contract для bidirectional market data stream:

- `sdk.marketdataStream.marketDataStream`;
- `sdk.marketdataStream.marketDataServerSideStream`;
- `sdk.operationsStream.portfolioStream`;
- `sdk.operationsStream.positionsStream`;
- `sdk.ordersStream.tradesStream`.

Динамические bidirectional request sources остаются отложенным API-контрактом.

Публичный CLI не добавляет команды для deprecated generated methods:

- `sdk.instruments.options` - deprecated в generated contract; вместо него используется `instrument option list` / `sdk.instruments.optionsBy`.

## Связанные документы

- [Установка, подключение и коды завершения CLI](../readme.md#cli).
- [Архитектура API-команд](./clean-architecture/api-commands.md).
- [Навигация по документации](./index.md).
