# Node.js SDK for T-Invest API

Минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Invest через `nice-grpc`.

Текущий публичный API модуля состоит из:
- класса `TInvestNodeSDK` для unary-запросов;
- выборочных реэкспортов сгенерированных типов, enum'ов и service definition из
  vendored upstream proto contracts в `contracts/*.proto`.

## Установка из GitHub

Пакет предназначен для установки напрямую из GitHub и не публикуется в npm.
Для приватного репозитория у окружения должен быть настроен SSH-доступ:

```sh
yarn add "git+ssh://git@github.com/woodger/t-invest-node-sdk.git#0.4.1"
```

Tag фиксирует устанавливаемую версию, а lifecycle `prepare` собирает TypeScript
после получения Git dependency.

## Документация

Документация ведется как обычные Markdown-файлы в каталоге `docs`:

- [Навигация по документации](docs/index.md)
- [Руководства для Consumer-ов](docs/guides/index.md)
- [Архитектура SDK](docs/architecture.md)
- [Clean Architecture Notes](docs/clean-architecture/index.md)
- [Разделение форматирования и вывода в CLI](docs/clean-architecture/cli-output-boundaries.md)
- [Stream CLI Reference](docs/cli-stream-reference.md)
- [Stream CLI Configuration Reference](docs/cli-stream-configuration.md)
- [Лимитная политика API](docs/limits-policy.md)
- [TLS-доверие](docs/tls-policy.md)
- [Политики проекта](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/index.md)
- [Политика тестирования](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/testing-policy.md)
- [Политика комментариев в тестах](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/test-comment-style.md)

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

## GitHub release

Пакет помечен как `private`, поэтому registry publication для него отключена.
Перед merge release commit проверьте версию и проект:

```sh
VERSION="$(node -p "require('./package.json').version")"

yarn build
yarn lint
yarn test
git status --short
```

После merge в `main` annotated tag создается на актуальном `origin/main`:

```sh
VERSION="$(node -p "require('./package.json').version")"

git fetch origin
git tag -a "$VERSION" "origin/main" -m "$VERSION"
git push origin "$VERSION"
```

Для версии `0.4.1` Git tag остается `0.4.1` по исторической схеме проекта, а
GitHub Release может называться `v0.4.1`. Release notes берутся из одноименного
раздела `CHANGELOG.md`. Annotated tag требует настроенные `git user.name` и
`git user.email`.

## Быстрый старт

```ts
import { TInvestNodeSDK } from 't-invest-node-sdk';

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

Полный вариант с проверкой доступного счета и обработкой ошибки запуска:
[Первый SDK-вызов](docs/guides/getting-started.md).

## Опции `TInvestNodeSDK`

```ts
interface TInvestOptions {
  token: string;
  endpoint: string;
  appName?: string;
  useSsl?: boolean;
  tls?: TInvestTlsOptions;
  trackLimits?: boolean;
  unaryLimits?: UnaryLimits;
}

interface TInvestTlsOptions {
  rootCertificates?: Buffer;
}

type UnaryLimits = Record<string, number>;
```

- `token` - OAuth токен.
- `endpoint` - gRPC endpoint в формате `host:port`.
- `appName` - необязательное значение для заголовка `x-app-name`.
- `useSsl` - использовать TLS, по умолчанию `true`.
- `tls.rootCertificates` - PEM-содержимое custom root CA bundle для одного
  channel. При отсутствии используется bundled Russian Trusted Root CA.
- `trackLimits` - включить локальный throttling unary-запросов, по умолчанию `true`.
- `unaryLimits` - per-instance overrides лимитов в запросах за минуту. Значения
  объединяются с `defaultConfig.unaryLimits` при создании SDK.

Defaults `useSsl` и `trackLimits` задаются package config; явно переданные
boolean values имеют приоритет, а `undefined` сохраняет безопасный default.
`token` и `endpoint` должны быть непустыми строками. Прямой SDK-вызов с пустым
значением завершается `SdkErrorCode.InvalidArgument` с `source: 'sdk'`.

Bundled CA применяется только к channel текущего SDK instance и не изменяет
system trust store. Явный `tls.rootCertificates` заменяет bundled CA, а не
добавляется к нему; SDK принимает содержимое сертификатов в `Buffer`, но не
путь к файлу. При `useSsl: false` TLS options игнорируются. Полный контракт и
provenance asset описаны в [TLS policy](docs/tls-policy.md).

Для читаемой группировки лимитов по сервисам и методам используйте
`defineUnaryLimits()`. `default` задает сервисный fallback, а `methods` —
исключения для отдельных RPC:

```ts
import {
  defineUnaryLimits,
  TInvestNodeSDK
} from 't-invest-node-sdk';

