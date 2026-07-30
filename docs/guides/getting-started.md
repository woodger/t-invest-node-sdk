# Первый SDK-вызов

> Type: Guide. Руководство показывает минимальный законченный lifecycle
> Consumer-приложения: установка, конфигурация, запрос и освобождение ресурсов.

## Установка

Проект устанавливается из зафиксированного Git tag:

```sh
SDK_TAG=0.3.7
yarn add "git+ssh://git@github.com/woodger/tinkoff-invest-node-sdk.git#$SDK_TAG"
```

Для приватного репозитория среде сборки нужен настроенный SSH-доступ. Lifecycle
`prepare` собирает TypeScript после получения Git dependency.

## Переменные окружения

Пример использует:

- `TINKOFF_TOKEN` — OAuth token;
- `TINKOFF_ENDPOINT` — gRPC endpoint в формате `host:port`.

Не записывайте token в исходный код, логи или committed `.env`. Пустые значения
нужно отклонять до создания SDK, чтобы ошибка конфигурации не выглядела как
ошибка provider-а.

## Законченный пример

```ts
import { TinkoffInvestNodeSDK } from 'tinkoff-invest-node-sdk';

type RequiredEnvironmentVariable =
  | 'TINKOFF_TOKEN'
  | 'TINKOFF_ENDPOINT';

function requireEnvironment(name: RequiredEnvironmentVariable): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
}

async function main(): Promise<void> {
  const sdk = new TinkoffInvestNodeSDK({
    token: requireEnvironment('TINKOFF_TOKEN'),
    endpoint: requireEnvironment('TINKOFF_ENDPOINT')
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

- Service clients создаются лениво и используют один shared gRPC channel.
- `sdk.close()` идемпотентен, но после него нельзя получать новые clients или
  вызывать методы через ранее полученные clients.
- Unary-вызов сначала нужно дождаться, затем закрыть SDK в `finally`.
- Отсутствие счета — допустимый результат `getAccounts()`. Нельзя подменять его
  пустым `accountId`: следующий RPC должен выполняться только после явного
  выбора существующего счета.

Для deadline, response metadata и нескольких связанных unary-вызовов
используйте руководство [Unary-вызовы](./unary-calls.md). Для
machine-readable обработки ошибок — [Ошибки и lifecycle](./errors-and-lifecycle.md).
