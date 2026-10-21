# Node.js SDK for T-Invest API

[![npm version](https://img.shields.io/npm/v/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![node](https://img.shields.io/node/v/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![types](https://img.shields.io/npm/types/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![license](https://img.shields.io/npm/l/%40woodger%2Ft-invest-node-sdk.svg)](LICENSE)

Минималистичный SDK на [TypeScript](https://www.typescriptlang.org/) для доступа к T-Invest API.

Официальные ресурсы T-Invest:

- [Документация T-Invest API](https://developer.tbank.ru/invest/intro/intro/) — начало работы, получение токена и адреса подключения;
- [Лимиты API](https://developer.tbank.ru/invest/intro/intro/limits) — квоты unary-запросов и ограничения потоков;
- [Proto-контракты](https://github.com/Invest-SDK/invest-contracts) — исходные контракты gRPC API.

## Установить модуль

Чтобы использовать `@woodger/t-invest-node-sdk` в своём проекте, выполните:

```sh
npm install @woodger/t-invest-node-sdk
```

## Попробовать

Замените `YOUR_TOKEN` своим токеном доступа.

`main.ts`

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

## Выбрать следующий сценарий

- [Получить список счетов и закрыть SDK](docs/examples/getting-started.md) — выбрать счёт для следующего запроса.
- [Выполнить связанные одиночные gRPC-запросы](docs/examples/unary-calls.md) — получить портфель, свечи или активные сигналы.
- [Читать и завершать поток](docs/examples/streams-and-cancellation.md) — подписаться на события и отменить чтение через `AbortSignal`.
- [Восстановить поток закрытых свечей](docs/examples/market-data-recovery.md) — повторно подключиться и догрузить историю после разрыва.
- [Обработать ошибки и закрыть SDK](docs/examples/errors-and-lifecycle.md) — различить причины ошибки и принять решение о повторе.
- [Ограничить частоту одиночных gRPC-запросов](docs/examples/unary-limits.md) — подключить готовый ограничитель или изменить квоты экземпляра.
- [Проверить приложение с тестовым gRPC-сервером](docs/examples/testing-with-service-definitions.md) — выполнить интеграционный тест без брокера.
- [Выполнить команду CLI](docs/cli-reference.md) — передать аргументы, получить вывод и код завершения.

Другие примеры работы с SDK см. [раздел с примерами](docs/examples/index.md). Настройки TLS и квот, а также материалы для разработки [документация API](docs/index.md).

## Лицензия

Проект является независимой реализацией и не имеет никакого отношения к T-Invest, T-Банку или их аффилированным лицам. Названия продуктов и компаний используются только для обозначения совместимости с публичным API.

Собственный код SDK распространяется по [MIT](LICENSE). Для сторонних компонентов смотри полный текст [Apache License 2.0](LICENSE-APACHE-2.0).