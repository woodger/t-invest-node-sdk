# Node.js SDK for T-Invest API

[![npm version](https://img.shields.io/npm/v/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![node](https://img.shields.io/node/v/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![types](https://img.shields.io/npm/types/%40woodger%2Ft-invest-node-sdk.svg)](https://www.npmjs.com/package/@woodger/t-invest-node-sdk) [![license](https://img.shields.io/npm/l/%40woodger%2Ft-invest-node-sdk.svg)](LICENSE)

Минималистичный TypeScript/Node.js SDK для работы с gRPC API T-Invest через `nice-grpc`.

Официальные ресурсы T-Invest:

- [Документация T-Invest API](https://developer.tbank.ru/invest/intro/intro/) — начало работы, получение токена и адреса подключения;
- [Лимиты API](https://developer.tbank.ru/invest/intro/intro/limits) — квоты unary-запросов и ограничения потоков;
- [Proto-контракты](https://opensource.tbank.ru/invest/invest-contracts) — исходные контракты gRPC API.

<a id="установка"></a>
## Установить модуль

Модуль `@woodger/t-invest-node-sdk` требует Node.js `>=20.19.0`. Установите его из npm:

```sh
npm install @woodger/t-invest-node-sdk
```

Архив npm содержит готовый JavaScript и объявления типов из `dist`. Установка по ссылке на Git-репозиторий не поддерживается.

<a id="быстрый-старт"></a>
## Выполнить первый запрос

Замените `YOUR_TOKEN` своим токеном доступа.

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

Более подробный пример с выбором доступного счёта и освобождением ресурсов: [Получить список счетов и закрыть SDK](docs/examples/getting-started.md).

<a id="подробные-примеры"></a>
<a id="документация"></a>
## Выбрать следующий сценарий

- [Получить список счетов и закрыть SDK](docs/examples/getting-started.md) — выбрать счёт для следующего запроса.
- [Выполнить связанные одиночные gRPC-запросы](docs/examples/unary-calls.md) — получить портфель, свечи или активные сигналы.
- [Читать и завершать поток](docs/examples/streams-and-cancellation.md) — подписаться на события и отменить чтение через `AbortSignal`.
- [Восстановить поток закрытых свечей](docs/examples/market-data-recovery.md) — повторно подключиться и догрузить историю после разрыва.
- [Обработать ошибки и закрыть SDK](docs/examples/errors-and-lifecycle.md) — различить причины ошибки и принять решение о повторе.
- [Ограничить частоту одиночных gRPC-запросов](docs/examples/unary-limits.md) — подключить готовый ограничитель или изменить квоты экземпляра.
- [Проверить приложение с тестовым gRPC-сервером](docs/examples/testing-with-service-definitions.md) — выполнить интеграционный тест без брокера.
- [Выполнить команду CLI](docs/cli-reference.md) — передать аргументы, получить вывод и код завершения.

Полный список сценариев находится в [индексе examples](docs/examples/index.md). Настройки TLS, квоты и документацию для разработки можно выбрать в [индексе документации](docs/index.md).

<a id="опции-tinvestnodesdk"></a>
<a id="опции-defaultconfig"></a>
<a id="политика-grpc-транспорта"></a>
<a id="cli"></a>
<a id="доступные-сервисы"></a>
<a id="lifecycle-и-отмена"></a>
<a id="ошибки-sdk"></a>
<a id="экспорты"></a>
## Разделить задачи SDK и приложения

SDK создаёт типизированные gRPC-клиенты, выполняет вызовы и закрывает общий канал. Приложение выбирает API-вызовы, формирует запросы, передаёт настройки подключения, владеет предметными правилами и освобождает собственные ресурсы. Точные экспортируемые типы и сервисы перечислены в [`src/index.ts`](src/index.ts); правила встроенного CLI и его границы с `icore` описаны в [документации CLI](docs/clean-architecture/cli-output-boundaries.md).

<a id="дисклеймер"></a>
## Проверить лицензию и статус проекта

Проект является независимой реализацией и не имеет никакого отношения к T-Invest, T-Банку или их аффилированным лицам. Названия продуктов и компаний используются только для обозначения совместимости с публичным API.

Собственный код SDK распространяется по [MIT License](LICENSE). Для сторонних компонентов сохранены полный текст [Apache License 2.0](LICENSE-APACHE-2.0) и [`NOTICE`](NOTICE) с границами лицензий и необходимыми уведомлениями.
