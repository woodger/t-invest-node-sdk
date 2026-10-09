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

В приложении конфигурацию можно передавать через переменные окружения:

- `T_INVEST_TOKEN` — OAuth token;
- `T_INVEST_ENDPOINT` — gRPC endpoint в формате `host:port`.

Не записывайте настоящий token в исходный код, логи или committed `.env`. Проверяйте пустые значения до создания SDK, чтобы сразу отличить ошибку конфигурации от ошибки provider-а.

TLS включён по умолчанию. SDK подключает bundled Russian Trusted Root CA только к своему gRPC channel, поэтому не нужно устанавливать сертификат в систему или задавать `NODE_EXTRA_CA_CERTS`. О custom CA читайте в [TLS policy](../tls-policy.md).

## Законченный пример

В примере параметры указаны явно: замените `YOUR_TOKEN` своим токеном доступа.

```ts
import { TInvestNodeSDK } from '@woodger/t-invest-node-sdk';

const sdk = new TInvestNodeSDK({
  token: 'YOUR_TOKEN',
  endpoint: 'invest-public-api.tbank.ru:443'
});

try {
  const { accounts } = await sdk.users.getAccounts({});
  const account = accounts[0];

  if (account) {
    console.log({
      id: account.id,
      name: account.name,
      status: account.status
    });
  }
  else {
    console.log('Нет доступных счетов');
  }
}
finally {
  sdk.close();
}
```

## Почему lifecycle выглядит именно так

- SDK создаёт service clients по первому обращению и подключает их к одному shared gRPC channel.
- `sdk.close()` идемпотентен, но после него нельзя получать новые clients или вызывать методы через ранее полученные clients.
- Сначала дождитесь unary-вызова, затем закройте SDK в `finally`.
- `getAccounts()` может не вернуть ни одного счёта. Не подставляйте пустой `accountId`: вызывайте следующий RPC только после явного выбора существующего счёта.

Для deadline, response metadata и нескольких связанных unary-вызовов используйте руководство [Unary-вызовы](./unary-calls.md). Для machine-readable обработки ошибок — [Ошибки и lifecycle](./errors-and-lifecycle.md).
