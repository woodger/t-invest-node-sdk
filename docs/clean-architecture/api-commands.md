# API-команды

> Type: Design Note. Здесь описаны текущая структура CLI API-команд и риск разрастания `bootstrap`.

## Контекст

Поддерживаемые команды, preferred paths, compatibility aliases, действующие stream-возможности и ограничения описаны в [справочнике CLI](../cli-reference.md). Здесь приведены правила устройства command layer.

Registry хранит один canonical definition на команду и передаёт остальные пути через first-class aliases `icore`. В resolved command поля `name` и `path` содержат preferred identity, а `matchedPath` — введённый путь.

Добавляйте API-команды по одной, когда выбран конкретный SDK method и понятен CLI-контракт. Preferred path должен попасть в command definition и help, а technical/legacy aliases — только в единый alias layer, который передаёт их в native command definition `icore`.

## Отложенные расширения

Динамические bidirectional request sources остаются отложенным API-контрактом. Перед расширением stream command сверьте поведение со [справочником потокового CLI](../cli-stream-reference.md) и [справочником конфигурации](../cli-stream-configuration.md); любое изменение контракта нужно описать отдельно.

## Command flow

В command flow участвуют несколько ответственностей:

1. runner и `icore` разбирают CLI args и валидируют primitive options по schema;
2. command handler или его command-owned mapper выполняет API-specific validation и request mapping;
3. общий lifecycle helper создает `TInvestNodeSDK` для короткой команды;
4. command handler вызывает API method;
5. reporter преобразует unary response в stable report или stream event в локальный контракт вывода команды;
6. reporter выбирает command-specific output и использует generic render primitives, когда они подходят;
7. terminal app получает готовую строку или stream для вывода.

Если снова собрать эти обязанности в одном command handler, command layer быстро начнёт принимать любую логику вокруг CLI.

## Текущая структура

```text
src/bootstrap
  index.ts
  args/
    command-options.ts
    instrument-id-options.ts
    instruments-args.ts
    side-effect-args.ts
  cli/
    contract.ts
    error.ts
    help-catalog.ts
    help.ts
    registry.ts
    runner.ts
  commands/
    sdk-command-lifecycle.ts
    <command-adapter>/
      cli.ts
      request.mapper.ts  # когда mapping разделяют production и Sandbox
      reporter.ts
    stream-run/
      cli.ts
      config.ts
      request.mapper.ts
      stream-session.ts
      reporter.ts

src/infrastructure
  interceptor/
  report-values.ts
  transport/grpc/

external dependency
  icore
    option/command mechanics
    renderJson/renderCsv/renderCsvRow/renderTextTable
    TerminalApp/Output
```

`cli.ts` отвечает за:

- объявление command path, declarative option schema и handler-а через локальный command facade над `icore`;
- локальный request mapping или делегирование в `request.mapper.ts`, когда mapping разделяет несколько команд;
- API-specific validation, которая не выражается primitive schema;
- передачу короткого SDK lifecycle в `runSdkCommand()`;
- вызов API;
- выбор reporter-а для результата.

Логические CLI options используют синтаксис флагов `icore`: `--flag` и, если команда поддерживает отрицательное переопределение, `--no-flag`. Публичный CLI-контракт не принимает формы `--flag=true` и `--flag=false`.

Внутри command module нужно различать parsing и request mapping:

```text
icore schema    -> raw argv -> typed command options
parse*          -> typed primitive value -> project-specific value
create*Request  -> typed command options -> generated request DTO
```

Command-local `parse*` helpers не должны повторно принимать raw option map: `icore` отвечает за format, enum и primitive schema validation. Project-specific helper может преобразовать отдельное typed значение, например comma-separated список. `create*Request` получает не raw CLI args, а typed options после `icore`; он отвечает за форму generated request DTO и request-level validation, например date range или mutually exclusive modes.

`reporter.ts` отвечает за:

- mapping unary response в application report или stream event в command-local output contract;
- выбор command-specific output contract;
- выбор полей, headers, порядка и подготовку значений для JSON/CSV/table output;
- вызов generic render primitives `icore`, когда они подходят формату.

`icore` предоставляет:

- primitive option parsing, typed schema validation и command mechanics;
- технические детали JSON, plain-text table и CSV rendering;
- `TerminalApp`/`Output.write` для штатной записи готовой строки или stream в stdout;
- `Output.error` для warnings/errors в stderr.

Project CLI layer собирает terminal app, объявляет native short aliases, передаёт compatibility paths как first-class aliases canonical definitions и обслуживает help/version shortcuts и warnings. Project error policy задаёт текст ошибки и exit code.

Директории внутри `bootstrap/commands/*` носят компактные имена adapter-модулей и не задают публичный CLI path. Контракт команды находится в `bootstrap/cli/registry.ts`, а статические данные справки — в `bootstrap/cli/help-catalog.ts`.

## Что уже хорошо