const sdk = new TInvestNodeSDK({
  token,
  endpoint,
  unaryLimits: defineUnaryLimits({
    UsersService: {
      default: 50
    },
    OrdersService: {
      methods: {
        PostOrder: 300
      }
    }
  })
});
```

Helper возвращает прежний плоский `UnaryLimits`, поэтому плоская запись также
остается доступна для совместимости. Тип вложенного аргумента экспортируется
как `UnaryLimitsDefinition`. Package defaults могут объединять несколько
method rules в общий quota bucket; per-instance override с другим значением
делает отдельный метод самостоятельным правилом. Одинаковый override всех
методов группы сохраняет общий bucket.

В исходном package config эти defaults описаны одной типизированной вложенной
декларацией; в публичный `defaultConfig.unaryLimits` она компилируется в
совместимую плоскую runtime-таблицу.

## Опции `defaultConfig`

```ts
interface TInvestNodeSDKConfig {
  unaryLimits: UnaryLimits;
  requireSideEffectConfirmation: boolean;
}
```

- `unaryLimits` - плоская runtime-таблица default unary-лимитов по generated
  service names и полным gRPC method paths. Более специфичный method path
  имеет приоритет над сервисным fallback. Общие method quota groups описаны в
  [лимитной политике](docs/limits-policy.md).
- `requireSideEffectConfirmation` - требовать `--confirm` для CLI-команд с
  side effects, по умолчанию `true`.

Подробности по официальной лимитной политике API и её связи с SDK: [docs/limits-policy.md](docs/limits-policy.md).

## gRPC transport policy

SDK явно ограничивает размер одного входящего gRPC-сообщения значением 4 MiB.
Это package-owned transport policy из `src/config.ts`, а не неявный default
`grpc-js`. Per-instance override намеренно отсутствует.

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
`yarn t-invest-node-sdk`. API-команды принимают параметры подключения через
`--token` / `T_INVEST_TOKEN` и `--endpoint` / `T_INVEST_ENDPOINT`.
Пустое или состоящее только из пробелов CLI-значение не подменяется ENV fallback
и завершается usage error с кодом `2`.

Команды с побочными эффектами по умолчанию требуют `--confirm`. Логические опции
передаются как флаги (`--raw`, `--no-raw`), без форм `--raw=true` и
`--raw=false`.

Коды завершения CLI:

- `0` — команда успешно завершена;
- `2` — ошибка вызова: неизвестная команда, невалидные аргументы, отсутствие
  обязательного CLI/ENV-значения или невалидная command config;
- `1` — ошибка выполнения, provider-а, файловой системы, вывода или внутреннего
  определения команды.

Application validators используют публичный `CliUsageError` из `icore`, а
terminal policy классифицирует application и framework usage errors единым
`isUsageError()`. Формат ошибок и приведённые выше exit codes при этом не
изменяются.

Полный список команд и совместимых псевдонимов описан в
[API Commands](docs/clean-architecture/api-commands.md). Для потоковых команд
есть отдельные [справочник CLI](docs/cli-stream-reference.md) и
[справочник по конфигурации](docs/cli-stream-configuration.md). Изменения
форматов вывода и инструкции по миграции фиксируются в
[CHANGELOG](CHANGELOG.md).

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

Все клиенты используют общий gRPC channel и metadata. Per-call metadata
объединяется с instance metadata; `authorization` и `x-app-name`, заданные SDK,
остаются package-owned, а остальные заголовки Consumer-а добавляются к запросу.
Закрыть channel можно через `sdk.close()`.

### Lifecycle и отмена

`sdk.close()` идемпотентен. После закрытия service getters и вызовы через ранее
полученные clients завершаются `SdkErrorCode.SdkClosed`. Вызовы, которые еще
ждут локальную unary-квоту, также отменяются. Уже переданные transport-у unary
и stream операции не образуют graceful shutdown barrier: для их
детерминированного завершения Consumer должен передать собственный
`AbortSignal` и дождаться результата.

`TInvestCallOptions.signal` действует на весь SDK-вызов. Он отменяет как
ожидание локального throttling, так и последующий gRPC-вызов. Если операция
отменена во время ожидания, ее reservation удаляется из quota bucket, а
следующие вызовы занимают освободившийся слот. После выдачи локального слота и
передачи вызова transport-у слот не возвращается, поскольку provider уже мог
учесть запрос.

### Ошибки SDK

Из корня пакета экспортируются `SdkError`, `SdkErrorCode`, `SdkErrorSource` и
`isSdkError()`. gRPC statuses преобразуются в одноименные стабильные
`SdkErrorCode`; исходный transport error сохраняется в `cause`, а `path`,
`details` и `source` доступны для диагностики.

Для ошибки с `source: 'grpc'` поле `code` содержит символьное имя стандартного
non-OK gRPC status. Например:

```ts
SdkErrorCode.InvalidArgument;    // 'INVALID_ARGUMENT'
SdkErrorCode.NotFound;           // 'NOT_FOUND'
SdkErrorCode.Unauthenticated;    // 'UNAUTHENTICATED'
SdkErrorCode.ResourceExhausted;  // 'RESOURCE_EXHAUSTED'
```

`OK` не входит в error contract. Полный актуальный набор определяет
экспортируемый enum `SdkErrorCode`. Значения `SdkErrorCode.SdkClosed` и
`SdkErrorCode.UnknownUnaryLimit` являются SDK-specific, а не gRPC statuses.
Стандартное имя `code` само по себе не определяет источник: когда это важно,
Consumer должен проверять сочетание `code` и `source`.

Однозначные ошибки проверки цепочки сертификатов и соответствия hostname
получают `SdkErrorCode.Unavailable` с `source: 'tls'`. Обычный provider или
network `UNAVAILABLE` остается `source: 'grpc'`. Поля `path`, `details` и
`cause` сохраняются, но Consumer-у не нужно разбирать диагностический текст:
стабильной machine-readable границей является `source`.

```ts
import {
  isSdkError,
  SdkErrorCode
} from 't-invest-node-sdk';

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

