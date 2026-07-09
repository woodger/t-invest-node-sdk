# Node.js SDK for Tinkoff Invest API

Минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Investments через `nice-grpc`.

Текущий публичный API модуля состоит из:
- класса `TinkoffInvestNodeSDK` для unary-запросов;
- выборочных реэкспортов сгенерированных типов, enum'ов и service definition из
  upstream proto contracts в `contracts/t_tech/invest/grpc/**/*.proto`.

## Установка

```sh
yarn add tinkoff-invest-node-sdk
```

## Документация

Документация ведется как обычные Markdown-файлы в каталоге `docs`:

- [Обзор SDK](docs/index.md)
- [Архитектура SDK](docs/architecture.md)
- [Clean Architecture Notes](docs/clean-architecture/index.md)
- [Разделение форматирования и вывода в CLI](docs/clean-architecture/cli-output-boundaries.md)
- [Stream CLI Reference](docs/cli-stream-reference.md)
- [Stream CLI Configuration Reference](docs/cli-stream-configuration.md)
- [Лимитная политика API](docs/limits-policy.md)
- [Политики проекта](docs/policy/index.md)
- [Политика тестирования](docs/policy/testing-policy.md)
- [Политика комментариев в тестах](docs/policy/test-comment-style.md)

Отдельного docs-сайта, dev-сервера и сборки статической документации в проекте нет.

## Генерация proto

Генерация TypeScript-кода из upstream proto layout запускается через CLI:

```sh
yarn cli dev compile-proto
```

Proto compiler берется из окружения. Для генерации нужен `protoc` в `PATH`.
TypeScript plugin берется из dev-зависимости `ts-proto`.
Raw proto-файлы хранятся в upstream layout `contracts/t_tech/invest/grpc/**`.
Generated TypeScript mirror пишется в `src/generated/t_tech/invest/grpc/**`.
Источник raw proto зафиксирован в `contracts/upstream.json`.

CLI использует собранные файлы из `dist`, поэтому перед первым запуском после
изменений в bootstrap TypeScript-коде нужно выполнить:

```sh
yarn build
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

## Опции `defaultConfig`

```ts
interface TinkoffInvestNodeSDKConfig {
  requireSideEffectConfirmation: boolean;
}
```

- `requireSideEffectConfirmation` - требовать `--confirm` для CLI-команд с
  side effects, по умолчанию `true`.

Подробности по официальной лимитной политике API и её связи с SDK: [docs/limits-policy.md](docs/limits-policy.md).

## CLI

В проекте есть bootstrap CLI layer на базе `icore` terminal app и command
registry. Локально после сборки utility- и API-команды можно запускать через
`yarn cli`:

```sh
yarn cli --help
yarn cli version
yarn cli <domain> --help
yarn cli <domain> <command> --help
yarn cli <domain> <command> [options]

yarn cli account list --format=json
yarn cli account info
yarn cli market candles --instrument-id=BBG00QPYJ5H0 --from=2026-06-19T00:00:00Z --to=2026-06-19T01:00:00Z --interval=1min --format=csv
yarn cli market last-prices --instrument-id=BBG00QPYJ5H0
yarn cli order place --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --direction=sell --order-type=market --order-id=00000000-0000-0000-0000-000000000001 --confirm
yarn cli stop-order list --account-id=2000000000
yarn cli operation portfolio --account-id=2000000000 --format=json
yarn cli sandbox account list
yarn cli sandbox order place --account-id=2000000000 --instrument-id=BBG00QPYJ5H0 --quantity=1 --direction=sell --order-type=market --order-id=00000000-0000-0000-0000-000000000002 --confirm
yarn cli instrument share list --help
yarn cli instrument bond show --id=BBG00QPYJ5H0 --id-type=figi
yarn cli dev compile-proto
```

Актуальный список доменов выводит `yarn cli --help`. Список команд домена
можно посмотреть через `yarn cli <domain> --help`. Подробности отдельной
команды выводятся через `yarn cli <domain> <command> --help`.

After package installation the same CLI entrypoint is exposed as the package
binary:

```sh
tinkoff-invest-node-sdk --help
tinkoff-invest-node-sdk account list --format=json
```

CLI examples use preferred friendly paths. Technical and legacy paths continue
to work as compatibility aliases, but they are not promoted in help output.
Examples of compatibility aliases:

- `users get-accounts` -> `account list`;
- `marketdata get-candles` -> `market candles`;
- `orders post-order` -> `order place`;
- `stoporders get-stop-orders` -> `stop-order list`;
- `operations get-portfolio` -> `operation portfolio`;
- `instruments shares` -> `instrument share list`;
- `compile-proto` -> `dev compile-proto`.

Boolean CLI options use flag syntax: `--confirm`, `--raw`. For supported
negative overrides use `--no-raw`; assigned values like `--raw=true` or
`--raw=false` are not part of the public CLI contract.

API-команды используют `--token` / `TINKOFF_TOKEN` и
`--endpoint` / `TINKOFF_ENDPOINT`. Runtime SDK API остается основным публичным
интерфейсом пакета.

### Migration note: CLI JSON money values

CLI JSON reports возвращают денежные значения структурно, без склейки суммы и
валюты в одну строку.

Раньше:

```json
{
  "totalAmountPortfolio": "1000 rub"
}
```

Теперь:

```json
{
  "totalAmountPortfolio": {
    "amount": "1000",
    "currency": "rub"
  }
}
```

Если provider не вернул денежное значение, поле будет `null`. Table/text вывод
не изменился и по-прежнему показывает деньги в виде `amount currency`.

Отложенные группы CLI-команд (`To introduce`) описаны в
[docs/clean-architecture/api-commands.md](docs/clean-architecture/api-commands.md):
`stream run --config=PATH` уже доступен для server-side streams и статических
initial requests `marketdata.marketDataStream`. Динамические bidirectional
request sources остаются отложенным контрактом. Команды с side effects уже
доступны и по умолчанию требуют явный флаг `--confirm` через
`defaultConfig.requireSideEffectConfirmation`.

Контракт stream CLI описан в
[docs/cli-stream-reference.md](docs/cli-stream-reference.md) и
[docs/cli-stream-configuration.md](docs/cli-stream-configuration.md).

## Доступные сервисы

Экземпляр `TinkoffInvestNodeSDK` лениво создает unary-клиенты для сервисов:

- `sdk.instruments`
- `sdk.marketdata`
- `sdk.operations`
- `sdk.orders`
- `sdk.sandbox`
- `sdk.stoporders`
- `sdk.users`

Все методы этих клиентов соответствуют сгенерированным gRPC-описаниям.

Для streaming RPC доступны клиенты:

- `sdk.marketdataStream`
- `sdk.operationsStream`
- `sdk.ordersStream`

Все клиенты используют общий gRPC channel и metadata. Закрыть channel можно через `sdk.close()`.

## Примеры unary-запросов

### Получить счета

```ts
import { TinkoffInvestNodeSDK } from 'tinkoff-invest-node-sdk';