- primitive option validation выражена `icore` schemas, а reusable project-specific normalizers отделены в `bootstrap/args`;
- raw CLI parsing отделен от typed generated request mapping;
- stable unary output shape вынесен в `application/reports`, а stream contract зафиксирован отдельно;
- общий helper закрывает SDK коротких команд в `finally`, а stream session владеет собственным cleanup;
- formatting logic вынесена из `cli.ts`;
- JSON pretty-print, table alignment и CSV escaping не дублируются в command reporter-ах;
- `stdout`/`stderr` delivery отделен от построения JSON/CSV/table.

## Текущая проблема

`bootstrap` по смыслу должен быть composition/entrypoint layer:

```text
parse entrypoint -> assemble dependencies -> call command -> return status/output
```

В `bootstrap` остаётся command-specific presentation/adaptation logic:

```text
unary response -> stable report
stream event -> command-local output contract
report/event contract -> command-specific output values
```

Это осознанный компактный вариант, близкий к Inventory. Проблема возникнет, если generic primitives начнут выбирать поля, выполнять redaction или normalization либо версионировать output конкретной команды. Другая крайность — дублировать механику JSON/CSV/table в reporter-ах или создавать forwarding wrappers над `icore` без собственного контракта.

Подробные правила разделения command-specific formatting, generic render primitives и stdout delivery приведены в документе [«Разделение форматирования и вывода в CLI»](./cli-output-boundaries.md).

## Важное разделение

Reporter выбирает смысл и структуру пользовательского вывода, render primitives выполняют общую механику формата, а terminal output доставляет готовый результат. Потоки stdout и stderr и ограничения output boundary описаны в [основной границе форматирования и вывода](./cli-output-boundaries.md#основная-граница).

## Принятое разделение

Граница:

- `bootstrap/commands/*/cli.ts` - command definition, API-specific orchestration и вызов общего SDK lifecycle;
- `bootstrap/commands/*/request.mapper.ts` - shared production/Sandbox request mapping там, где он действительно переиспользуется;
- `bootstrap/commands/*/reporter.ts` - provider result -> stable report или локальный контракт события -> специализированный вывод CLI-команды;
- public render primitives `icore` - механика JSON/CSV-row/table rendering;
- `icore` `TerminalApp`/`Output.write`, собранные в `bootstrap/cli/runner.ts`, - штатная запись готовой строки или stream в stdout;
- `icore` `Output.error` - warnings/errors в stderr;
- `application/reports/**` - стабильные контракты вывода unary-команд.

## Когда нужен use-case

Текущие API-команды тонкие: они вызывают один SDK method и форматируют результат. Отдельный use-case им не нужен.

Use-case стоит выделять, если появляется хотя бы одно:

- несколько API calls в одном сценарии;
- решение о retry/fallback/cache;
- сценарные ошибки и partial success;
- provider-neutral contract;
- reuse того же сценария вне CLI;
- тесты начинают мокать слишком много деталей SDK.

## Правило для новых команд

- не добавлять новую formatting logic в `cli.ts`;
- держать command handler тонким;
- описывать stable unary output в `application/reports`, а специализированный stream contract фиксировать отдельно;
- держать command-specific output policy в `bootstrap/commands/*/reporter.ts`;
- использовать public render primitives `icore` только для общей механики формата;
- возвращать normal result terminal app и не переносить JSON/CSV/table policy в output facade;
- регистрировать команду в `bootstrap/cli/registry.ts` в canonical форме `<domain> <command>`;
- добавлять technical/legacy paths только через project alias inventory; registry передаст их в `aliases` canonical definition;
- не добавлять short option aliases для API-команд;
- добавлять help metadata в `bootstrap/cli/help-catalog.ts`;
- добавлять тесты рядом с конкретными файлами команды;
- не вводить общий command framework до появления реального повторения в нескольких командах;
- сверять новые output-решения с [Разделением форматирования и вывода в CLI](./cli-output-boundaries.md).

## Когда обобщать commands

Обобщайте command lifecycle только после появления повторения с одинаковой ответственностью.

Каждая команда остаётся явной, а общий lifecycle коротких вызовов вынесен отдельно:

```text
bootstrap/commands/<command-adapter>/cli.ts
bootstrap/commands/sdk-command-lifecycle.ts
bootstrap/commands/<command-adapter>/reporter.ts
application/reports/<command-adapter>.report.ts
```

Допустимые причины для extract-а:

- один и тот же SDK lifecycle повторяется в 3+ API-командах;
- одинаковый parsing/validation pattern больше не выражается существующими `icore` option schemas;
- tests начинают дублировать setup без изменения сценария;
- общий код получает понятную ответственность и не скрывает command-specific различия.

Недопустимые причины:

- будущий список команд неизвестен, поэтому хочется подготовить framework;
- две команды выглядят похожими внешне, но имеют разные request/report/output правила;
- хочется сократить количество строк в `commands/*/cli.ts`.
