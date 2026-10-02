# Разделение форматирования и вывода в CLI

> Type: Design Note. Здесь описаны project adapters, направление зависимостей и граница между command-specific CLI formatting, общей механикой JSON/CSV/table из `icore` и доставкой готового результата через `Output`.

## Контекст

CLI-команды живут в `bootstrap`, но не вся логика вокруг вывода имеет одну ответственность. Команда определяет смысл пользовательского представления; generic primitives сериализуют уже выбранные значения; terminal output доставляет готовую строку или stream.

`icore` предоставляет общую механику как внешняя зависимость. Это не слой проекта: application reports и output contract конкретной команды остаются в SDK.

Актуальная карта слоёв находится в [архитектуре SDK](../architecture.md#карта-слоев). Адаптеры переводят внутренние contracts во внешний интерфейс и обратно; command-specific CLI adapters находятся рядом с командами в `bootstrap`.

## Адаптеры проекта

`infrastructure/transport/grpc` - технический adapter к `nice-grpc`:

- channel;
- metadata;
- middleware;
- typed clients;
- mapping gRPC method path в transport-neutral `TInvestUnaryQuota`;
- mapping `nice-grpc` client failures в transport-neutral `SdkError`.

`unary-limit-resolver.ts` выбирает method rule или service fallback и разрешает quota bucket. Middleware передаёт Consumer-owned limiter-у полный `path`, `bucket`, `maxRequests`, `windowMs` и `AbortSignal`. Application port не разбирает gRPC path и не владеет transport lifecycle.

`infrastructure/interceptor` содержит технический process hook для известных warnings. Обычный вывод команд проходит через terminal app.

`infrastructure/report-values.ts` - принадлежащий проекту адаптер скалярных значений:

- преобразует повторяющиеся provider scalar DTO values в reusable report values;
- сохраняет `MoneyValue` в JSON как структурный `ReportMoney`;
- предоставляет text helper для table cells вида `"amount currency"`;
- не знает command names, report shapes, columns, generic renderers или output delivery.

## Основная граница

Нужно разделять три операции:

```text
application report/command-local event -> command-specific output values
```

За это отвечает `bootstrap/commands/*/reporter.ts`.

```text
output values -> JSON / CSV document or row / table string
```

Для общей механики reporter использует публичные render primitives `icore`. Структура документа, headers и порядок rows остаются command-specific policy. Generic primitives добавляют trailing newline в JSON, CSV document и text table.

```text
string/AsyncIterable -> TerminalApp -> Output.write -> stdout
```

В штатном CLI flow готовый результат выводят `TerminalApp` и `Output` из `icore`, собранные в `bootstrap/cli/runner.ts`.

```text
warnings/errors -> Output.error -> stderr
```

Текст warnings определяет project CLI layer; текст errors и exit code - политика ошибок проекта.

## Поток команды

```text
src/bootstrap/index.ts
        ↓
bootstrap/cli/runner.ts
        ↓
icore command resolution + typed options
        ↓
bootstrap/commands/<command>/cli.ts
        ↓
SDK call
        ↓
bootstrap/commands/<command>/reporter.ts
        ↓
application report или command-local event contract
        ↓
command-specific output values
        ↓
icore render primitive или project-specific formatter
        ↓
string/AsyncIterable
        ↓
icore TerminalApp -> Output.write
        ↓
stdout
```

Runner создаёт default `Output` или принимает injected `Output`, собирает lightweight terminal app для shortcuts и external errors и лениво загружает command registry.

Runner отдельно управляет публичными short aliases, help/version shortcuts и command warnings. Он направляет help/version через lightweight terminal app, warnings — через command terminal app, а normal command result передаёт в `runPrepared`. Оба экземпляра используют один `Output` и одну error policy.

Штатный terminal flow идёт через `Output` из `icore`. Только крайний аварийный fallback в executable entrypoint пишет через `console.error`.

## Что остаётся в reporter команды

`bootstrap/commands/<command>/reporter.ts` отвечает за смысл пользовательского вывода:

- mapping unary response в `application/reports` или stream event в локальный контракт события команды;
- выбор полей;
- порядок и имена колонок;
- представление enum/date/nullable values;
- stable JSON contract конкретной команды;
- CSV headers и порядок rows;
- redaction или normalization, если они зависят от команды;
- project-specific formats, например JSONL event shape.

Reporter может импортировать `renderJson`, `renderCsv`, `renderCsvRow` и `renderTextTable` из `icore`, но generic primitive не должен определять поля или contract команды.

## Что предоставляют render primitives `icore`

Generic primitives отвечают только за механику текстового формата:

- JSON serialization и trailing newline;
- CSV escaping, joining строк и terminal trailing newline для документа;
- расчет ширины, выравнивание и trailing newline plain-text таблицы.

Они не должны получать ответственность за:

- названия CLI-команд;
- `AccountsReport`, `CandlesReport` или другие project reports;
- generated provider DTO;
- SDK clients;
- выбор пользовательских полей;
- command-specific redaction или normalization;
- сборку CSV-документа конкретной команды.

Если общей primitive недостаточно, оставьте project-specific formatter рядом с reporter-ом. Не создавайте forwarding wrapper, который только повторяет public API `icore`.

## Что предоставляют `TerminalApp` и `Output`

`bootstrap/cli/runner.ts` создаёт default output через `createOutput` или принимает injected `Output`. Lightweight terminal app обслуживает shortcuts и external errors без загрузки command definitions; command terminal app создаётся после lazy import registry. Оба получают один `Output`.

Output boundary отвечает за:

- запись готового normal result через `Output.write` в stdout;
- запись warnings/errors через `Output.error` в stderr;
- ожидание asynchronous writes и backpressure;
- единый terminal error delivery через project-owned error policy.

Output boundary не должен знать:

- JSON, CSV или таблицы;
- application reports;
- command names;
- правила отображения значений;
- какие поля нужно скрыть или показать.

Project `terminalErrorPolicy` задаёт текст ошибки и exit code, а terminal app из `icore` применяет policy и доставляет результат. Таким образом, error ownership остаётся разделённым и не переходит целиком внешней зависимости.

Command registry типизирует результаты публичным `TerminalCommandOutput` из `icore`. SDK commands возвращают строки, async string streams или `undefined`. `TerminalApp.runPrepared()` сам выполняет runtime narrowing через публичный guard, поэтому локальная повторная проверка не нужна.

## Почему не нужны локальные generic wrappers

Удалённые project-owned renderers и writers больше не служат архитектурными точками расширения. Wrapper без собственного контракта добавит второй source of truth, и документация снова сможет разойтись с runtime.

Локальный adapter оправдан, только если он добавляет самостоятельное project-specific поведение:

- новый stable contract;
- reuse нескольких команд поверх generic primitives;
- policy, которой нет в `icore`;
- изоляцию внешней зависимости, необходимую для наблюдаемого поведения.

Одного более короткого import или предположения о будущей замене зависимости недостаточно.

## Правило для новых команд

При добавлении новой API-команды:

- declarative option schema передается command mechanics `icore`;
- `cli.ts` получает typed options, выполняет API-specific validation, строит generated request, вызывает SDK и закрывает его;
- `reporter.ts` строит stable report и command-specific output;
- generic JSON/CSV-row/table mechanics переиспользуется из public API `icore`;
- повторяющиеся scalar value conversions переиспользуются из `infrastructure/report-values.ts`;
- handler возвращает готовую строку или stream terminal app и не пишет normal result напрямую в `process.stdout`;
- generated DTO не становится стабильным CLI output contract;
- output contract выбирается для конкретной команды, а не для будущего неизвестного списка команд.

## Признаки неверной границы

Command-specific policy утекла в generic mechanics, если код:

- знает имя команды;
- импортирует `application/reports` ради выбора пользовательских полей;
- форматирует enum/date по правилам конкретной команды;
- скрывает или нормализует данные конкретного output contract;
- меняется при изменении CLI JSON contract.

Technical mechanics необоснованно дублируется в reporter-е, если код:

- повторяет CSV escaping;
- повторяет generic pretty JSON;
- повторяет расчет ширины таблицы;
- пишет normal result напрямую в `process.stdout`, хотя достаточно вернуть его terminal app.

## Направление зависимостей

Допустимо:

```text
bootstrap/commands/*/reporter.ts -> application/reports
bootstrap/commands/*/reporter.ts -> infrastructure/report-values.ts
bootstrap/commands/*/reporter.ts -> icore presentation primitives
bootstrap/cli/runner.ts          -> icore TerminalApp/Output
infrastructure/report-values.ts  -> application/reports
infrastructure/transport/grpc    -> application services/contracts
infrastructure/unary resolver    -> application TInvestUnaryQuota
infrastructure/grpc middleware   -> application TInvestUnaryLimiter
```

Недопустимо:

```text
application -> bootstrap/commands/*/reporter.ts
application -> icore CLI/presentation mechanics
infrastructure/report-values.ts -> command-specific report formatting
generic output facade -> выбор полей или JSON contract команды
```

Прямой import `icore` из `bootstrap` не меняет направление project layers: bootstrap остаётся внешним composition/presentation слоем и связывает external mechanics с локальными contracts.

## История перехода

Текущая модель сложилась после переноса общей механики presentation/output в `icore`:

1. Project-owned generic renderers и stdout/stderr writers удалены.
2. Reporter-ы вызывают публичные `icore` render primitives напрямую, без локальных forwarding wrappers.
3. Bootstrap CLI собирает `TerminalApp` и `Output`, но сохраняет project-owned alias inventory, help/version shortcuts, warnings и error policy; command aliases передаются в canonical definitions и разрешаются самим `icore`.
4. `application/reports`, command-specific presentation и `infrastructure/report-values.ts` остались project-owned contracts.

Отдельный use-case слой понадобится, только если command перестанет быть простой обёрткой над одним SDK call.

## Короткое правило

Если код отвечает на вопрос "что и как показать для конкретной команды", это command reporter.

Если код отвечает на вопрос "как механически сериализовать выбранные значения", используйте подходящий public primitive `icore`.

Если код отвечает на вопрос "как доставить готовый результат", это `TerminalApp`/`Output`, собранные в CLI runner-е.

Если код отвечает на вопрос "какой сценарий выполнить", это application use-case.

## Итог

```text
CLI executable       -> src/bootstrap/index.ts
CLI runner           -> src/bootstrap/cli/runner.ts
CLI error policy     -> src/bootstrap/cli/error.ts
CLI commands         -> src/bootstrap/commands
stable unary reports -> src/application/reports
scalar adapters      -> src/infrastructure/report-values.ts
format mechanics     -> public render primitives `icore`
normal output        -> `icore` TerminalApp -> Output.write -> stdout
diagnostics          -> `icore` Output.error -> stderr
```

Так project-owned presentation policy не смешивается с общей сериализацией и технической доставкой результата.
