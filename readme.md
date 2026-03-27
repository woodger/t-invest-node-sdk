# Node.js SDK for Tinkoff Invest API

Минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Investments через `nice-grpc`.

Текущий публичный API модуля состоит из:
- класса `TinkoffInvestNodeSDK` для unary-запросов;
- экспортов сгенерированных типов, enum'ов и service definition из `contracts/*.proto`.

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

Подробности по официальной лимитной политике API и её связи с SDK: [docs/limits-policy.md](docs/limits-policy.md).

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

`TinkoffInvestNodeSDK` не создает отдельные stream-обертки. Для streaming RPC используйте экспортируемые service definition и `nice-grpc` напрямую.

### Server-side stream

```ts
import { createChannel, createClient, Metadata } from 'nice-grpc';
import {
  MarketDataStreamServiceDefinition,
  SubscriptionInterval,
} from 'tinkoff-invest-node-sdk';

const channel = createChannel('your-api-host:443');

const client = createClient(MarketDataStreamServiceDefinition, channel, {
  '*': {
    metadata: Metadata({
      Authorization: `Bearer ${process.env.INVEST_TOKEN!}`,
    }),
  },
});

for await (const event of client.marketDataServerSideStream({
  subscribeCandlesRequest: {
    subscriptionAction: 1,
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
```

### Bidirectional stream

```ts
import { createChannel, createClient, Metadata } from 'nice-grpc';
import {
  MarketDataRequest,
  MarketDataStreamServiceDefinition,
  SubscriptionAction,
  SubscriptionInterval,
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

const channel = createChannel('your-api-host:443');

const client = createClient(MarketDataStreamServiceDefinition, channel, {
  '*': {
    metadata: Metadata({
      Authorization: `Bearer ${process.env.INVEST_TOKEN!}`,
    }),
  },
});

for await (const event of client.marketDataStream(requestStream())) {
  console.log(event);
}
```

## Экспорты

Пакет реэкспортирует:
- `Timestamp`;
- типы и enum'ы из `common`, `instruments`, `marketdata`, `operations`, `orders`, `sandbox`, `stoporders`, `users`;
- service definition и client/implementation types для этих сервисов.

Основная точка входа:

```ts
import {
  TinkoffInvestNodeSDK,
  CandleInterval,
  InstrumentsServiceDefinition,
  MarketDataStreamServiceDefinition,
} from 'tinkoff-invest-node-sdk';
```
