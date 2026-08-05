# Ошибки и lifecycle

> Type: Guide. Руководство показывает machine-readable обработку `SdkError`
> без привязки Consumer-а к transport error classes.

## Narrowing по коду и источнику

Один `code` не всегда определяет причину ошибки. Например, `CANCELLED` может
прийти от локального `AbortSignal` или от provider-а. Когда это влияет на
решение Consumer-а, проверяйте сочетание `code` и `source`.

```ts
import {
  isSdkError,
  SdkErrorCode,
  TInvestNodeSDK
} from 't-invest-node-sdk';

type RequiredEnvironmentVariable =
  | 'T_INVEST_TOKEN'
  | 'T_INVEST_ENDPOINT';

function requireEnvironment(name: RequiredEnvironmentVariable): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
}

async function main(): Promise<void> {
  const sdk = new TInvestNodeSDK({
    token: requireEnvironment('T_INVEST_TOKEN'),
    endpoint: requireEnvironment('T_INVEST_ENDPOINT')
  });
  const deadline = AbortSignal.timeout(5_000);

  try {
    const response = await sdk.users.getAccounts(
      {},
      {
        signal: deadline
      }
    );

    console.log(response.accounts);
  }
  catch (error: unknown) {
    if (
      isSdkError(error, SdkErrorCode.Cancelled)
      && error.source === 'abort'
      && deadline.aborted
    ) {
      console.error('The local request deadline expired');
      return;
    }

    if (
      isSdkError(error, SdkErrorCode.Unauthenticated)
      && error.source === 'grpc'
    ) {
      console.error('The provider rejected the supplied credentials', {
        path: error.path
      });
      process.exitCode = 1;
      return;
    }

    if (
      isSdkError(error, SdkErrorCode.ResourceExhausted)
      && error.source === 'grpc'
    ) {
      console.error('The provider quota was exhausted', {
        path: error.path,
        details: error.details
      });

      throw error;
    }

    throw error;
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

## Интерпретация источника

| `source` | Значение |
| --- | --- |
| `grpc` | Ошибка получена от transport/provider boundary |
| `abort` | Вызов отменен Consumer-ом через `AbortSignal` |
| `lifecycle` | SDK уже закрыт |
| `sdk` | SDK отклонил локальную конфигурацию или runtime state |

`SdkErrorCode.InvalidArgument` может иметь `source: 'grpc'` для provider
validation или `source: 'sdk'` для локально отклоненной конфигурации. По этой
причине обработчик не должен классифицировать источник только по имени code.

Не всякий `unknown` runtime failure обязан быть `SdkError`. Сначала применяйте
`isSdkError()`, а неизвестную ошибку сохраняйте или передавайте дальше без
насильственного приведения типа.

## Диагностические поля

- `path` содержит gRPC method path, когда он известен.
- `details` содержит диагностический текст transport/provider-а. Это не
  стабильный provider business code и его не следует разбирать регулярным
  выражением.
- `cause` сохраняет исходную ошибку, но остается transport-specific
  диагностикой. Business logic не должна зависеть от класса ошибки
  `nice-grpc`.

Brand guard распознает совместимый `SdkError` из другой физической копии
пакета в том же JavaScript realm. После JSON, IPC или worker serialization
нужен отдельный application protocol.

## Закрытие SDK

`sdk.close()` можно вызывать повторно. Первый вызов:

- запрещает новые service getters и calls через ранее полученные clients;
- отменяет операции, которые еще ждут локальную unary-квоту;
- закрывает shared channel.

Он не ожидает завершения уже переданных transport-у операций. Для
детерминированного shutdown Consumer должен отменить их собственный
`AbortSignal`, дождаться settlement и только затем закрыть SDK. Для stream
lifecycle используйте руководство
[Streams и отмена](./streams-and-cancellation.md).

## Retry boundary

SDK намеренно не объявляет ошибку retryable только по gRPC status. Перед
повтором нужно одновременно определить:

- является ли операция idempotent;
- мог ли provider уже применить side effect;
- присутствует ли retry/rate-limit metadata;
- какой backoff и общий deadline допустимы для приложения.

Особенно это относится к `ResourceExhausted`, `Unavailable`,
`DeadlineExceeded` и mutation RPC. Универсальный retry interceptor на уровне
SDK скрыл бы эти различия.
