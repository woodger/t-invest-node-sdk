# Node.js SDK for Tinkoff Invest API

Минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Investments через `nice-grpc`.

Текущий публичный API модуля состоит из:
- класса `TinkoffInvestNodeSDK` для unary-запросов;
- выборочных реэкспортов сгенерированных типов, enum'ов и service definition из
  vendored upstream proto contracts в `contracts/*.proto`.

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

Генерация TypeScript-кода из vendored proto snapshot запускается через CLI:

```sh
yarn cli dev compile-proto
```

Proto compiler берется из окружения. Для генерации нужен `protoc` в `PATH`.
TypeScript plugin берется из dev-зависимости `ts-proto`.
Официальный upstream — активный репозиторий
[`invest-contracts`](https://opensource.tbank.ru/invest/invest-contracts).
Зафиксированные tag и commit описаны в `contracts/upstream.json`. Vendored
T-Invest контракты хранятся в плоской структуре `contracts/*.proto`, а
generated TypeScript — в `src/generated/*.ts`. Команда генерации не скачивает
upstream.

CLI использует собранные файлы из `dist`, поэтому перед первым запуском после
изменений в bootstrap TypeScript-коде нужно выполнить:

```sh
yarn build
```

## Для разработчиков

Перед push release tag проверьте, что версия в `package.json` соответствует
ожидаемому tag:

```sh
VERSION="$(node -p "require('./package.json').version")"
BRANCH="$(git branch --show-current)"

yarn build
yarn lint
yarn test
git status --short

git push origin "$BRANCH"
git tag -a "$VERSION" -m "$VERSION"
git push origin "$VERSION"
```

Annotated tag требует настроенные `git user.name` и `git user.email`.

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

CLI запускается из собранного `dist`, поэтому после изменений в исходниках его
нужно пересобрать. Актуальные домены, команды и опции доступны через встроенный
`--help`:

```sh
yarn build
yarn cli --help
yarn cli <domain> --help
yarn cli <domain> <command> --help
```

Несколько типовых вызовов:

```sh
yarn cli account list --format=json
yarn cli market last-prices --instrument-id=BBG00QPYJ5H0
yarn cli operation portfolio --account-id=2000000000 --format=json
```

После установки SDK как зависимости CLI доступен через
`yarn tinkoff-invest-node-sdk`. API-команды принимают параметры подключения через
`--token` / `TINKOFF_TOKEN` и `--endpoint` / `TINKOFF_ENDPOINT`.

Команды с побочными эффектами по умолчанию требуют `--confirm`. Логические опции
передаются как флаги (`--raw`, `--no-raw`), без форм `--raw=true` и
`--raw=false`.

Полный список команд и совместимых псевдонимов описан в
[API Commands](docs/clean-architecture/api-commands.md). Для потоковых команд
есть отдельные [справочник CLI](docs/cli-stream-reference.md) и
[справочник по конфигурации](docs/cli-stream-configuration.md). Изменения
форматов вывода и инструкции по миграции фиксируются в
[CHANGELOG](CHANGELOG.md).

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
