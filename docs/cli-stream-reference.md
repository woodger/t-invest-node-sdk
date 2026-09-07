# Справочник потокового CLI

> Type: Reference. Документ фиксирует текущий CLI-контракт `stream run` для
> server-side streams, статических bidirectional market data requests и
> отдельно отмечает будущие расширения.

## Статус

CLI-команды реализованы в canonical форме:

```text
t-invest-node-sdk <domain> <command> [options]
```

Stream API требует отдельного контракта: команда не возвращает один response и
не завершается сразу. Она открывает долгоживущий stream, печатает события и
завершается по лимиту, таймауту, сигналу или ошибке provider-а.

Текущая точка входа:

```bash
t-invest-node-sdk stream run --config=PATH [runtime options]
```

`stream run` является domain-level entrypoint для stream-сценариев:
конкретный generated stream method выбирается внутри config-файла. Это нужно,
чтобы не угадывать десятки specialized flags для разных stream-сценариев.

Текущая реализация поддерживает:

- `marketdata.marketDataStream` со статическими initial requests из config;
- `marketdata.marketDataServerSideStream`;
- `operations.portfolioStream`;
- `operations.positionsStream`;
- `orders.tradesStream`.

Динамические bidirectional request sources не реализованы: команда не читает
дополнительные request-ы из stdin, файлов, таймеров или interactive input.

## Доступные stream methods

| Значение `stream` в config | SDK method | gRPC method | Тип stream |
| --- | --- | --- | --- |
| `marketdata.marketDataStream` | `sdk.marketdataStream.marketDataStream` | `MarketDataStreamService/MarketDataStream` | bidirectional, статические начальные запросы |
| `marketdata.marketDataServerSideStream` | `sdk.marketdataStream.marketDataServerSideStream` | `MarketDataStreamService/MarketDataServerSideStream` | server-side |
| `operations.portfolioStream` | `sdk.operationsStream.portfolioStream` | `OperationsStreamService/PortfolioStream` | server-side |
| `operations.positionsStream` | `sdk.operationsStream.positionsStream` | `OperationsStreamService/PositionsStream` | server-side |
| `orders.tradesStream` | `sdk.ordersStream.tradesStream` | `OrdersStreamService/TradesStream` | server-side |

## Runtime-модель

`stream run` выполняет один stream session:

1. прочитать и провалидировать config;
2. применить CLI runtime overrides;
3. создать `TInvestNodeSDK`;
4. создать initial request для server-side stream или конечный initial request
   iterator для `marketdata.marketDataStream`;
5. открыть stream;
6. писать события в `stdout`;
7. писать diagnostics/errors/status в `stderr`;
8. завершиться по `maxEvents`, `durationMs`, `idleTimeoutMs`, закрытию stream
   или provider error;
9. закрыть SDK channel в `finally`.

При срабатывании `durationMs` или `idleTimeoutMs` команда сначала отменяет
pending transport read через session `AbortSignal`, затем завершает iterator и
закрывает SDK. Runtime timeout остается штатным завершением, а provider error,
полученная раньше timeout, не маскируется.

## Контракт вывода

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

## Типы событий

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

## Настройки runtime

Config задает runtime defaults. CLI flags могут переопределять только runtime,
не subscription contract:

```bash
t-invest-node-sdk stream run \
  --config=marketdata.json \
  --max-events=100 \
  --duration-ms=60000 \
  --include-pings
```

Настройки runtime:

- `--config=PATH` — обязательный путь к JSON config;
- `--max-events=N` — завершиться после N выведенных событий;
- `--duration-ms=N` — завершиться через N миллисекунд;
- `--idle-timeout-ms=N` — завершиться, если события отсутствуют N миллисекунд;
- `--include-pings` — печатать события `ping` в `stdout`;
- `--raw` — печатать generated response без нормализованного envelope;
- `--format=jsonl` — формат вывода; поддерживается только `jsonl`.

Логические runtime-флаги поддерживают синтаксис `--flag` / `--no-flag`.
Используйте `--no-include-pings` или `--no-raw`, чтобы переопределить значение
`true` из config; формы `--flag=true` и `--flag=false` не поддерживаются.

## Коды завершения

- `0` - stream завершился по лимиту, таймауту или нормальному закрытию;
- `2` - содержимое config не прошло синтаксическую или семантическую проверку;
- `1` - ошибка чтения config-файла, provider error или runtime error;
- `130` - процесс остановлен через `SIGINT`;
- `143` - процесс остановлен через `SIGTERM`.

При любом завершении SDK должен закрываться в `finally`.

## Обратное давление

`stream run` отдает output как последовательность chunks, чтобы не собирать
бесконечный stream в одну строку. Запись в `stdout` и `stderr` учитывает
writable backpressure: если stream buffer заполнен, CLI ждет событие `drain`
или ошибку записи.

## Что не входит в текущую реализацию

- table/csv output для stream events;
- automatic reconnect;
- durable checkpoints;
- интерактивная смена подписок после старта;
- stdin/file/timer request sources для bidirectional stream;
- агрегация событий в application report;
- file output вместо stdout.

Эти возможности можно добавить позднее отдельными изменениями контракта.

## Связанная документация

- [Справочник конфигурации потокового CLI](./cli-stream-configuration.md)
- [API-команды](./clean-architecture/api-commands.md)
