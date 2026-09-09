# Первый SDK-вызов

> Type: Guide. Здесь разобран минимальный полный lifecycle Consumer-приложения: установка, конфигурация, запрос и освобождение ресурсов.

## Установка

SDK требует Node.js `>=20.19.0`.

Установите пакет из npm:

```sh
npm install @woodger/t-invest-node-sdk
```

Архив npm уже содержит JavaScript и TypeScript declarations из `dist`, поэтому Consumer не собирает SDK из исходников. Проект не поддерживает установку по Git URL: в этом случае npm запускает `prepack` и собирает исходный код.

## Переменные окружения

Пример использует:

- `T_INVEST_TOKEN` — OAuth token;
- `T_INVEST_ENDPOINT` — gRPC endpoint в формате `host:port`.

Не записывайте token в исходный код, логи или committed `.env`. Проверяйте пустые значения до создания SDK, чтобы сразу отличить ошибку конфигурации от ошибки provider-а.

TLS включён по умолчанию. SDK подключает bundled Russian Trusted Root CA только к своему gRPC channel, поэтому не нужно устанавливать сертификат в систему или задавать `NODE_EXTRA_CA_CERTS`. О custom CA читайте в [TLS policy](../tls-policy.md).

## Законченный пример

```ts
import { TInvestNodeSDK } from '@woodger/t-invest-node-sdk';

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

  try {
    const { accounts } = await sdk.users.getAccounts({});
    const account = accounts[0];

    if (!account) {
      console.log('No accounts are available for this token');
      return;
    }

    console.log({
      id: account.id,
      name: account.name,
      status: account.status
    });
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

## Почему lifecycle выглядит именно так

- SDK создаёт service clients по первому обращению и подключает их к одному shared gRPC channel.
- `sdk.close()` идемпотентен, но после него нельзя получать новые clients или вызывать методы через ранее полученные clients.
- Сначала дождитесь unary-вызова, затем закройте SDK в `finally`.
- `getAccounts()` может не вернуть ни одного счёта. Не подставляйте пустой `accountId`: вызывайте следующий RPC только после явного выбора существующего счёта.

Для deadline, response metadata и нескольких связанных unary-вызовов используйте руководство [Unary-вызовы](./unary-calls.md). Для machine-readable обработки ошибок — [Ошибки и lifecycle](./errors-and-lifecycle.md).
