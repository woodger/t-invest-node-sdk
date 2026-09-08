# Node.js SDK for T-Invest API

[![npm version](https://img.shields.io/npm/v/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![node](https://img.shields.io/node/v/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![types](https://img.shields.io/npm/types/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![license](https://img.shields.io/npm/l/%40woodger%2Ft-invest-node-sdk.svg)](LICENSE)

Минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Invest через `nice-grpc`.

Текущий публичный API модуля состоит из:

- класса `TInvestNodeSDK` для unary- и streaming-запросов;
- выборочных реэкспортов сгенерированных типов, enum'ов и service definition из vendored upstream proto contracts в `contracts/*.proto`.

## Установка

Пакет публикуется в npm под именем `@woodger/t-invest-node-sdk`. Для работы требуется Node.js `>=20.19.0`:

```sh
npm install @woodger/t-invest-node-sdk
```

## Документация

Документация ведется как обычные Markdown-файлы в каталоге `docs`:

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
- [Политики проекта](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/index.md)
- [Политика тестирования](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/testing-policy.md)
- [Политика комментариев в тестах](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/test-comment-style.md)

Отдельного docs-сайта, dev-сервера и сборки статической документации в проекте нет.

## Генерация proto

Генерация TypeScript-кода из vendored proto snapshot запускается через CLI:

```sh
npm run cli -- dev compile-proto
```

Proto compiler берется из окружения. Для генерации нужен `protoc` в `PATH`. TypeScript plugin берется из dev-зависимости `ts-proto`. Официальный upstream — активный репозиторий [`invest-contracts`](https://opensource.tbank.ru/invest/invest-contracts). Зафиксированные tag и commit описаны в [manifest репозитория](https://github.com/woodger/t-invest-node-sdk/blob/main/contracts/upstream.json). Vendored T-Invest контракты хранятся в плоской структуре `contracts/*.proto`, а generated TypeScript — в `src/generated/*.ts`. Команда генерации не скачивает upstream. Контракты и производный generated-код распространяются на условиях Apache License 2.0; лицензионный источник и уведомления приведены в [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

Вспомогательные `google/protobuf/descriptor.proto` и `google/protobuf/timestamp.proto` соответствуют официальному выпуску protobuf `v32.1`; их источник зафиксирован в том же manifest. Версия системного `protoc` не закрепляется проектом. Для побайтового воспроизведения generated файлов нужно использовать версию, указанную в их заголовках; текущая генерация выполнена с `protoc 3.19.6`.

CLI использует собранные файлы из `dist`, поэтому перед первым запуском после изменений в bootstrap TypeScript-коде нужно выполнить:

```sh
npm run build
```

## Публикация релиза

Пакет с областью видимости публикуется как общедоступный благодаря `publishConfig.access`. Сценарий `prepack` выполняет `tsc` перед `npm pack` и `npm publish`. Перед слиянием релизного коммита проверьте версию, changelog и проект:

```sh
VERSION="$(node -p "require('./package.json').version")"

npm run build
npm run lint
npm test
npm pack --dry-run
git status --short
```

После merge в `main` annotated tag создается на актуальном `origin/main`:

```sh
VERSION="$(node -p "require('./package.json').version")"

git fetch origin
git tag -a "$VERSION" "origin/main" -m "$VERSION"
git push origin "$VERSION"
```

Из того же коммита `origin/main` пакет публикуется в общедоступный реестр npm:

```sh
npm publish
```

Для версии `0.5.2` Git tag остается `0.5.2` по исторической схеме проекта, а GitHub Release может называться `v0.5.2`. Release notes берутся из одноименного раздела `CHANGELOG.md`. Annotated tag требует настроенные `git user.name` и `git user.email`.

## Быстрый старт

```ts
import { TInvestNodeSDK } from '@woodger/t-invest-node-sdk';

const token = process.env.T_INVEST_TOKEN?.trim();
const endpoint = process.env.T_INVEST_ENDPOINT?.trim();

if (!token || !endpoint) {
  throw new Error('T_INVEST_TOKEN and T_INVEST_ENDPOINT are required');
}

const sdk = new TInvestNodeSDK({
  token,
  endpoint
});

async function main(): Promise<void> {
  try {
    const { accounts } = await sdk.users.getAccounts({});
    console.log(accounts);
  }
  finally {
    sdk.close();
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
```

Полный вариант с проверкой доступного счета и обработкой ошибки запуска: [Первый SDK-вызов](docs/guides/getting-started.md).

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
- `tls.rootCertificates` - PEM-содержимое custom root CA bundle для одного channel. При отсутствии используется bundled Russian Trusted Root CA.
- `unaryLimiter` - необязательная Consumer-owned стратегия ожидания перед unary-вызовами. Без неё SDK сразу передаёт unary-вызов transport-у.
- `unaryLimits` - per-instance overrides квот. Значения объединяются с `defaultConfig.unaryLimits` и передаются настроенному limiter-у.

Default `useSsl` задаётся package config; явно переданное boolean value имеет приоритет, а `undefined` сохраняет default. `token` и `endpoint` должны быть непустыми строками. `token` и непустой `appName` передаются как строковые gRPC metadata и поэтому могут содержать только печатные ASCII-символы. Поля `maxRequests` и `windowMs` в `unaryLimits` принимают только конечные положительные числа, а keys — известные service names или полные paths поддерживаемых unary RPC. Нарушение этих ограничений завершается `SdkErrorCode.InvalidArgument` с `source: 'sdk'` до создания transport; диагностическое сообщение не повторяет значение token.

Bundled CA применяется только к channel текущего SDK instance и не изменяет system trust store. Явный `tls.rootCertificates` заменяет bundled CA, а не добавляется к нему; SDK принимает содержимое сертификатов в `Buffer`, но не путь к файлу. При `useSsl: false` TLS options игнорируются. Runtime-контракт описан в [TLS policy](docs/tls-policy.md), а источник, юридические границы и техническое подключение asset-а — в [отдельном документе](docs/bundled-ca.md).

Для читаемой группировки overrides по сервисам и методам доступен `defineUnaryLimits()`. Тип вложенного аргумента экспортируется как `UnaryLimitsDefinition`; плоская запись также допустима. Полный контракт `TInvestUnaryLimiter`, точная семантика `acquire()`, cancellation, ownership, ошибки и законченный пример собственной реализации вынесены в отдельное [руководство по unary limiter-у](docs/guides/custom-unary-limiter.md).

Пакет также экспортирует `createInMemoryUnaryLimiter()` как необязательную process-local реализацию с равномерной выдачей permits. Это один из возможных вариантов, а не требование к Consumer-архитектуре.

В исходном package config эти defaults описаны одной типизированной вложенной декларацией; в публичный `defaultConfig.unaryLimits` она компилируется в плоскую runtime-таблицу.

## Опции `defaultConfig`

```ts
interface TInvestNodeSDKConfig {
  unaryLimits: UnaryLimits;
  requireSideEffectConfirmation: boolean;
}
```

- `unaryLimits` - плоская runtime-таблица default unary-квот по generated service names и полным gRPC method paths. Каждое значение содержит `maxRequests` и `windowMs`; более специфичный method path имеет приоритет над сервисным fallback. Общие method quota groups описаны в [лимитной политике](docs/limits-policy.md).
- `requireSideEffectConfirmation` - требовать `--confirm` для CLI-команд с side effects, по умолчанию `true`.

Подробности по официальной лимитной политике API и её связи с SDK: [docs/limits-policy.md](docs/limits-policy.md).

## Политика gRPC-транспорта

SDK явно ограничивает размер одного входящего gRPC-сообщения значением 4 MiB. Это package-owned transport policy из `src/config.ts`, а не неявный default `grpc-js`. Per-instance override намеренно отсутствует.

## CLI

CLI запускается из собранного `dist`, поэтому после изменений в исходниках его нужно пересобрать. Актуальные домены, команды и опции доступны через встроенный `--help`:

```text
npm run build
npm run cli -- --help
npm run cli -- <domain> --help
npm run cli -- <domain> <command> --help
```

Несколько типовых вызовов:

```sh
npm run cli -- account list --format=json
npm run cli -- market last-prices --instrument-id=BBG00QPYJ5H0
npm run cli -- operation portfolio --account-id=2000000000 --format=json
```

После установки SDK как зависимости CLI доступен через `npm exec -- t-invest-node-sdk`. API-команды принимают параметры подключения через `--token` / `T_INVEST_TOKEN` и `--endpoint` / `T_INVEST_ENDPOINT`. Пустое или состоящее только из пробелов CLI-значение не подменяется ENV fallback и завершается usage error с кодом `2`.

Команды с побочными эффектами по умолчанию требуют `--confirm`. Логические опции передаются как флаги (`--raw`, `--no-raw`), без форм `--raw=true` и `--raw=false`. Положительные целочисленные опции должны находиться в безопасном диапазоне JavaScript. Значения дат принимаются в формате RFC 3339 с явным `Z` или числовым смещением timezone.

Коды завершения CLI:

- `0` — команда успешно завершена;
- `2` — ошибка вызова: неизвестная команда, невалидные аргументы, отсутствие обязательного CLI/ENV-значения или невалидная command config;
- `1` — ошибка выполнения, provider-а, файловой системы, вывода или внутреннего определения команды.

Application validators используют публичный `CliUsageError` из `icore`, а terminal policy классифицирует application и framework usage errors единым `isUsageError()`. Формат ошибок и приведённые выше exit codes при этом не изменяются.

Полный список команд и совместимых псевдонимов описан в [API-команды](docs/clean-architecture/api-commands.md). Для потоковых команд есть отдельные [справочник CLI](docs/cli-stream-reference.md) и [справочник по конфигурации](docs/cli-stream-configuration.md). Изменения форматов вывода и инструкции по миграции фиксируются в [CHANGELOG](CHANGELOG.md).

## Доступные сервисы

Экземпляр `TInvestNodeSDK` лениво создает unary-клиенты для сервисов:

- `sdk.instruments`
- `sdk.marketdata`
- `sdk.operations`
- `sdk.orders`
- `sdk.sandbox`
- `sdk.signals`
- `sdk.stoporders`
- `sdk.users`

Все методы этих клиентов соответствуют сгенерированным gRPC-описаниям.

Для streaming RPC доступны клиенты:

- `sdk.marketdataStream`
- `sdk.operationsStream`
- `sdk.ordersStream`

Все клиенты используют общий gRPC channel и metadata. Per-call metadata объединяется с instance metadata; `authorization` и `x-app-name`, заданные SDK, остаются package-owned, а остальные заголовки Consumer-а добавляются к запросу. Закрыть channel можно через `sdk.close()`.

### Lifecycle и отмена

`sdk.close()` идемпотентен. После закрытия service getters и вызовы через ранее полученные clients завершаются `SdkErrorCode.SdkClosed`. Вызовы, которые еще ждут локальную unary-квоту, также отменяются. Уже переданные transport-у unary и stream операции не образуют graceful shutdown barrier: для их детерминированного завершения Consumer должен передать собственный `AbortSignal` и дождаться результата.

`TInvestCallOptions.signal` действует на весь SDK-вызов. При настроенном `unaryLimiter` SDK передаёт ему signal для отмены ожидания, а затем использует тот же signal в gRPC-вызове. Реализация limiter-а должна удалить неотправленную операцию из своей очереди. После выдачи permit и передачи вызова transport-у его не следует возвращать, поскольку provider уже мог учесть request.

`onHeader` и `onTrailer` являются синхронными callbacks. Если callback бросает исключение, соответствующий unary-вызов или stream iteration отклоняется этой же application error; незавершённый transport call отменяется. Асинхронную работу следует запускать и ожидать вне callback-а.

### Ошибки SDK

Из корня пакета экспортируются `SdkError`, `SdkErrorCode`, `SdkErrorSource` и `isSdkError()`. gRPC statuses преобразуются в одноименные стабильные `SdkErrorCode`; исходный transport error сохраняется в `cause`, а `path`, `details` и `source` доступны для диагностики.

Для ошибки с `source: 'grpc'` поле `code` содержит символьное имя стандартного non-OK gRPC status. Например:

```ts
SdkErrorCode.InvalidArgument;    // 'INVALID_ARGUMENT'
SdkErrorCode.NotFound;           // 'NOT_FOUND'
SdkErrorCode.Unauthenticated;    // 'UNAUTHENTICATED'
SdkErrorCode.ResourceExhausted;  // 'RESOURCE_EXHAUSTED'
```

`OK` не входит в error contract. Полный актуальный набор определяет экспортируемый enum `SdkErrorCode`. Значения `SdkErrorCode.SdkClosed` и `SdkErrorCode.UnknownUnaryLimit` являются SDK-specific, а не gRPC statuses. Стандартное имя `code` само по себе не определяет источник: когда это важно, Consumer должен проверять сочетание `code` и `source`.

Однозначные ошибки проверки цепочки сертификатов и соответствия hostname получают `SdkErrorCode.Unavailable` с `source: 'tls'`. Обычный provider или network `UNAVAILABLE` остается `source: 'grpc'`. Поля `path`, `details` и `cause` сохраняются, но Consumer-у не нужно разбирать диагностический текст: стабильной machine-readable границей является `source`.

Локальное превышение внутреннего лимита SDK для входящего gRPC-сообщения сохраняет `SdkErrorCode.ResourceExhausted`, но получает `source: 'sdk'`. Исчерпание квоты провайдера остается `SdkErrorCode.ResourceExhausted` с `source: 'grpc'`. Исходные `path`, `details` и `cause` сохраняются в обоих случаях; Consumer-у не нужно различать эти причины по диагностическому тексту.

Локальная ошибка сериализации исходящего request или разбора входящего response сохраняет `SdkErrorCode.Internal`, но получает `source: 'sdk'`. Provider-side `INTERNAL` остается `source: 'grpc'`. Поля `path`, `details` и `cause` сохраняются; разбирать их для классификации не нужно.

```ts
import {
  isSdkError,
  SdkErrorCode
} from '@woodger/t-invest-node-sdk';

try {
  await sdk.users.getAccounts({});
}
catch (error: unknown) {
  if (isSdkError(error, SdkErrorCode.Unauthenticated)) {
    // Обновить credentials или запросить повторную авторизацию.
  }
  else {
    throw error;
  }
}
```

Локальная отмена получает `SdkErrorCode.Cancelled` с `source: 'abort'`, а provider-side `CANCELLED` — тот же code с `source: 'grpc'`. Не всякий unknown runtime failure обязан быть `SdkError`: guard нужно применять до чтения полей. Brand guard распознает совместимые ошибки из другой физической копии пакета в том же JavaScript realm; JSON, IPC и worker boundaries требуют отдельного application protocol. Код статуса сам по себе не является retry policy. В частности, `ResourceExhausted`, `Unavailable` или `DeadlineExceeded` нельзя автоматически повторять без учета idempotency операции, provider metadata и backoff.

## Подробные примеры

Законченные Consumer-сценарии вынесены из README в отдельные guides:

- [Первый SDK-вызов](docs/guides/getting-started.md) — конфигурация, выбор счета и освобождение ресурсов;
- [Unary-вызовы](docs/guides/unary-calls.md) — портфель, свечи, Signals, deadline и response metadata;
- [Потоки и отмена](docs/guides/streams-and-cancellation.md) — server-side и bidirectional streams с application-owned `AbortSignal`;
- [Ошибки и lifecycle](docs/guides/errors-and-lifecycle.md) — narrowing по `SdkError.code` и `source`, shutdown и retry boundary;
- [Mock-сервисы](docs/guides/testing-with-service-definitions.md) — Consumer tests через root-exported service definitions без deep imports.

Guides показывают workflow, но не дублируют полный generated reference. Актуальные request/response DTO, enum-ы и service methods определяются публичными types и vendored proto contracts.

## Экспорты

Пакет реэкспортирует:
- `Timestamp`;
- типы, enum'ы и их JSON-конвертеры из `common`, `instruments`, `marketdata`, `operations`, `orders`, `sandbox`, `signals`, `stoporders`, `users`;
- package-owned service interfaces `UsersService`, `OrdersService`, `MarketDataService` и т.п.
- generated server-side `*ServiceDefinition` и `*ServiceImplementation` contracts для nice-grpc server adapters.

Generated `*ServiceClient` contracts остаются внутренними transport contracts и не входят в root exports.

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

Сведения о сторонних контрактах и generated-коде включены в [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
