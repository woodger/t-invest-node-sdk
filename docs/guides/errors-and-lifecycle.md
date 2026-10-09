# Ошибки и lifecycle

> Type: Guide. Здесь показано, как разбирать `SdkError` по стабильным полям и не привязывать Consumer к transport error classes.

## Сужение типа по коду и источнику

Один `code` не всегда определяет причину ошибки. Например, `CANCELLED` может прийти от локального `AbortSignal` или от provider-а. Когда это влияет на решение Consumer-а, проверяйте сочетание `code` и `source`.

Во фрагментах ниже `sdk` — уже созданный экземпляр SDK. Его настройка и освобождение показаны в руководстве [Первый SDK-вызов](./getting-started.md). Каждый пример рассматривает отдельный случай; остальные ошибки передаются вызывающему коду.

```ts
import { isSdkError, SdkErrorCode } from '@woodger/t-invest-node-sdk';
```

### Ошибка TLS

```ts
try {
  await sdk.users.getAccounts({});
}
catch (error) {
  if (
    isSdkError(error, SdkErrorCode.Unavailable)
    && error.source === 'tls'
  ) {
    console.error('Проверьте адрес API и настройки CA-сертификата');
  }
  else {
    throw error;
  }
}
```

### Локальный deadline

```ts
const deadline = AbortSignal.timeout(5_000);

try {
  await sdk.users.getAccounts({}, { signal: deadline });
}
catch (error) {
  if (
    deadline.aborted
    && isSdkError(error, SdkErrorCode.Cancelled)
    && error.source === 'abort'
  ) {
    console.error('Истёк срок ожидания запроса');
  }
  else {
    throw error;
  }
}
```

### Ошибка авторизации

```ts
try {
  await sdk.users.getAccounts({});
}
catch (error) {
  if (
    isSdkError(error, SdkErrorCode.Unauthenticated)
    && error.source === 'grpc'
  ) {
    console.error('Провайдер отклонил токен', { path: error.path });
  }
  else {
    throw error;
  }
}
```

### Лимит сообщения и квота провайдера

Один `ResourceExhausted` может обозначать разные ограничения. Здесь ошибка после диагностики передаётся дальше: решение о повторе вызова остаётся у приложения.

```ts
try {
  await sdk.users.getAccounts({});
}
catch (error) {
  if (!isSdkError(error, SdkErrorCode.ResourceExhausted)) {
    throw error;
  }

  if (error.source === 'sdk') {
    console.error('Ответ превысил локальный лимит gRPC-сообщения', {
      path: error.path
    });
  }
  else if (error.source === 'grpc') {
    console.error('Исчерпана квота провайдера', {
      path: error.path,
      details: error.details
    });
  }

  throw error;
}
```

## Коды ошибок

SDK преобразует gRPC statuses в одноимённые стабильные `SdkErrorCode`.

Для ошибки с `source: 'grpc'` поле `code` содержит символьное имя стандартного non-OK gRPC status. Например:

```ts
SdkErrorCode.InvalidArgument;    // 'INVALID_ARGUMENT'
SdkErrorCode.NotFound;           // 'NOT_FOUND'
SdkErrorCode.Unauthenticated;    // 'UNAUTHENTICATED'
SdkErrorCode.ResourceExhausted;  // 'RESOURCE_EXHAUSTED'
```

Error contract не включает `OK`; полный набор значений задаёт экспортируемый enum `SdkErrorCode`. `SdkErrorCode.SdkClosed` и `SdkErrorCode.UnknownUnaryLimit` относятся к SDK, а не к gRPC. Поле `code` само по себе не указывает источник ошибки, поэтому при необходимости проверяйте его вместе с `source`.

## Интерпретация источника

| `source` | Значение |
| --- | --- |
| `grpc` | Ошибка получена от transport/provider boundary |
| `tls` | Transport не прошел проверку цепочки сертификатов или hostname |
| `abort` | Вызов отменен Consumer-ом через `AbortSignal` |
| `lifecycle` | SDK уже закрыт |
| `sdk` | SDK отклонил локальную конфигурацию, request или runtime state |

