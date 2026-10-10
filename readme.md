# Node.js SDK for T-Invest API

[![npm version](https://img.shields.io/npm/v/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![node](https://img.shields.io/node/v/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![types](https://img.shields.io/npm/types/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![license](https://img.shields.io/npm/l/%40woodger%2Ft-invest-node-sdk.svg)](LICENSE)

Минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Invest через `nice-grpc`.

Официальные ресурсы T-Invest:

- [Документация T-Invest API](https://developer.tbank.ru/invest/intro/intro/) — начало работы, получение токена и адреса подключения;
- [Лимиты API](https://developer.tbank.ru/invest/intro/intro/limits) — квоты unary-запросов и ограничения потоков;
- [Proto-контракты](https://opensource.tbank.ru/invest/invest-contracts) — исходные контракты gRPC API.

## Установка

Модуль `@woodger/t-invest-node-sdk` требует Node.js `>=20.19.0`. Установите его из npm:

```sh
npm install @woodger/t-invest-node-sdk
```

Архив npm содержит готовый JavaScript и объявления типов из `dist`. Установка по ссылке на Git-репозиторий не поддерживается: при ней npm запускает `prepack` и собирает исходный код.

## Быстрый старт

Замените `YOUR_TOKEN` своим токеном доступа.

```ts
import { TInvestNodeSDK } from '@woodger/t-invest-node-sdk';

const sdk = new TInvestNodeSDK({
  token: 'YOUR_TOKEN',
  endpoint: 'invest-public-api.tbank.ru:443'
});

try {
  const { accounts } = await sdk.users.getAccounts({});
  console.log(accounts);
}
finally {
  sdk.close();
}
```

Более подробный пример с выбором доступного счёта и освобождением ресурсов: [Первый SDK-вызов](docs/examples/getting-started.md).

<a id="подробные-примеры"></a>

## Документация

- [Примеры](docs/examples/index.md) — запросы, потоки, ошибки и тестирование приложения.
- [Справочник CLI](docs/cli-reference.md) — команды, опции и коды завершения.
- [Все документы](docs/index.md) — настройки SDK, архитектура, разработка и политики проекта.

## Опции `TInvestNodeSDK`

```ts
interface TInvestOptions {
  token: string;
  endpoint: string;
  appName?: string;
  useSsl?: boolean;
  tls?: TInvestTlsOptions;
  unaryLimiter?: TInvestUnaryLimiter;
  unaryLimits?: UnaryLimits;
}

interface TInvestTlsOptions {
  rootCertificates?: Buffer;
}

interface TInvestUnaryLimit {
  maxRequests: number;
  windowMs: number;
}

type UnaryLimits = Record<string, TInvestUnaryLimit>;
```

- `token` - OAuth токен.
- `endpoint` - gRPC endpoint в формате `host:port`.
- `appName` - необязательное значение для заголовка `x-app-name`.
- `useSsl` - использовать TLS, по умолчанию `true`.
- `tls.rootCertificates` - содержимое собственных корневых сертификатов в формате PEM.
- `unaryLimiter` - необязательный ограничитель частоты unary-запросов, которым управляет приложение. Без него SDK отправляет запросы сразу.
- `unaryLimits` - переопределения квот для одного экземпляра SDK. Значения объединяются с `defaultConfig.unaryLimits` и передаются настроенному ограничителю.

Для подключения к T-Invest SDK использует встроенный корневой сертификат. Собственные сертификаты можно передать через `tls.rootCertificates`. Подробнее — в [настройках TLS](docs/tls-policy.md).

`createInMemoryUnaryLimiter()` создаёт ограничитель для одного процесса, а `defineUnaryLimits()` помогает сгруппировать переопределения квот по сервисам и методам. Примеры подключения и настройки — в [руководстве по ограничению частоты запросов](docs/examples/unary-limits.md).

## Опции `defaultConfig`

```ts
interface TInvestNodeSDKConfig {
  unaryLimits: UnaryLimits;
  requireSideEffectConfirmation: boolean;
}
```

- `unaryLimits` - квоты unary-запросов по умолчанию, заданные по именам сервисов или полным путям gRPC-методов. Ограничение метода имеет приоритет над ограничением сервиса.
- `requireSideEffectConfirmation` - требовать `--confirm` для CLI-команд, которые изменяют заявки, избранное или счета в песочнице; по умолчанию `true`.

Подробнее о квотах API и их настройке в SDK — в [лимитной политике](docs/limits-policy.md).

## Политика gRPC-транспорта

SDK принимает входящие gRPC-сообщения размером не более 4 MiB. Лимит задан самим модулем; изменить его для отдельного экземпляра SDK нельзя.

## CLI

Встроенный `--help` покажет актуальные домены, команды и опции:

```sh
npm exec -- t-invest-node-sdk --help
```

Подключение, правила передачи аргументов, список команд и коды завершения описаны в [справочнике CLI](docs/cli-reference.md).

## Доступные сервисы

`TInvestNodeSDK` создаёт unary-клиенты по первому обращению:

- `sdk.instruments`
- `sdk.marketData`
- `sdk.operations`
- `sdk.orders`
- `sdk.sandbox`
- `sdk.signals`
- `sdk.stopOrders`
- `sdk.users`

Клиенты повторяют методы из сгенерированных gRPC-описаний.

Для потоковых RPC доступны клиенты:

- `sdk.marketdataStream`
- `sdk.operationsStream`
- `sdk.ordersStream`

Все клиенты используют общий gRPC-канал. SDK добавляет заголовки отдельного вызова к заголовкам экземпляра, сохраняя собственные `authorization` и `x-app-name`. Вызов `sdk.close()` закрывает канал.

### Lifecycle и отмена

`sdk.close()` можно вызывать повторно. После закрытия новые обращения к сервисам и вызовы через ранее полученные клиенты завершаются с `SdkErrorCode.SdkClosed`; ожидание локальной unary-квоты отменяется. Уже выполняющиеся unary-запросы и потоки можно отменить собственным `AbortSignal`: `close()` не ждёт их завершения.

`TInvestCallOptions.signal` действует на весь SDK-вызов. Если настроен `unaryLimiter`, SDK сначала передаёт ему сигнал для отмены ожидания, а затем использует тот же сигнал в gRPC-вызове.

`onHeader` и `onTrailer` — синхронные обработчики. Если обработчик выбрасывает исключение, SDK возвращает ту же ошибку из unary-вызова или при чтении следующего события потока и отменяет незавершённый gRPC-вызов.

### Ошибки SDK

Корень модуля экспортирует `SdkError`, `SdkErrorCode`, `SdkErrorSource` и `isSdkError()`. Сначала проверьте неизвестную ошибку через `isSdkError()`, затем используйте сочетание `code` и `source` для классификации. `path`, `details` и `cause` доступны для диагностики.

Коды ошибок, их источники и условия повторного запроса описаны в руководстве [Ошибки и завершение работы SDK](docs/examples/errors-and-lifecycle.md).

## Экспорты

Публичный API включает класс `TInvestNodeSDK` для unary- и потоковых запросов. Модуль также выборочно реэкспортирует:

- `Timestamp`;
- типы, перечисления и их JSON-конвертеры из `common`, `instruments`, `marketdata`, `operations`, `orders`, `sandbox`, `signals`, `stoporders`, `users`;
- интерфейсы сервисов модуля `UsersService`, `OrdersService`, `MarketDataService` и т.п.
- сгенерированные серверные контракты `*ServiceDefinition` и `*ServiceImplementation` для адаптеров `nice-grpc`.

Происхождение сгенерированных контрактов описано в разделе [Сгенерированный код](docs/architecture.md#сгенерированный-код).

Сгенерированные `*ServiceClient` остаются внутренними транспортными контрактами и не входят в экспорты корня модуля.

Основная точка входа:

```ts
import {
  TInvestNodeSDK,
  CandleInterval,
  InstrumentsService,
  MarketDataStreamService,
} from '@woodger/t-invest-node-sdk';
```

## Дисклеймер

Проект является независимой реализацией и не имеет никакого отношения к T-Invest, T-Банку или их аффилированным лицам. Названия продуктов и компаний используются только для обозначения совместимости с публичным API.

Собственный код SDK распространяется по [MIT License](LICENSE). Для сторонних компонентов сохранены полный текст [Apache License 2.0](LICENSE-APACHE-2.0) и [`NOTICE`](NOTICE) с границами лицензий и необходимыми уведомлениями.
