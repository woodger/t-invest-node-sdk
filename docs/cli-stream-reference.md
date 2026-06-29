# Stream CLI Reference

> Type: Reference Draft. Документ фиксирует целевой CLI-контракт для stream
> API перед реализацией. Описанные здесь stream-команды пока не являются
> текущим CLI-контрактом.

## Статус

Unary CLI-команды реализованы в форме:

```bash
tinkoff-invest-node-sdk <service> <method> [options]
```

Stream API требует отдельного контракта: команда не возвращает один response и
не завершается сразу. Она открывает долгоживущий stream, печатает события и
завершается по лимиту, таймауту, сигналу или ошибке provider-а.

Целевая точка входа:

```bash
tinkoff-invest-node-sdk stream run --config=PATH [runtime options]
```

`stream run` является осознанным исключением из формы `<service> <method>`:
конкретный generated stream method выбирается внутри config-файла. Это нужно,
чтобы не угадывать десятки specialized flags для разных stream-сценариев.

## Доступные Stream Methods

| Config `stream` | SDK method | gRPC method | Stream type |
| --- | --- | --- | --- |
| `marketdata.marketDataStream` | `sdk.marketdataStream.marketDataStream` | `MarketDataStreamService/MarketDataStream` | bidirectional |
| `marketdata.marketDataServerSideStream` | `sdk.marketdataStream.marketDataServerSideStream` | `MarketDataStreamService/MarketDataServerSideStream` | server-side |
| `operations.portfolioStream` | `sdk.operationsStream.portfolioStream` | `OperationsStreamService/PortfolioStream` | server-side |
| `operations.positionsStream` | `sdk.operationsStream.positionsStream` | `OperationsStreamService/PositionsStream` | server-side |
| `orders.tradesStream` | `sdk.ordersStream.tradesStream` | `OrdersStreamService/TradesStream` | server-side |

## Runtime Model

`stream run` должен выполнять один stream session:

1. прочитать и провалидировать config;
2. применить CLI runtime overrides;
3. создать `TinkoffInvestNodeSDK`;
4. открыть stream;
5. писать события в `stdout`;
6. писать diagnostics/errors/status в `stderr`;
7. завершиться по `maxEvents`, `durationMs`, `idleTimeoutMs`, `SIGINT`,
   `SIGTERM` или provider error;
8. закрыть SDK channel в `finally`.

## Output Contract

Базовый формат stream output - `jsonl`. Каждое событие печатается отдельной
строкой JSON:

```json
{"stream":"marketdata.marketDataServerSideStream","sequence":1,"receivedAt":"2026-06-29T12:00:00.000Z","type":"candle","payload":{"instrumentUid":"..."}}
```

Обязательные поля envelope:

- `stream` - имя stream из config;
- `sequence` - порядковый номер события в рамках процесса;
- `receivedAt` - время получения события CLI-процессом в ISO-формате;
- `type` - нормализованный тип события;
- `payload` - event payload.

`stdout` предназначен только для event output. Сообщения о старте, завершении,
ошибках provider-а, rejected subscriptions и retry-политике должны идти в
`stderr`.

## Event Types

`marketdata.*` events:

- `subscribeCandlesResponse`;
- `subscribeOrderBookResponse`;
- `subscribeTradesResponse`;
- `subscribeInfoResponse`;
- `subscribeLastPriceResponse`;
- `candle`;
- `trade`;
- `orderbook`;
- `tradingStatus`;
- `lastPrice`;
- `ping`.

`operations.portfolioStream` events:

- `subscriptions`;
- `portfolio`;
- `ping`.

`operations.positionsStream` events:

- `subscriptions`;
- `position`;
- `ping`.

`orders.tradesStream` events:

- `orderTrades`;
- `ping`.

По умолчанию `ping` события не печатаются в `stdout`, если
`runtime.includePings` не равен `true`.

## Runtime Options

Config задает runtime defaults. CLI flags могут переопределять только runtime,
не subscription contract:

```bash
tinkoff-invest-node-sdk stream run \
  --config=marketdata.json \
  --max-events=100 \
  --duration-ms=60000 \
  --include-pings
```

Целевые runtime options:

- `--config=PATH` - путь к JSON config, required;
- `--max-events=N` - завершиться после N output events;
- `--duration-ms=N` - завершиться после N milliseconds;
- `--idle-timeout-ms=N` - завершиться, если нет событий N milliseconds;
- `--include-pings` - печатать ping events в `stdout`;
- `--raw` - печатать generated response shape без normalized envelope;
- `--format=jsonl` - output format, initially only `jsonl`.

## Exit Behavior

- `0` - stream завершился по лимиту, таймауту или нормальному закрытию;
- `1` - config invalid, provider error или runtime error;
- `130` - процесс остановлен через `SIGINT`;
- `143` - процесс остановлен через `SIGTERM`.

При любом завершении SDK должен закрываться в `finally`.

## Backpressure

Печать в `stdout` должна уважать backpressure writable stream-а. CLI не должен
быстро буферизовать бесконечный stream в памяти, если consumer читает медленно.

## Не Цели Первой Реализации

- table/csv output для stream events;
- automatic reconnect;
- durable checkpoints;
- интерактивная смена подписок после старта;
- агрегация событий в application report;
- file output вместо stdout.

Эти возможности можно добавить позднее, когда базовый `stream run --config`
контракт станет стабильным.

## Связанная Документация

- [Stream CLI Configuration Reference](./cli-stream-configuration.md)
- [API Commands](./clean-architecture/api-commands.md)