`SdkErrorCode.InvalidArgument` получает `source: 'grpc'` при provider validation и `source: 'sdk'` при локальной ошибке конфигурации. Поэтому определяйте источник не только по code.

Не каждая unknown runtime error — это `SdkError`. Сначала вызовите `isSdkError()`, а неизвестную ошибку сохраните или передайте дальше без принудительного приведения типа. Например, SDK не оборачивает в `SdkError` синхронное исключение application callback-а `onHeader` или `onTrailer`.

SDK помечает однозначные ошибки проверки цепочки сертификатов и hostname как `SdkErrorCode.Unavailable` с `source: 'tls'`. Обычный provider или network `UNAVAILABLE` сохраняет `source: 'grpc'`. Поля `path`, `details` и `cause` остаются доступными для диагностики, а для надёжной классификации используйте `source`.

Если входящее gRPC-сообщение превышает внутренний лимит SDK, ошибка получает `SdkErrorCode.ResourceExhausted` и `source: 'sdk'`. Исчерпанная квота провайдера возвращает тот же code с `source: 'grpc'`. В обоих случаях SDK сохраняет исходные `path`, `details` и `cause`; различайте причины по `source`, а не по диагностическому тексту.

Локальные ошибки сериализации request и разбора response получают `SdkErrorCode.Internal` с `source: 'sdk'`, а provider-side `INTERNAL` сохраняет `source: 'grpc'`. SDK оставляет `path`, `details` и `cause` для диагностики; для классификации достаточно `source`.

## Диагностические поля

- `path` содержит gRPC method path, когда он известен.
- `details` содержит диагностический текст transport/provider-а. Это не стабильный provider business code, поэтому не разбирайте его регулярным выражением.
- `cause` сохраняет исходную ошибку, но остается transport-specific диагностикой. Business logic не должна зависеть от класса ошибки `nice-grpc`.

Однозначные certificate trust и hostname verification failures получают `SdkErrorCode.Unavailable` с `source: 'tls'`. DNS failures, connection refusal/reset, timeout и обычный provider `UNAVAILABLE` сохраняют `source: 'grpc'`. По `source` можно сразу завершить вызов при ошибке TLS, не разбирая `details` и не запуская общий availability retry.

Ошибки сериализации request и разбора response получают `SdkErrorCode.Internal` с `source: 'sdk'`, а provider-side `INTERNAL` сохраняет `source: 'grpc'`. Для различения достаточно `source`; используйте исходные `path`, `details` и `cause` только для диагностики.

Brand guard распознает совместимый `SdkError` из другой физической копии пакета в том же JavaScript realm. После JSON, IPC или worker serialization нужен отдельный application protocol.

## Закрытие SDK

`sdk.close()` можно вызывать повторно. Первый вызов:

- запрещает новые service getters и calls через ранее полученные clients;
- отменяет операции, которые еще ждут локальную unary-квоту;
- закрывает shared channel.

`sdk.close()` не ждёт операции, уже переданные transport-у. Для предсказуемого shutdown отмените их собственный `AbortSignal`, дождитесь settlement и только затем закройте SDK. Stream lifecycle подробно разобран в руководстве [Потоки и отмена](./streams-and-cancellation.md).

## Граница повторных попыток

SDK намеренно не считает ошибку retryable только по gRPC status. Перед повтором проверьте:

- idempotent ли операция;
- мог ли provider уже применить side effect;
- присутствует ли retry/rate-limit metadata;
- какой backoff и общий deadline допустимы для приложения.

Особенно это относится к `ResourceExhausted`, `Unavailable`, `DeadlineExceeded` и mutation RPC. Универсальный retry interceptor на уровне SDK скрыл бы эти различия.

Для `ResourceExhausted` сначала проверяйте `source`. Значение `sdk` означает, что входящее сообщение превысило внутренний транспортный лимит SDK; повтор того же вызова ничего не изменит. Значение `grpc` указывает на ответ провайдера, но тоже не даёт достаточных оснований для повтора без учёта metadata, idempotency и backoff.
