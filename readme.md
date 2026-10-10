# Node.js SDK for T-Invest API

[![npm version](https://img.shields.io/npm/v/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![node](https://img.shields.io/node/v/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![types](https://img.shields.io/npm/types/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![license](https://img.shields.io/npm/l/%40woodger%2Ft-invest-node-sdk.svg)](LICENSE)

Минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Invest через `nice-grpc`.

Официальные ресурсы T-Invest:

- [Документация T-Invest API](https://developer.tbank.ru/invest/intro/intro/) — начало работы, получение токена и адреса подключения;
- [Лимиты API](https://developer.tbank.ru/invest/intro/intro/limits) — квоты unary-запросов и ограничения потоков;
- [Proto-контракты](https://opensource.tbank.ru/invest/invest-contracts) — исходные контракты gRPC API.

## Установка

Пакет `@woodger/t-invest-node-sdk` требует Node.js `>=20.19.0`. Установите его из npm:

```sh
npm install @woodger/t-invest-node-sdk
```

## Документация

Документация хранится в Markdown-файлах каталога `docs`:

- [Навигация по документации](docs/index.md)
- [Руководства для Consumer-ов](docs/guides/index.md)
- [Архитектура SDK](docs/architecture.md)
- [Заметки по Clean Architecture](docs/clean-architecture/index.md)
- [Разделение форматирования и вывода в CLI](docs/clean-architecture/cli-output-boundaries.md)
- [Справочник потокового CLI](docs/cli-stream-reference.md)
- [Справочник конфигурации потокового CLI](docs/cli-stream-configuration.md)
- [Лимитная политика API](docs/limits-policy.md)
- [Собственная реализация unary limiter-а](docs/guides/custom-unary-limiter.md)
- [TLS-доверие](docs/tls-policy.md)
- [Происхождение и подключение встроенного CA](docs/bundled-ca.md)
- [Разработка SDK](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/development/index.md)
- [Политики проекта](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/index.md)
- [Политика тестирования](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/testing-policy.md)
- [Политика комментариев в тестах](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/test-comment-style.md)

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

Более подробный пример с выбором доступного счёта и освобождением ресурсов: [Первый SDK-вызов](docs/guides/getting-started.md).

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
- `tls.rootCertificates` - PEM-содержимое custom root CA bundle для одного channel. Если поле не задано, SDK использует bundled Russian Trusted Root CA.
- `unaryLimiter` - необязательный ограничитель частоты unary-запросов, которым управляет приложение. Без него SDK отправляет запросы сразу.
- `unaryLimits` - переопределения квот для одного экземпляра SDK. Значения объединяются с `defaultConfig.unaryLimits` и передаются настроенному ограничителю.

SDK подключает bundled CA только к channel текущего instance и не меняет system trust store. Явный `tls.rootCertificates` полностью заменяет bundled CA; передавайте содержимое сертификатов в `Buffer`, а не путь к файлу. При `useSsl: false` SDK игнорирует TLS options. Подробнее о runtime-контракте читайте в [TLS policy](docs/tls-policy.md), а об источнике, юридических границах и подключении asset-а — в [отдельном документе](docs/bundled-ca.md).

Используйте `defineUnaryLimits()`, чтобы сгруппировать переопределения квот по сервисам и методам. Тип вложенного аргумента экспортирован как `UnaryLimitsDefinition`; плоская запись тоже поддерживается. Как написать и подключить собственный ограничитель запросов, описано в [руководстве по unary limiter-у](docs/guides/custom-unary-limiter.md).

`createInMemoryUnaryLimiter()` создаёт ограничитель частоты запросов для одного процесса. Чтобы использовать его в SDK, передайте результат в опцию `unaryLimiter`.

## Опции `defaultConfig`

```ts
interface TInvestNodeSDKConfig {
  unaryLimits: UnaryLimits;
  requireSideEffectConfirmation: boolean;
}
```

- `unaryLimits` - плоская runtime-таблица default unary-квот по generated service names и полным gRPC method paths. Каждое значение содержит `maxRequests` и `windowMs`; более специфичный method path имеет приоритет над сервисным fallback. Общие method quota groups описаны в [лимитной политике](docs/limits-policy.md).
- `requireSideEffectConfirmation` - требовать `--confirm` для CLI-команд, которые изменяют заявки, избранное или счета в песочнице; по умолчанию `true`.

Подробнее о лимитах API и их связи с SDK: [docs/limits-policy.md](docs/limits-policy.md).

## Политика gRPC-транспорта

SDK принимает входящие gRPC-сообщения размером не более 4 MiB. Лимит задан самим пакетом; изменить его для отдельного экземпляра SDK нельзя.

## CLI

CLI работает из собранного `dist`, поэтому после изменений в исходниках его нужно пересобрать.

Встроенный `--help` покажет актуальные домены, команды и опции:

```text
npm run cli -- --help
npm run cli -- <domain> --help
npm run cli -- <domain> <command> --help
```

Для некоторых команд требуется передать параметры подключения через `--token` / `T_INVEST_TOKEN` и `--endpoint` / `T_INVEST_ENDPOINT`.

Команды, которые изменяют заявки, избранное или счета в песочнице, по умолчанию требуют `--confirm`. Передавайте логические опции как флаги (`--raw`, `--no-raw`), без форм `--raw=true` и `--raw=false`. Положительные целочисленные опции должны помещаться в безопасный диапазон JavaScript. Для дат используйте RFC 3339 с явным `Z` или числовым смещением timezone.

Коды завершения:

- `0` — команда завершилась успешно;
- `2` — ошибка вызова: неизвестная команда, невалидные аргументы, отсутствие обязательного CLI/ENV-значения или невалидная command config;
- `1` — ошибка выполнения, provider-а, файловой системы, вывода или внутреннего определения команды.

Полный список команд и совместимых псевдонимов описан в [справочнике CLI](docs/cli-reference.md). Для потоковых команд есть отдельные [справочник CLI](docs/cli-stream-reference.md) и [справочник по конфигурации](docs/cli-stream-configuration.md).

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

Для streaming RPC доступны клиенты:

- `sdk.marketdataStream`
- `sdk.operationsStream`
- `sdk.ordersStream`

Все клиенты используют общий gRPC channel и metadata. SDK объединяет per-call metadata с instance metadata: сохраняет собственные `authorization` и `x-app-name`, а остальные заголовки Consumer-а добавляет к запросу. Вызов `sdk.close()` закрывает channel.

### Lifecycle и отмена

`sdk.close()` идемпотентен. После закрытия обращение к service getters и вызовы через ранее полученные clients завершаются ошибкой с кодом `SdkErrorCode.SdkClosed`; вызовы, которые ещё ждут локальную unary-квоту, отменяются. `sdk.close()` не ждёт уже переданные transport-у unary- и stream-операции. Чтобы завершать их предсказуемо, можно передать собственный `AbortSignal`.

`TInvestCallOptions.signal` действует на весь SDK-вызов. Если настроен `unaryLimiter`, SDK сначала передаёт ему signal для отмены ожидания, а затем использует тот же signal в gRPC-вызове.

`onHeader` и `onTrailer` — синхронные callbacks. Если callback бросает исключение, SDK отклоняет той же application error соответствующий unary-вызов или stream iteration и отменяет незавершённый transport call.

### Ошибки SDK

Корень пакета экспортирует `SdkError`, `SdkErrorCode`, `SdkErrorSource` и `isSdkError()`. Сначала проверьте неизвестную ошибку через `isSdkError()`, затем используйте сочетание `code` и `source` для классификации. `path`, `details` и `cause` доступны для диагностики.

Коды gRPC и локальных ошибок SDK, различение TLS, cancellation, receive-limit и codec failures, cross-copy narrowing и граница retry policy описаны в руководстве [Ошибки и lifecycle](docs/guides/errors-and-lifecycle.md).

## Подробные примеры

Типичные сценарии применения:

- [Первый SDK-вызов](docs/guides/getting-started.md) — конфигурация, выбор счета и освобождение ресурсов;
- [Unary-вызовы](docs/guides/unary-calls.md) — портфель, свечи, Signals, deadline и response metadata;
- [Потоки и отмена](docs/guides/streams-and-cancellation.md) — server-side и bidirectional streams с application-owned `AbortSignal`;
- [Ошибки и lifecycle](docs/guides/errors-and-lifecycle.md) — narrowing по `SdkError.code` и `source`, shutdown и retry boundary;
- [Mock-сервисы](docs/guides/testing-with-service-definitions.md) — примеры тестов через root-exported service definitions без deep imports.

## Экспорты

Публичный API включает класс `TInvestNodeSDK` для unary- и streaming-запросов. Пакет также выборочно реэкспортирует:

- `Timestamp`;
- типы, enum'ы и их JSON-конвертеры из `common`, `instruments`, `marketdata`, `operations`, `orders`, `sandbox`, `signals`, `stoporders`, `users`;
- package-owned service interfaces `UsersService`, `OrdersService`, `MarketDataService` и т.п.
- generated server-side `*ServiceDefinition` и `*ServiceImplementation` contracts для nice-grpc server adapters.

Происхождение сгенерированных контрактов описано в разделе [Сгенерированный код](docs/architecture.md#сгенерированный-код).

Generated `*ServiceClient` остаются внутренними transport contracts и не входят в root exports.

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
