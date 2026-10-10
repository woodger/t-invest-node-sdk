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

## Документация

Документация хранится в Markdown-файлах каталога `docs`:

- [Навигация по документации](docs/index.md)
- [Руководства для пользователей SDK](docs/guides/index.md)
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
- `tls.rootCertificates` - содержимое собственных корневых сертификатов в формате PEM.
- `unaryLimiter` - необязательный ограничитель частоты unary-запросов, которым управляет приложение. Без него SDK отправляет запросы сразу.
- `unaryLimits` - переопределения квот для одного экземпляра SDK. Значения объединяются с `defaultConfig.unaryLimits` и передаются настроенному ограничителю.

Для подключения к T-Invest SDK использует встроенный корневой сертификат. Собственные сертификаты можно передать через `tls.rootCertificates`. Подробнее — в [настройках TLS](docs/tls-policy.md).

Используйте `defineUnaryLimits()`, чтобы сгруппировать переопределения квот по сервисам и методам. Тип вложенного аргумента экспортирован как `UnaryLimitsDefinition`; плоская запись тоже поддерживается. Как написать и подключить собственный ограничитель запросов, описано в [руководстве по unary limiter-у](docs/guides/custom-unary-limiter.md).

`createInMemoryUnaryLimiter()` создаёт ограничитель частоты запросов для одного процесса. Чтобы использовать его в SDK, передайте результат в опцию `unaryLimiter`.

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

CLI работает из собранного `dist`, поэтому после изменений в исходниках его нужно пересобрать.

Встроенный `--help` покажет актуальные домены, команды и опции:

```text
npm run cli -- --help
npm run cli -- <domain> --help
npm run cli -- <domain> <command> --help
```

Для некоторых команд требуется передать параметры подключения через `--token` / `T_INVEST_TOKEN` и `--endpoint` / `T_INVEST_ENDPOINT`.

Команды, которые изменяют заявки, избранное или счета в песочнице, по умолчанию требуют `--confirm`.

Передавайте логические опции как флаги (`--raw`, `--no-raw`), без форм `--raw=true` и `--raw=false`. Положительные целочисленные опции должны помещаться в безопасный диапазон JavaScript. Для дат используйте RFC 3339 с явным `Z` или числовым смещением часового пояса.

Коды завершения:

- `0` — команда завершилась успешно;
- `2` — ошибка вызова: неизвестная команда, неверные аргументы, отсутствие обязательного значения из CLI или окружения либо неверная конфигурация команды;
- `1` — ошибка выполнения, провайдера, файловой системы, вывода или внутреннего определения команды.

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

Коды ошибок, их источники и условия повторного запроса описаны в руководстве [Ошибки и завершение работы SDK](docs/guides/errors-and-lifecycle.md).

## Подробные примеры

Типичные сценарии применения:

- [Первый SDK-вызов](docs/guides/getting-started.md) — конфигурация, выбор счета и освобождение ресурсов;
- [Unary-вызовы](docs/guides/unary-calls.md) — портфель, свечи, сигналы, ограничение времени запроса и метаданные ответа;
- [Потоки и отмена](docs/guides/streams-and-cancellation.md) — серверные и двусторонние потоки с `AbortSignal` приложения;
- [Ошибки и завершение работы](docs/guides/errors-and-lifecycle.md) — проверка `SdkError.code` и `source`, закрытие SDK и условия повтора;
- [Тестовые сервисы](docs/guides/testing-with-service-definitions.md) — тесты через публичные описания сервисов из корня модуля.

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