const sdk = new TinkoffInvestNodeSDK({
  token: process.env.INVEST_TOKEN!,
  endpoint: 'your-api-host:443',
});

const { accounts } = await sdk.users.getAccounts({});

console.log(accounts);
```

### Получить портфель

```ts
import {
  PortfolioRequest_CurrencyRequest,
  TinkoffInvestNodeSDK,
} from 'tinkoff-invest-node-sdk';

const sdk = new TinkoffInvestNodeSDK({
  token: process.env.INVEST_TOKEN!,
  endpoint: 'your-api-host:443',
});

const { accounts } = await sdk.users.getAccounts({});

const portfolio = await sdk.operations.getPortfolio({
  accountId: accounts[0]?.id ?? '',
  currency: PortfolioRequest_CurrencyRequest.PORTFOLIO_REQUEST_CURRENCY_REQUEST_RUB,
});

console.log(portfolio);
```

### Получить свечи

```ts
import {
  CandleInterval,
  TinkoffInvestNodeSDK,
} from 'tinkoff-invest-node-sdk';

const sdk = new TinkoffInvestNodeSDK({
  token: process.env.INVEST_TOKEN!,
  endpoint: 'your-api-host:443',
});

const now = new Date();
const from = new Date(now.getTime() - 5 * 60 * 1000);

const response = await sdk.marketdata.getCandles({
  instrumentId: 'BBG00QPYJ5H0',
  interval: CandleInterval.CANDLE_INTERVAL_1_MIN,
  from,
  to: now,
});

console.log(response.candles);
```

## Стримы

`TinkoffInvestNodeSDK` создает stream-клиенты с теми же metadata и channel, что и unary-клиенты. Локальный throttling через `trackLimits` применяется только к unary-вызовам.

### Server-side stream

```ts
import {
  SubscriptionAction,
  SubscriptionInterval,
  TinkoffInvestNodeSDK,
} from 'tinkoff-invest-node-sdk';

const sdk = new TinkoffInvestNodeSDK({
  token: process.env.INVEST_TOKEN!,
  endpoint: 'your-api-host:443',
});

try {
  for await (const event of sdk.marketdataStream.marketDataServerSideStream({
    subscribeCandlesRequest: {
      subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
      instruments: [
        {
          instrumentId: 'BBG00QPYJ5H0',
          interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
        },
      ],
      waitingClose: false,
    },
  })) {
    console.log(event);
  }
}
finally {
  sdk.close();
}
```

### Bidirectional stream

```ts
import {
  MarketDataRequest,
  SubscriptionAction,
  SubscriptionInterval,
  TinkoffInvestNodeSDK,
} from 'tinkoff-invest-node-sdk';

async function* requestStream(): AsyncIterable<MarketDataRequest> {
  yield {
    subscribeCandlesRequest: {
      subscriptionAction: SubscriptionAction.SUBSCRIPTION_ACTION_SUBSCRIBE,
      instruments: [
        {
          instrumentId: 'BBG00QPYJ5H0',
          interval: SubscriptionInterval.SUBSCRIPTION_INTERVAL_ONE_MINUTE,
        },
      ],
      waitingClose: false,
    },
  };
}

const sdk = new TinkoffInvestNodeSDK({
  token: process.env.INVEST_TOKEN!,
  endpoint: 'your-api-host:443',
});

try {
  for await (const event of sdk.marketdataStream.marketDataStream(requestStream())) {
    console.log(event);
  }
}
finally {
  sdk.close();
}
```

## Экспорты

Пакет реэкспортирует:
- `Timestamp`;
- типы и enum'ы из `common`, `instruments`, `marketdata`, `operations`, `orders`, `sandbox`, `stoporders`, `users`;
- package-owned service interfaces `UsersService`, `OrdersService`, `MarketDataService` и т.п.
- generated server-side `*ServiceDefinition` и `*ServiceImplementation`
  contracts для nice-grpc server adapters.

Generated `*ServiceClient` contracts остаются внутренними transport contracts и
не входят в root exports.

Основная точка входа:

```ts
import {
  TinkoffInvestNodeSDK,
  CandleInterval,
  InstrumentsService,
  MarketDataStreamService,
} from 'tinkoff-invest-node-sdk';
```

## Дисклеймер

Проект является независимой реализацией и не имеет никакого отношения к
Tinkoff, T-Банку или их аффилированным лицам. Названия продуктов и компаний
используются только для обозначения совместимости с публичным API.

Сведения о сторонних контрактах и generated-коде включены в [LICENSE](LICENSE).
