# Stream CLI Configuration Reference

> Type: Reference. Документ описывает JSON config для команды
> `tinkoff-invest-node-sdk stream run --config=PATH`.

## Цель

Stream config должен быть достаточно близок к generated gRPC contracts, чтобы
не скрывать SDK/API смысл, но достаточно удобен, чтобы пользователь не писал
generated DTO вручную для типовых подписок.

Базовая форма:

```json
{
  "stream": "marketdata.marketDataServerSideStream",
  "subscriptions": {},
  "runtime": {
    "format": "jsonl"
  }
}
```

## Top-Level Fields

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `stream` | string | yes | Stream method selector |
| `subscriptions` | object | for server-side marketdata stream | Market data subscriptions |
| `requests` | object[] | for bidirectional marketdata stream | Static initial market data stream requests |
| `accounts` | string[] | for account streams | Account ids for operations/orders streams |
| `runtime` | object | no | Output and process lifecycle options |
| `rawRequests` | object[] | no | Reserved future generated-request-like mode |

Allowed `stream` values:

- `marketdata.marketDataStream`;
- `marketdata.marketDataServerSideStream`;
- `operations.portfolioStream`;
- `operations.positionsStream`;
- `orders.tradesStream`.

`marketdata.marketDataStream` использует отдельное поле `requests`, потому что
это bidirectional stream: CLI сначала отправляет заданный в config набор
request-ов, а затем читает события provider-а.

## Runtime

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

Fields:

- `format` - output format. Initial implementation supports only `jsonl`;
- `maxEvents` - stop after N output events;
- `durationMs` - stop after N milliseconds from stream start;
- `idleTimeoutMs` - stop after N milliseconds without events;
- `includePings` - include ping events in stdout;
- `includeSubscriptionEvents` - include subscription status events in stdout;
- `raw` - output generated response shape without normalized envelope.

## Market Data Subscriptions

Market data subscriptions are grouped by event family:

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

Subscription defaults:

- `action` defaults to `subscribe`;
- deprecated generated `figi` fields are sent as empty strings;
- `instrumentId` is required for every instrument item;
- `waitingClose` defaults to `false`;
- `orderBooks[].depth` is required and must be a positive integer.

Supported candle interval aliases:

- `1min`;
- `5min`.

Другие aliases из unary historical candles CLI не принимаются здесь, потому
что generated `SubscriptionInterval` для stream contract сейчас содержит
только one-minute и five-minutes интервалы.

## MarketDataStream vs MarketDataServerSideStream

`marketdata.marketDataServerSideStream` sends one initial request and then reads
events. Its request is derived from the `subscriptions` field.

`marketdata.marketDataStream` is bidirectional. Current `stream run`
implementation supports only static initial typed requests from config. It does
not read additional requests from stdin, files, timers or interactive input.

Typed bidirectional form:

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

Supported request `type` values:

- `subscribeCandles`;
- `subscribeOrderBook`;
- `subscribeTrades`;
- `subscribeInfo`;
- `subscribeLastPrice`;
- `getMySubscriptions`.

Subscription request items use the same instrument fields as server-side market
data subscriptions:

- `subscribeCandles` requires `instrumentId` and `interval`, optional
  `waitingClose`;
- `subscribeOrderBook` requires `instrumentId` and `depth`;
- `subscribeTrades`, `subscribeInfo` and `subscribeLastPrice` require
  `instrumentId`;
- `getMySubscriptions` does not accept `instruments`.

Advanced raw bidirectional form:

```json
{
  "stream": "marketdata.marketDataStream",
  "rawRequests": [
    {
      "subscribeTradesRequest": {
        "subscriptionAction": "SUBSCRIPTION_ACTION_SUBSCRIBE",
        "instruments": [
          {
            "figi": "",
            "instrumentId": "BBG00QPYJ5H0"
          }
        ]
      }
    }
  ],
  "runtime": {
    "format": "jsonl",
    "maxEvents": 50
  }
}
```

Raw bidirectional request mode is a future extension for users who need
generated contract fidelity before the typed config surface covers their case.

## Account Streams

Portfolio stream:

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

Positions stream:

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

Orders trades stream:

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

Rules:

- `accounts` must contain at least one account id;
- account ids are passed to generated request `accounts`;
- account streams do not use `subscriptions`;
- unknown account stream fields should be rejected before SDK creation.

## Validation Rules

The first implementation should reject:

- unknown `stream` values;
- missing `accounts` for account streams;
- empty `subscriptions` for marketdata server-side streams;
- missing or empty `requests` for `marketdata.marketDataStream`;
- unknown top-level fields, except explicitly supported future extension fields;
- unsupported `runtime.format`;
- non-positive numeric runtime limits;
- market data instrument items without `instrumentId`;
- generated enum names or aliases not supported by the config mapper.

Config validation must happen before `TinkoffInvestNodeSDK` creation.

## CLI Overrides

Runtime options may be overridden by CLI flags:

```bash
tinkoff-invest-node-sdk stream run \
  --config=portfolio-stream.json \
  --max-events=10 \
  --include-pings
```

Subscription and account selection should stay in config. This keeps command
line usage stable and avoids a large set of fragile stream-specific flags.

## Output Modes

Default normalized event:

```json
{"stream":"orders.tradesStream","sequence":1,"receivedAt":"2026-06-29T12:00:00.000Z","type":"orderTrades","payload":{"orderId":"..."}}
```

Raw event when `runtime.raw` is `true`:

```json
{"orderTrades":{"orderId":"..."}}
```

Normalized output is the default because it gives every stream method the same
observable event envelope.

## Related Documentation

- [Stream CLI Reference](./cli-stream-reference.md)
- [API Commands](./clean-architecture/api-commands.md)
