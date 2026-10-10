# Справочник конфигурации потокового CLI

> Type: Reference. Здесь описан JSON-файл конфигурации для команды `t-invest-node-sdk stream run --config=PATH`.

## Цель

Конфигурация выбирает поток, подписки и параметры вывода. Для типовых подписок CLI сам собирает запросы по сгенерированным gRPC-контрактам.

Минимальная допустимая конфигурация:

```json
{
  "stream": "marketdata.marketDataServerSideStream",
  "subscriptions": {
    "trades": [
      {
        "instrumentId": "BBG00QPYJ5H0"
      }
    ]
  },
  "runtime": {
    "format": "jsonl"
  }
}
```

## Поля верхнего уровня

| Поле | Тип | Обязательность | Назначение |
| --- | --- | --- | --- |
| `stream` | string | всегда | Выбирает метод потокового API |
| `subscriptions` | object | для серверного потока рыночных данных | Подписки на рыночные данные |
| `requests` | object[] | для двустороннего потока рыночных данных | Статический набор начальных запросов |
| `accounts` | string[] | для потоков по счетам | Идентификаторы счетов в потоках операций и заявок |
| `runtime` | object | нет | Настройки вывода и завершения процесса |

Допустимые значения `stream`:

- `marketdata.marketDataStream`;
- `marketdata.marketDataServerSideStream`;
- `operations.portfolioStream`;
- `operations.positionsStream`;
- `orders.tradesStream`.

`marketdata.marketDataStream` использует отдельное поле `requests`, потому что это двусторонний поток: CLI сначала отправляет заданный в конфигурации набор запросов, а затем читает события провайдера.

Поле `rawRequests` не поддерживается: проверка конфигурации отклоняет его для любого потока.

## Настройки runtime

```json
{
  "runtime": {
    "format": "jsonl",
    "maxEvents": 100,
    "durationMs": 60000,
    "idleTimeoutMs": 15000,
    "includePings": false,
    "includeSubscriptionEvents": true,
    "raw": false
  }
}
```

Поля:

- `format` — формат вывода; поддерживается только `jsonl`;
- `maxEvents` — завершиться после N выведенных событий;
- `durationMs` — завершиться через N миллисекунд после запуска потока;
- `idleTimeoutMs` — завершиться после N миллисекунд без событий;
- `includePings` — включать события `ping` в `stdout`;
- `includeSubscriptionEvents` — включать статусы подписок в `stdout`;
- `raw` — выводить сгенерированный ответ без общей структуры нормализованного события.

## Подписки на рыночные данные

Поле `subscriptions` группирует подписки по семействам событий:

```json
{
  "stream": "marketdata.marketDataServerSideStream",
  "subscriptions": {
    "candles": [
      {
        "instrumentId": "BBG00QPYJ5H0",
        "interval": "1min",
        "waitingClose": false
      }
    ],
    "orderBooks": [
      {
        "instrumentId": "BBG00QPYJ5H0",
        "depth": 10
      }
    ],
    "trades": [
      {
        "instrumentId": "BBG00QPYJ5H0"
      }
    ],
    "info": [
      {
        "instrumentId": "BBG00QPYJ5H0"
      }
    ],
    "lastPrices": [
      {
        "instrumentId": "BBG00QPYJ5H0"
      }
    ]
  },
  "runtime": {
    "format": "jsonl",
    "maxEvents": 100,
    "includePings": false
  }
}
```

Значения подписок по умолчанию:

- CLI всегда подписывается через `SUBSCRIPTION_ACTION_SUBSCRIBE`; поле `action` в конфигурации не принимается;
- устаревшие поля `figi` сгенерированных контрактов сохраняют значения по умолчанию protobuf и не сериализуются;
- `instrumentId` обязателен для каждого инструмента;
- `waitingClose` имеет значение `false`;
- `orderBooks[].depth` обязателен и должен быть целым числом от `1` до `2147483647` (диапазон protobuf `int32`).

Значения `waitingClose` должны совпадать у всех свечных подписок одного запроса. Для серверного потока это весь массив `subscriptions.candles`; для двустороннего — `instruments` внутри одного запроса `subscribeCandles`. Отсутствующее поле считается `false`.

Поддерживаемые алиасы интервала свечей:

- `1min`;
- `5min`.

Другие псевдонимы из CLI-команды получения исторических свечей здесь не принимаются: сгенерированный `SubscriptionInterval` для потока содержит только интервалы в одну и пять минут.

