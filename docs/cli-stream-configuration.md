# Справочник конфигурации потокового CLI

> Type: Reference. Документ описывает JSON config для команды
> `t-invest-node-sdk stream run --config=PATH`.

## Цель

Stream config должен быть достаточно близок к generated gRPC contracts, чтобы
не скрывать SDK/API смысл, но достаточно удобен, чтобы пользователь не писал
generated DTO вручную для типовых подписок.

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
| `stream` | string | всегда | Выбирает stream method |
| `subscriptions` | object | для server-side Market Data stream | Подписки на рыночные данные |
| `requests` | object[] | для bidirectional Market Data stream | Статический набор начальных запросов |
| `accounts` | string[] | для потоков по счетам | Идентификаторы счетов Operations/Orders streams |
| `runtime` | object | нет | Настройки вывода и lifecycle процесса |

Допустимые значения `stream`:

- `marketdata.marketDataStream`;
- `marketdata.marketDataServerSideStream`;
- `operations.portfolioStream`;
- `operations.positionsStream`;
- `orders.tradesStream`.

`marketdata.marketDataStream` использует отдельное поле `requests`, потому что
это bidirectional stream: CLI сначала отправляет заданный в config набор
request-ов, а затем читает события provider-а.

Имя `rawRequests` зарезервировано для возможного будущего расширения, но не
входит в текущий публичный config contract и отклоняется parser-ом для любого
stream.

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
- `durationMs` — завершиться через N миллисекунд после запуска stream;
- `idleTimeoutMs` — завершиться после N миллисекунд без событий;
- `includePings` — включать события `ping` в `stdout`;
- `includeSubscriptionEvents` — включать статусы подписок в `stdout`;
- `raw` — выводить generated response без нормализованного envelope.

## Подписки на рыночные данные

Подписки на рыночные данные группируются по семействам событий:

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

- `action` имеет значение `subscribe`;
- устаревшие поля `figi` сгенерированных контрактов сохраняют значения по
  умолчанию protobuf и не сериализуются;
- `instrumentId` обязателен для каждого инструмента;
- `waitingClose` имеет значение `false`;
- `orderBooks[].depth` обязателен и должен быть положительным целым числом.

Поддерживаемые алиасы интервала свечей:

- `1min`;
- `5min`.

Другие aliases из unary historical candles CLI не принимаются здесь, потому
что generated `SubscriptionInterval` для stream contract сейчас содержит
только one-minute и five-minutes интервалы.

## Сравнение MarketDataStream и MarketDataServerSideStream

`marketdata.marketDataServerSideStream` отправляет один начальный запрос,
собранный из поля `subscriptions`, а затем читает события.

`marketdata.marketDataStream` является bidirectional stream. Текущая реализация
`stream run` поддерживает только статический набор типизированных начальных
запросов из config. Дополнительные запросы из `stdin`, файлов, таймеров или
interactive input не читаются.

Типизированная bidirectional-форма:

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

Элементы запроса используют те же поля инструмента, что и server-side подписки
на рыночные данные:

- `subscribeCandles` требует `instrumentId` и `interval`; `waitingClose`
  необязателен;
- `subscribeOrderBook` требует `instrumentId` и `depth`;
- `subscribeTrades`, `subscribeInfo` и `subscribeLastPrice` требуют
  `instrumentId`;
- `getMySubscriptions` не принимает `instruments`.

Режим raw bidirectional requests сейчас не поддерживается. Используйте поле
`requests` и перечисленные выше типизированные варианты.

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
- идентификаторы передаются в поле `accounts` generated request;
- потоки по счетам не используют `subscriptions`;
- неизвестные поля отклоняются до создания SDK.

## Правила проверки

Текущая реализация отклоняет:

- неизвестные значения `stream`;
- отсутствие `accounts` для потоков по счетам;
- пустой `subscriptions` для server-side Market Data stream;
- отсутствующий или пустой `requests` для `marketdata.marketDataStream`;
- неизвестные поля верхнего уровня;
- неподдерживаемое поле `rawRequests`;
- неподдерживаемый `runtime.format`;
- неположительные числовые runtime limits;
- элементы Market Data без `instrumentId`;
- generated enum names и aliases, которые не поддерживает config mapper.

Config проверяется до создания `TInvestNodeSDK`.

## Переопределения через CLI

Runtime options можно переопределить CLI-флагами:

```bash
t-invest-node-sdk stream run \
  --config=portfolio-stream.json \
  --max-events=10 \
  --include-pings
```

Логические runtime-флаги используют синтаксис `--flag` / `--no-flag`.
Например, `--no-include-pings` или `--no-raw` отключает значение `true` из
config; формы `--flag=true` и `--flag=false` не поддерживаются.

Подписки и выбор счетов остаются в config. Это сохраняет стабильную командную
строку и не создаёт большое количество хрупких stream-specific флагов.

## Режимы вывода

Нормализованное событие по умолчанию:

```json
{"stream":"orders.tradesStream","sequence":1,"receivedAt":"2026-06-29T12:00:00.000Z","type":"orderTrades","payload":{"orderId":"..."}}
```

Raw-событие при `runtime.raw: true`:

```json
{"orderTrades":{"orderId":"..."}}
```

Нормализованный вывод используется по умолчанию и задаёт единый наблюдаемый
event envelope для каждого stream method.

## Связанная документация

- [Справочник потокового CLI](./cli-stream-reference.md)
- [API-команды](./clean-architecture/api-commands.md)
