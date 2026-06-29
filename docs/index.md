# Tinkoff Invest Node SDK

`tinkoff-invest-node-sdk` - минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Investments через `nice-grpc`.

## Возможности

- `TinkoffInvestNodeSDK` лениво создает unary- и stream-клиенты с общим gRPC channel и metadata.
- Пакет выборочно реэкспортирует сгенерированные типы, enum'ы и service definition из `contracts/**/*.proto`.
- SDK поддерживает локальный throttling unary-запросов через `trackLimits` и отдельную таблицу лимитов по сервисам.
- Bootstrap CLI layer содержит command registry, `help` и `version` utility-команды.

## Установка

```bash
yarn add tinkoff-invest-node-sdk
```

## Быстрый старт

```ts
import { TinkoffInvestNodeSDK } from 'tinkoff-invest-node-sdk';

const sdk = new TinkoffInvestNodeSDK({
  token: process.env.INVEST_TOKEN!,
  endpoint: 'your-api-host:443',
  useSsl: true,
});
```

## Опции `TinkoffInvestNodeSDK`

```ts
interface TinkoffInvestOptions {
  token: string;
  endpoint: string;
  appName?: string;
  useSsl?: boolean;
  trackLimits?: boolean;
}
```

- `token` - OAuth токен.
- `endpoint` - gRPC endpoint в формате `host:port`.
- `appName` - необязательное значение для заголовка `x-app-name`.
- `useSsl` - использовать TLS, по умолчанию `true`.
- `trackLimits` - включить локальный throttling unary-запросов, по умолчанию `true`.

## Доступные сервисы

Экземпляр `TinkoffInvestNodeSDK` лениво создает unary-клиенты для сервисов:

- `sdk.instruments`
- `sdk.marketdata`
- `sdk.operations`
- `sdk.orders`
- `sdk.sandbox`
- `sdk.stoporders`
- `sdk.users`

Для streaming RPC доступны клиенты:

- `sdk.marketdataStream`
- `sdk.operationsStream`
- `sdk.ordersStream`

Все клиенты используют общий gRPC channel. Закрыть channel можно через `sdk.close()`.

## Стримы

`TinkoffInvestNodeSDK` создает stream-клиенты с теми же metadata и channel, что и unary-клиенты. Локальный throttling через `trackLimits` применяется только к unary-вызовам.

## CLI

Локально после сборки CLI можно вызвать через `yarn cli`:

```bash
yarn cli --help
yarn cli version
yarn cli help <service> <method>
yarn cli <service> <method> [options]

yarn cli help users get-accounts
yarn cli users get-accounts --format=json
```

Актуальный список команд выводит `yarn cli help`. Подробности отдельной
команды можно посмотреть через `yarn cli help <service> <method>` или
`yarn cli <service> <method> --help`.

Сейчас CLI содержит первые API-команды:

