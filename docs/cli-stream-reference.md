# Справочник потокового CLI

> Type: Reference. Здесь описана команда `stream run`: поддерживаемые потоки, формат событий и условия завершения работы. Она поддерживает серверные потоки и статический набор начальных запросов двустороннего потока рыночных данных.

## Статус

CLI использует основную форму команд:

```text
t-invest-node-sdk <domain> <command> [options]
```

Команда потокового API открывает долгоживущий поток, печатает события и завершает работу по лимиту, таймауту, сигналу или ошибке провайдера.

Текущая точка входа:

```bash
t-invest-node-sdk stream run --config=PATH [runtime options]
```

`stream run` служит общей точкой входа для потоковых сценариев. Конкретный метод выбирается в файле конфигурации, поэтому для разных потоков не нужны отдельные наборы флагов.

Текущая реализация поддерживает:

- `marketdata.marketDataStream` со статическими начальными запросами из конфигурации;
- `marketdata.marketDataServerSideStream`;
- `operations.portfolioStream`;
- `operations.positionsStream`;
- `orders.tradesStream`.

Команда не поддерживает динамические источники запросов двустороннего потока и не читает дополнительные запросы из stdin, файлов, таймеров или интерактивного ввода.

## Доступные stream methods

| Значение `stream` в конфигурации | Метод SDK | Метод gRPC | Тип потока |
| --- | --- | --- | --- |
| `marketdata.marketDataStream` | `sdk.marketdataStream.marketDataStream` | `MarketDataStreamService/MarketDataStream` | двусторонний, статические начальные запросы |
| `marketdata.marketDataServerSideStream` | `sdk.marketdataStream.marketDataServerSideStream` | `MarketDataStreamService/MarketDataServerSideStream` | серверный |
| `operations.portfolioStream` | `sdk.operationsStream.portfolioStream` | `OperationsStreamService/PortfolioStream` | серверный |
| `operations.positionsStream` | `sdk.operationsStream.positionsStream` | `OperationsStreamService/PositionsStream` | серверный |
| `orders.tradesStream` | `sdk.ordersStream.tradesStream` | `OrdersStreamService/TradesStream` | серверный |

## Runtime-модель

`stream run` открывает одну потоковую сессию:

1. прочитать и проверить конфигурацию;
2. применить переопределения настроек `runtime` из CLI;
3. создать `TInvestNodeSDK`;
4. создать начальный запрос серверного потока или конечный итератор начальных запросов для `marketdata.marketDataStream`;
5. открыть поток;
6. писать события в `stdout`;
7. писать диагностику, ошибки и сообщения о состоянии в `stderr`;
8. завершиться по `maxEvents`, `durationMs`, `idleTimeoutMs`, закрытию потока или ошибке провайдера;
9. закрыть канал SDK в `finally`.

Когда срабатывает `durationMs` или `idleTimeoutMs`, команда сначала отменяет текущее чтение через `AbortSignal` сессии, затем завершает итератор и закрывает SDK. Таймаут считается штатным завершением, а возникшая до него ошибка провайдера не маскируется.

При достижении `maxEvents` текущее чтение уже завершено: команда сначала завершает итератор, затем отменяет сигнал сессии и закрывает SDK. Это сохраняет штатное завершение без ошибки локальной отмены.

## Контракт вывода

Базовый формат вывода потока — `jsonl`. Каждое событие печатается отдельной строкой JSON:

```json
{"stream":"marketdata.marketDataServerSideStream","sequence":1,"receivedAt":"2026-06-29T12:00:00.000Z","type":"candle","payload":{"instrumentUid":"..."}}
```

Обязательные поля структуры события:

- `stream` - имя потока из конфигурации;
- `sequence` - порядковый номер события в текущем процессе;
- `receivedAt` - время получения события CLI-процессом в ISO-формате;
- `type` - нормализованный тип события;
- `payload` - данные события.

CLI пишет в `stdout` только события. Ошибки чтения конфигурации, транспорта, провайдера и вывода направляются в `stderr`. Статусы подписок, включая отклонённые подписки, выводятся как события в `stdout`; при `runtime.includeSubscriptionEvents: false` эти события не выводятся.

## Типы событий

События `marketdata.*`:

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

События `operations.portfolioStream`:

- `subscriptions`;
- `portfolio`;
- `ping`.

События `operations.positionsStream`:

- `subscriptions`;
- `position`;
- `ping`.

События `orders.tradesStream`:

- `subscription`;
- `orderTrades`;
- `ping`.

По умолчанию `ping` события не печатаются в `stdout`, если `runtime.includePings` не равен `true`.

## Настройки runtime

Файл конфигурации задаёт настройки вывода и завершения работы по умолчанию в поле `runtime`. CLI-флаги могут переопределить эти настройки; подписки задаются только в файле:

```bash
t-invest-node-sdk stream run \
  --config=marketdata.json \
  --max-events=100 \
  --duration-ms=60000 \
  --include-pings
```

Настройки запуска:

- `--config=PATH` — обязательный путь к JSON-файлу конфигурации;
- `--max-events=N` — завершиться после N выведенных событий;
- `--duration-ms=N` — завершиться через N миллисекунд;
- `--idle-timeout-ms=N` — завершиться, если события отсутствуют N миллисекунд;
- `--include-pings` — печатать события `ping` в `stdout`;
- `--raw` — печатать сгенерированный ответ без общей структуры нормализованного события;
- `--format=jsonl` — формат вывода; поддерживается только `jsonl`.

Логические флаги настроек `runtime` поддерживают синтаксис `--flag` / `--no-flag`. Используйте `--no-include-pings` или `--no-raw`, чтобы переопределить значение `true` из конфигурации; формы `--flag=true` и `--flag=false` не поддерживаются.

Числовые значения в `runtime` должны быть положительными безопасными целыми числами JavaScript. CLI измеряет время сессии и простоя по монотонным часам, а ожидания длиннее диапазона одного таймера Node.js разбивает на несколько последовательных таймеров.

## Коды завершения

- `0` - поток завершился по лимиту, таймауту или нормальному закрытию;
- `2` - содержимое конфигурации не прошло синтаксическую или семантическую проверку;
- `1` - ошибка чтения файла конфигурации, провайдера или выполнения;
- `130` - процесс остановлен через `SIGINT`;
- `143` - процесс остановлен через `SIGTERM`.

При штатном завершении, таймауте или обработанной ошибке команда закрывает SDK в `finally`. При `SIGINT` и `SIGTERM` встроенный CLI завершается по стандартным правилам Node.js, поэтому корректная отмена и выполнение `finally` не гарантируются.

## Обратное давление

`stream run` отдаёт результат последовательностью фрагментов и не собирает бесконечный поток в одну строку. При записи в `stdout` и `stderr` CLI учитывает обратное давление: если буфер потока заполнен, он ждёт событие `drain` или ошибку записи.

## Что не входит в текущую реализацию

- вывод событий потока в таблицы или CSV;
- автоматическое переподключение;
- сохранение позиции чтения в постоянном хранилище;
- интерактивная смена подписок после старта;
- источники запросов двустороннего потока из stdin, файлов или таймеров;
- агрегация событий в отчёт приложения;
- запись в файл вместо stdout.

Эти возможности можно добавить позднее отдельными изменениями контракта.

## Связанная документация

- [Справочник конфигурации потокового CLI](./cli-stream-configuration.md)
- [Справочник CLI](./cli-reference.md)
