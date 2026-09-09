# Node.js SDK for T-Invest API

[![npm version](https://img.shields.io/npm/v/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![node](https://img.shields.io/node/v/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![types](https://img.shields.io/npm/types/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![license](https://img.shields.io/npm/l/%40woodger%2Ft-invest-node-sdk.svg)](LICENSE)

Минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Invest через `nice-grpc`.

Публичный API включает:

- класса `TInvestNodeSDK` для unary- и streaming-запросов;
- выборочных реэкспортов сгенерированных типов, enum'ов и service definition из vendored upstream proto contracts в `contracts/*.proto`.

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
- [Политики проекта](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/index.md)
- [Политика тестирования](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/testing-policy.md)
- [Политика комментариев в тестах](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/test-comment-style.md)

Отдельного docs-сайта, dev-сервера и сборки статической документации в проекте нет.

## Генерация proto

Чтобы сгенерировать TypeScript-код из proto-файлов проекта, выполните:

```sh
npm run cli -- dev compile-proto
```

Проект использует закреплённые dev-зависимости `protoc` и `ts-proto`, поэтому устанавливать compiler в систему не нужно. Официальный upstream — активный репозиторий [`invest-contracts`](https://opensource.tbank.ru/invest/invest-contracts). [Manifest репозитория](https://github.com/woodger/t-invest-node-sdk/blob/main/contracts/upstream.json) хранит точные tag и commit. T-Invest контракты лежат в плоской структуре `contracts/*.proto`, а generated TypeScript — в `src/generated/*.ts`. Генератор работает только с локальными файлами и не скачивает upstream. Контракты и производный generated-код распространяются по Apache License 2.0; источник лицензии и уведомления собраны в [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

Вспомогательные `google/protobuf/descriptor.proto` и `google/protobuf/timestamp.proto` взяты из официального выпуска protobuf `v32.1`; тот же manifest хранит их источник. `package.json` закрепляет версию compiler-а, сейчас это `protoc 36.0`.

CLI использует собранные файлы из `dist`, поэтому перед первым запуском после изменений в bootstrap TypeScript-коде нужно выполнить:

```sh
npm run build
```

## Публикация релиза

`publishConfig.access` делает scoped-пакет общедоступным. Сценарий `prepack` запускает `tsc` перед `npm pack` и `npm publish`. Перед слиянием релизного коммита проверьте версию, changelog и проект:

```sh
VERSION="$(node -p "require('./package.json').version")"

npm run build
npm run lint
npm test
npm pack --dry-run
git status --short
```

После merge в `main` создайте annotated tag на актуальном `origin/main`:

```sh
VERSION="$(node -p "require('./package.json').version")"

git fetch origin
git tag -a "$VERSION" "origin/main" -m "$VERSION"
git push origin "$VERSION"
```

Из того же коммита `origin/main` опубликуйте пакет в npm:

```sh
npm publish
```

По принятой в проекте схеме версия `0.5.3` получает Git tag `0.5.3`, а GitHub Release можно назвать `v0.5.3`. Возьмите release notes из одноимённого раздела `CHANGELOG.md`. Для annotated tag настройте `git user.name` и `git user.email`.

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

Более полный пример с проверкой доступного счёта и обработкой ошибки запуска: [Первый SDK-вызов](docs/guides/getting-started.md).

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
- `unaryLimiter` - необязательная Consumer-owned стратегия ожидания перед unary-вызовами. Без неё SDK сразу передаёт unary-вызов transport-у.
- `unaryLimits` - per-instance overrides квот. Значения объединяются с `defaultConfig.unaryLimits` и передаются настроенному limiter-у.

Package config задаёт default для `useSsl`; явное boolean value имеет приоритет, а `undefined` сохраняет default. SDK принимает только непустые `token` и `endpoint`. gRPC metadata для `token` и непустого `appName` допускают только печатные ASCII-символы. В `unaryLimits` поля `maxRequests` и `windowMs` должны быть конечными положительными числами, а keys — известными service names или полными paths поддерживаемых unary RPC. При ошибке SDK до создания transport бросает `SdkErrorCode.InvalidArgument` с `source: 'sdk'` и не повторяет token в сообщении.

SDK подключает bundled CA только к channel текущего instance и не меняет system trust store. Явный `tls.rootCertificates` полностью заменяет bundled CA; передавайте содержимое сертификатов в `Buffer`, а не путь к файлу. При `useSsl: false` SDK игнорирует TLS options. Подробнее о runtime-контракте читайте в [TLS policy](docs/tls-policy.md), а об источнике, юридических границах и подключении asset-а — в [отдельном документе](docs/bundled-ca.md).

Используйте `defineUnaryLimits()`, чтобы сгруппировать overrides по сервисам и методам. Тип вложенного аргумента экспортирован как `UnaryLimitsDefinition`; плоская запись тоже поддерживается. Отдельное [руководство по unary limiter-у](docs/guides/custom-unary-limiter.md) подробно разбирает `TInvestUnaryLimiter`, семантику `acquire()`, cancellation, ownership, ошибки и законченную собственную реализацию.

Пакет также экспортирует `createInMemoryUnaryLimiter()` как необязательную process-local реализацию с равномерной выдачей permits. Это один из возможных вариантов, а не требование к Consumer-архитектуре.

Исходный package config хранит эти defaults в одной типизированной вложенной декларации. Для публичного `defaultConfig.unaryLimits` SDK компилирует её в плоскую runtime-таблицу.

## Опции `defaultConfig`

```ts
interface TInvestNodeSDKConfig {
  unaryLimits: UnaryLimits;
  requireSideEffectConfirmation: boolean;
}
```

- `unaryLimits` - плоская runtime-таблица default unary-квот по generated service names и полным gRPC method paths. Каждое значение содержит `maxRequests` и `windowMs`; более специфичный method path имеет приоритет над сервисным fallback. Общие method quota groups описаны в [лимитной политике](docs/limits-policy.md).
- `requireSideEffectConfirmation` - требовать `--confirm` для CLI-команд с side effects, по умолчанию `true`.

Подробнее о лимитах API и их связи с SDK: [docs/limits-policy.md](docs/limits-policy.md).

## Политика gRPC-транспорта

SDK принимает входящие gRPC-сообщения размером не более 4 MiB. Этот предел задаёт package-owned transport policy в `src/config.ts`, а не неявный default `grpc-js`. Per-instance override намеренно отсутствует.

## CLI

CLI работает из собранного `dist`, поэтому после изменений в исходниках его нужно пересобрать. Встроенный `--help` покажет актуальные домены, команды и опции:

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

После установки SDK запускайте CLI через `npm exec -- t-invest-node-sdk`. Передайте параметры подключения через `--token` / `T_INVEST_TOKEN` и `--endpoint` / `T_INVEST_ENDPOINT`. Если CLI-значение пустое или состоит только из пробелов, SDK не подменяет его ENV fallback и возвращает usage error с кодом `2`.

Команды с побочными эффектами по умолчанию требуют `--confirm`. Передавайте логические опции как флаги (`--raw`, `--no-raw`), без форм `--raw=true` и `--raw=false`. Положительные целочисленные опции должны помещаться в безопасный диапазон JavaScript. Для дат используйте RFC 3339 с явным `Z` или числовым смещением timezone.

Коды завершения CLI:

- `0` — команда завершилась успешно;
- `2` — ошибка вызова: неизвестная команда, невалидные аргументы, отсутствие обязательного CLI/ENV-значения или невалидная command config;
- `1` — ошибка выполнения, provider-а, файловой системы, вывода или внутреннего определения команды.

Application validators используют публичный `CliUsageError` из `icore`, а terminal policy распознаёт application и framework usage errors через общий `isUsageError()`. Оба случая получают одинаковый формат ошибки и приведённые выше exit codes.

Полный список команд и совместимых псевдонимов описан в [API-команды](docs/clean-architecture/api-commands.md). Для потоковых команд есть отдельные [справочник CLI](docs/cli-stream-reference.md) и [справочник по конфигурации](docs/cli-stream-configuration.md). Изменения форматов вывода и инструкции по миграции фиксируются в [CHANGELOG](CHANGELOG.md).

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

`sdk.close()` идемпотентен. После закрытия обращение к service getters и вызовы через ранее полученные clients завершаются ошибкой с кодом `SdkErrorCode.SdkClosed`; вызовы, которые ещё ждут локальную unary-квоту, отменяются. `sdk.close()` не ждёт уже переданные transport-у unary- и stream-операции. Чтобы завершить их предсказуемо, передайте собственный `AbortSignal` и дождитесь результата.

`TInvestCallOptions.signal` действует на весь SDK-вызов. Если настроен `unaryLimiter`, SDK сначала передаёт ему signal для отмены ожидания, а затем использует тот же signal в gRPC-вызове. Limiter должен удалить неотправленную операцию из очереди. После выдачи permit и передачи вызова transport-у не возвращайте permit: provider уже мог учесть request.

`onHeader` и `onTrailer` — синхронные callbacks. Если callback бросает исключение, SDK отклоняет той же application error соответствующий unary-вызов или stream iteration и отменяет незавершённый transport call. Запускайте и ожидайте асинхронную работу вне callback-а.

### Ошибки SDK

Корень пакета экспортирует `SdkError`, `SdkErrorCode`, `SdkErrorSource` и `isSdkError()`. SDK преобразует gRPC statuses в одноимённые стабильные `SdkErrorCode`, сохраняет исходный transport error в `cause` и оставляет `path`, `details` и `source` для диагностики.

Для ошибки с `source: 'grpc'` поле `code` содержит символьное имя стандартного non-OK gRPC status. Например:

```ts
SdkErrorCode.InvalidArgument;    // 'INVALID_ARGUMENT'
SdkErrorCode.NotFound;           // 'NOT_FOUND'
SdkErrorCode.Unauthenticated;    // 'UNAUTHENTICATED'
SdkErrorCode.ResourceExhausted;  // 'RESOURCE_EXHAUSTED'
```

Error contract не включает `OK`; полный набор значений задаёт экспортируемый enum `SdkErrorCode`. `SdkErrorCode.SdkClosed` и `SdkErrorCode.UnknownUnaryLimit` относятся к SDK, а не к gRPC. Поле `code` само по себе не указывает источник ошибки, поэтому при необходимости проверяйте его вместе с `source`.

SDK помечает однозначные ошибки проверки цепочки сертификатов и hostname как `SdkErrorCode.Unavailable` с `source: 'tls'`. Обычный provider или network `UNAVAILABLE` сохраняет `source: 'grpc'`. Поля `path`, `details` и `cause` остаются доступными для диагностики, а для надёжной классификации используйте `source`.

Если входящее gRPC-сообщение превышает внутренний лимит SDK, ошибка получает `SdkErrorCode.ResourceExhausted` и `source: 'sdk'`. Исчерпанная квота провайдера возвращает тот же code с `source: 'grpc'`. В обоих случаях SDK сохраняет исходные `path`, `details` и `cause`; различайте причины по `source`, а не по диагностическому тексту.

Локальные ошибки сериализации request и разбора response получают `SdkErrorCode.Internal` с `source: 'sdk'`, а provider-side `INTERNAL` сохраняет `source: 'grpc'`. SDK оставляет `path`, `details` и `cause` для диагностики; для классификации достаточно `source`.

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

Локальная отмена получает `SdkErrorCode.Cancelled` с `source: 'abort'`, а provider-side `CANCELLED` — тот же code с `source: 'grpc'`. Не считайте любую unknown runtime error экземпляром `SdkError`: сначала вызовите guard, затем читайте поля. Brand guard распознаёт совместимые ошибки из другой физической копии пакета в том же JavaScript realm; после JSON, IPC или worker serialization нужен отдельный application protocol. Status code не задаёт retry policy. Не повторяйте автоматически `ResourceExhausted`, `Unavailable` или `DeadlineExceeded` без учёта idempotency операции, provider metadata и backoff.

## Подробные примеры

Подробные Consumer-сценарии собраны в отдельных guides:

- [Первый SDK-вызов](docs/guides/getting-started.md) — конфигурация, выбор счета и освобождение ресурсов;
- [Unary-вызовы](docs/guides/unary-calls.md) — портфель, свечи, Signals, deadline и response metadata;
- [Потоки и отмена](docs/guides/streams-and-cancellation.md) — server-side и bidirectional streams с application-owned `AbortSignal`;
- [Ошибки и lifecycle](docs/guides/errors-and-lifecycle.md) — narrowing по `SdkError.code` и `source`, shutdown и retry boundary;
- [Mock-сервисы](docs/guides/testing-with-service-definitions.md) — Consumer tests через root-exported service definitions без deep imports.

Guides показывают workflow, но не повторяют полный generated reference. Актуальные request/response DTO, enum-ы и service methods смотрите в публичных types и proto contracts проекта.

## Экспорты

Пакет реэкспортирует:

- `Timestamp`;
- типы, enum'ы и их JSON-конвертеры из `common`, `instruments`, `marketdata`, `operations`, `orders`, `sandbox`, `signals`, `stoporders`, `users`;
- package-owned service interfaces `UsersService`, `OrdersService`, `MarketDataService` и т.п.
- generated server-side `*ServiceDefinition` и `*ServiceImplementation` contracts для nice-grpc server adapters.

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

Сведения о сторонних контрактах и generated-коде включены в [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).