- `users get-accounts` - список счетов пользователя;
- `users get-info` - информация о пользователе;
- `users get-margin-attributes` - маржинальные показатели счета;
- `users get-user-tariff` - текущие API-лимиты пользователя;
- `marketdata get-candles` - исторические свечи;
- `marketdata get-close-prices` - цены закрытия торговой сессии;
- `instruments find-instrument` - поиск инструментов;
- `instruments get-accrued-interests` - накопленный купонный доход по облигации;
- `instruments get-asset-by` - информация об активе по идентификатору;
- `instruments get-assets` - список активов;
- `instruments get-bond-coupons` - купоны по облигации;
- `instruments bond-by` - информация об облигации по идентификатору;
- `instruments bonds` - список облигаций;
- `instruments get-brand-by` - информация о бренде по идентификатору;
- `instruments get-brands` - справочник брендов;
- `instruments get-countries` - справочник стран;
- `instruments currencies` - список валют;
- `instruments currency-by` - информация о валюте по идентификатору;
- `instruments etf-by` - информация об ETF по идентификатору;
- `instruments etfs` - список ETF;
- `instruments get-dividends` - дивиденды по инструменту;
- `instruments get-favorites` - избранные инструменты пользователя;
- `instruments edit-favorites` - добавление или удаление избранных инструментов;
- `instruments future-by` - информация о фьючерсе по идентификатору;
- `instruments futures` - список фьючерсов;
- `instruments get-futures-margin` - гарантийное обеспечение по фьючерсу;
- `instruments get-instrument-by` - основная информация об инструменте по идентификатору;
- `instruments option-by` - информация об опционе по идентификатору;
- `instruments options-by` - список опционов по базовому активу;
- `instruments share-by` - информация об акции по идентификатору;
- `instruments shares` - список акций;
- `instruments trading-schedules` - расписания торговых площадок;
- `marketdata get-last-prices` - последние рыночные цены инструментов;
- `marketdata get-last-trades` - обезличенные сделки по инструменту;
- `marketdata get-order-book` - стакан инструмента;
- `marketdata get-trading-status` - торговый статус инструмента;
- `marketdata get-trading-statuses` - торговые статусы инструментов;
- `orders get-orders` - активные торговые поручения по счету;
- `orders get-order-state` - статус торгового поручения;
- `orders post-order` - выставление торгового поручения;
- `orders cancel-order` - отмена торгового поручения;
- `orders replace-order` - изменение торгового поручения;
- `operations get-broker-report` - брокерский отчет: запуск формирования или страница по `taskId`;
- `operations get-dividends-foreign-issuer` - отчет по дивидендам иностранных эмитентов: запуск формирования или страница по `taskId`;
- `operations get-operations` - операции по счету за период;
- `operations get-operations-by-cursor` - страница операций по cursor-контракту;
- `operations get-portfolio` - текущий портфель по счету;
- `operations get-positions` - позиции по счету;
- `operations get-withdraw-limits` - доступный остаток для вывода;
- `stoporders get-stop-orders` - активные стоп-заявки по счету;
- `stoporders post-stop-order` - выставление стоп-заявки;
- `stoporders cancel-stop-order` - отмена стоп-заявки;
- `sandbox open-sandbox-account` - открытие sandbox-счета;
- `sandbox get-sandbox-accounts` - список sandbox-счетов;
- `sandbox close-sandbox-account` - закрытие sandbox-счета;
- `sandbox post-sandbox-order` - выставление sandbox-поручения;
- `sandbox replace-sandbox-order` - изменение sandbox-поручения;
- `sandbox get-sandbox-orders` - активные sandbox-поручения;
- `sandbox cancel-sandbox-order` - отмена sandbox-поручения;
- `sandbox get-sandbox-order-state` - статус sandbox-поручения;
- `sandbox get-sandbox-positions` - sandbox-позиции по счету;
- `sandbox get-sandbox-operations` - sandbox-операции по счету за период;
- `sandbox get-sandbox-operations-by-cursor` - страница sandbox-операций по cursor-контракту;
- `sandbox get-sandbox-portfolio` - текущий sandbox-портфель по счету;
- `sandbox sandbox-pay-in` - пополнение sandbox-счета;
- `sandbox get-sandbox-withdraw-limits` - sandbox-остаток для вывода.

Отложенные группы команд (`To introduce`) описаны в
[API Commands](./clean-architecture/api-commands.md): stream API вводится
отдельно от unary CLI-команд. Команды с side effects требуют явный флаг
`--confirm`.
Deprecated `sdk.instruments.options` не вводится как публичная CLI-команда;
для опционов используется `instruments options-by`.

Новые команды должны:

- регистрироваться через `src/bootstrap/command-registry.ts`;
- размещать handler в `src/bootstrap/commands`;
- использовать `src/bootstrap/args` для primitive CLI validation и общих SDK options;
- разделять raw CLI parsing и typed request mapping: `parse*` helper-ы
  работают с raw CLI options, а `create*Request` принимает typed options и
  строит generated request DTO;
- описывать стабильный output contract в `src/application/reports`;
- держать command-specific formatting в `src/bootstrap/commands/*/reporter.ts`;
- использовать `src/infrastructure/renderers` только для механического
  JSON/CSV/table rendering;
- использовать `src/infrastructure/output` только для записи готового текста;
- сверять новые JSON/CSV/table решения с
  [Разделением форматирования и вывода в CLI](./clean-architecture/cli-output-boundaries.md);
- не переносить gRPC или business-логику в CLI parser.

## Документация

- Карта слоев SDK: [Архитектура SDK](./architecture.md)
- Clean Architecture design notes: [Clean Architecture Notes](./clean-architecture/index.md)
- Границы CLI formatting и stdout: [Разделение форматирования и вывода в CLI](./clean-architecture/cli-output-boundaries.md)
- Подробности по лимитам API: [Лимитная политика](./limits-policy.md)
- Правила тестирования и test pipeline: [Политики проекта](./policy/index.md)
- Правила запуска и написания тестов: [Политика тестирования](./policy/testing-policy.md)
- Правила комментариев в тестах: [Политика комментариев в тестах](./policy/test-comment-style.md)
- Исходное описание и дополнительные примеры: [README в репозитории](https://github.com/woodger/tinkoff-invest-node-sdk#readme)

## Генерация proto

TypeScript-код из `contracts/**/*.proto` генерируется через:

```bash
npm run proto
```

Proto compiler берется из окружения. Для генерации нужен `protoc` в `PATH`.
TypeScript plugin берется из dev-зависимости `ts-proto`.

Скрипт использует `dist/bootstrap/bin/compile-proto.js`, поэтому после изменений в `src/bootstrap/bin/compile-proto.ts` сначала нужно пересобрать проект:

```bash
npm run build
```