Локальная отмена получает `SdkErrorCode.Cancelled` с `source: 'abort'`, а
provider-side `CANCELLED` — тот же code с `source: 'grpc'`. Не всякий unknown
runtime failure обязан быть `SdkError`: guard нужно применять до чтения полей.
Brand guard распознает совместимые ошибки из другой физической копии пакета в
том же JavaScript realm; JSON, IPC и worker boundaries требуют отдельного
application protocol.
Код статуса сам по себе не является retry policy. В частности,
`ResourceExhausted`, `Unavailable` или `DeadlineExceeded` нельзя автоматически
повторять без учета idempotency операции, provider metadata и backoff.

## Подробные примеры

Законченные Consumer-сценарии вынесены из README в отдельные guides:

- [Первый SDK-вызов](docs/guides/getting-started.md) — конфигурация, выбор счета
  и освобождение ресурсов;
- [Unary-вызовы](docs/guides/unary-calls.md) — портфель, свечи, Signals,
  deadline и response metadata;
- [Streams и отмена](docs/guides/streams-and-cancellation.md) — server-side и
  bidirectional streams с application-owned `AbortSignal`;
- [Ошибки и lifecycle](docs/guides/errors-and-lifecycle.md) — narrowing по
  `SdkError.code` и `source`, shutdown и retry boundary;
- [Mock-сервисы](docs/guides/testing-with-service-definitions.md) — Consumer
  tests через root-exported service definitions без deep imports.

Guides показывают workflow, но не дублируют полный generated reference.
Актуальные request/response DTO, enum-ы и service methods определяются
публичными types и vendored proto contracts.

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
  TInvestNodeSDK,
  CandleInterval,
  InstrumentsService,
  MarketDataStreamService,
} from 't-invest-node-sdk';
```

## Дисклеймер

Проект является независимой реализацией и не имеет никакого отношения к
T-Invest, T-Банку или их аффилированным лицам. Названия продуктов и компаний
используются только для обозначения совместимости с публичным API.

Сведения о сторонних контрактах и generated-коде включены в [LICENSE](LICENSE).
