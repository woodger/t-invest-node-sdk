# Ошибки и lifecycle

> Type: Guide. Здесь показано, как разбирать `SdkError` по стабильным полям и не привязывать Consumer к transport error classes.

## Сужение типа по коду и источнику

Один `code` не всегда определяет причину ошибки. Например, `CANCELLED` может прийти от локального `AbortSignal` или от provider-а. Когда это влияет на решение Consumer-а, проверяйте сочетание `code` и `source`.

```ts
import {
  isSdkError,
  SdkErrorCode,
  TInvestNodeSDK
} from '@woodger/t-invest-node-sdk';

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
      isSdkError(error, SdkErrorCode.Unavailable)
      && error.source === 'tls'
    ) {
      console.error(
        'T-Invest TLS certificate verification failed. '
        + 'Check the endpoint and the SDK CA configuration.'
      );
      process.exitCode = 1;
      return;
    }

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
      && error.source === 'sdk'
    ) {
      console.error('Ответ превысил локальный лимит размера gRPC-сообщения', {
        path: error.path
      });

      throw error;
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
| `tls` | Transport не прошел проверку цепочки сертификатов или hostname |
| `abort` | Вызов отменен Consumer-ом через `AbortSignal` |
| `lifecycle` | SDK уже закрыт |
| `sdk` | SDK отклонил локальную конфигурацию, request или runtime state |

`SdkErrorCode.InvalidArgument` получает `source: 'grpc'` при provider validation и `source: 'sdk'` при локальной ошибке конфигурации. Поэтому определяйте источник не только по code.

Не каждая unknown runtime error — это `SdkError`. Сначала вызовите `isSdkError()`, а неизвестную ошибку сохраните или передайте дальше без принудительного приведения типа. Например, SDK не оборачивает в `SdkError` синхронное исключение application callback-а `onHeader` или `onTrailer`.

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