## Сравнение MarketDataStream и MarketDataServerSideStream

`marketdata.marketDataServerSideStream` отправляет один начальный запрос, собранный из поля `subscriptions`, а затем читает события.

`marketdata.marketDataStream` — двусторонний поток. `stream run` поддерживает только статический набор типизированных начальных запросов из конфигурации и не читает дополнительные запросы из `stdin`, файлов, таймеров или интерактивного ввода.

Типизированная форма двустороннего потока:

```json
{
  "stream": "marketdata.marketDataStream",
  "requests": [
    {
      "type": "subscribeTrades",
      "instruments": [
        {
          "instrumentId": "BBG00QPYJ5H0"
        }
      ]
    },
    {
      "type": "getMySubscriptions"
    }
  ],
  "runtime": {
    "format": "jsonl",
    "maxEvents": 50
  }
}
```

Поддерживаемые значения `type` запроса:

- `subscribeCandles`;
- `subscribeOrderBook`;
- `subscribeTrades`;
- `subscribeInfo`;
- `subscribeLastPrice`;
- `getMySubscriptions`.

Элементы запроса используют те же поля инструмента, что и подписки серверного потока рыночных данных:

- `subscribeCandles` требует `instrumentId` и `interval`; `waitingClose` необязателен;
- `subscribeOrderBook` требует `instrumentId` и `depth`;
- `subscribeTrades`, `subscribeInfo` и `subscribeLastPrice` требуют `instrumentId`;
- `getMySubscriptions` не принимает `instruments`.

Отправка произвольных запросов двустороннего потока не поддерживается. Используйте поле `requests` и перечисленные выше типизированные варианты.

## Потоки по счетам

Поток портфеля:

```json
{
  "stream": "operations.portfolioStream",
  "accounts": ["2000000000"],
  "runtime": {
    "format": "jsonl",
    "maxEvents": 50
  }
}
```

Поток позиций:

```json
{
  "stream": "operations.positionsStream",
  "accounts": ["2000000000"],
  "runtime": {
    "format": "jsonl",
    "maxEvents": 50
  }
}
```

Поток сделок по поручениям:

```json
{
  "stream": "orders.tradesStream",
  "accounts": ["2000000000"],
  "runtime": {
    "format": "jsonl",
    "includePings": false
  }
}
```

Правила:

- `accounts` должен содержать хотя бы один идентификатор счёта;
- идентификаторы передаются в поле `accounts` сгенерированного запроса;
- потоки по счетам не используют `subscriptions`;
- неизвестные поля отклоняются до создания SDK.

## Правила проверки

Проверка конфигурации отклоняет:

- неизвестные значения `stream`;
- отсутствие `accounts` для потоков по счетам;
- пустой `subscriptions` для серверного потока рыночных данных;
- отсутствующий или пустой `requests` для `marketdata.marketDataStream`;
- неизвестные поля верхнего уровня;
- неподдерживаемое поле `rawRequests`;
- неподдерживаемый `runtime.format`;
- неположительные числовые ограничения в `runtime`;
- элементы Market Data без `instrumentId`;
- имена сгенерированных перечислений и псевдонимы, которые не поддерживает преобразователь конфигурации.

CLI проверяет конфигурацию до создания `TInvestNodeSDK`.

## Переопределения через CLI

Настройки из `runtime` можно переопределить CLI-флагами:

```bash
t-invest-node-sdk stream run \
  --config=portfolio-stream.json \
  --max-events=10 \
  --include-pings
```

Логические флаги настроек `runtime` используют синтаксис `--flag` / `--no-flag`. Например, `--no-include-pings` или `--no-raw` отключает значение `true` из конфигурации; формы `--flag=true` и `--flag=false` не поддерживаются.

Подписки и выбор счетов задаются только в конфигурации. Это позволяет использовать одну команду для разных потоков без отдельного набора флагов для каждого метода.

## Режимы вывода

Нормализованное событие по умолчанию:

```json
{"stream":"orders.tradesStream","sequence":1,"receivedAt":"2026-06-29T12:00:00.000Z","type":"orderTrades","payload":{"orderId":"..."}}
```

Raw-событие при `runtime.raw: true`:

```json
{"orderTrades":{"orderId":"..."}}
```

По умолчанию CLI выводит нормализованные события в единой структуре для всех потоковых методов.

## Связанная документация

- [Справочник потокового CLI](./cli-stream-reference.md)
- [Справочник CLI](./cli-reference.md)
