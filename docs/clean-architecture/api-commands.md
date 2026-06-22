# API Commands

> Type: Design Note. Документ фиксирует текущую структуру CLI API-команд и
> проблему роста `bootstrap`.

## Контекст

В SDK появились API-команды:

- `accounts` - получает счета пользователя;
- `candles` - получает исторические свечи.

Команда делает несколько разных вещей:

1. принимает CLI args;
2. валидирует primitive flags;
3. создает `TinkoffInvestNodeSDK`;
4. вызывает API method;
5. преобразует response в stable report;
6. форматирует report в JSON/CSV/table;
7. возвращает строку для вывода.

Если все эти обязанности оставить в `bootstrap`, command layer быстро станет
местом для любой логики вокруг CLI.

## Текущая Структура

```text
src/bootstrap
  args/
  cli/
  commands/
    accounts/
      cli.ts
      reporter.ts
    candles/
      cli.ts
      reporter.ts

src/infrastructure
  output/
    stderr-writer.ts
    stdout-writer.ts
  renderers/
    csv-renderer.ts
    json-renderer.ts
    table-renderer.ts
```

`cli.ts` сейчас отвечает за:

- whitelist CLI args;
- разбор command-specific flags;
- создание SDK facade;
- вызов API;
- закрытие SDK.

`reporter.ts` сейчас отвечает за:

- mapping generated response в application report;
- выбор command-specific output contract;
- подготовку значений для JSON/CSV/table output.

`infrastructure/renderers/*` сейчас отвечает за:

- технические детали pretty JSON, plain-text table и CSV row rendering.

`infrastructure/output/*` сейчас отвечает за:

- запись готового текста в `stdout` или `stderr`.

## Что Уже Хорошо

- CLI args validation отделена в `bootstrap/args`;
- stable output shape вынесен в `application/reports`;
- команды закрывают SDK в `finally`;
- formatting logic вынесена из `cli.ts`;
- JSON pretty-print, table alignment и CSV escaping не дублируются в command
  reporter-ах;
- `stdout`/`stderr` delivery отделен от построения JSON/CSV/table.

## Текущая Проблема

`bootstrap` по смыслу должен быть composition/entrypoint layer:

```text
parse entrypoint -> assemble dependencies -> call command -> return status/output
```

В `bootstrap` остается command-specific presentation/adaptation logic:

```text
generated response -> stable report
application report -> command-specific output values
```

Это осознанный компактный вариант, близкий к Inventory. Риск появляется, если
технические `infrastructure/renderers` начнут выбирать поля, делать redaction,
normalization или версионировать output конкретной команды.

Подробные правила разделения command-specific formatting, общих renderers и
stdout delivery описаны в
[Разделение форматирования и вывода в CLI](./cli-output-boundaries.md).

## Важное Разделение

Нужно различать две ответственности:

```text
report -> string
```

Это CLI adapter/presentation formatting.

```text
string -> stdout
```

Это output sink. `stdout` не должен знать, как строить JSON, CSV или table.

## Принятое Разделение

```text
src/bootstrap
  args/
  cli/
  commands/
    accounts/
      cli.ts
      reporter.ts
    candles/
      cli.ts
      reporter.ts

src/infrastructure
  renderers/
    csv-renderer.ts
    json-renderer.ts
    table-renderer.ts
  output/
    stdout-writer.ts
    stderr-writer.ts
```

Граница:

- `bootstrap/commands/*/cli.ts` - command entrypoint, parsing и SDK lifecycle;
- `bootstrap/commands/*/reporter.ts` - generated response -> application report
  и command-specific CLI output;
- `src/infrastructure/renderers/**` - механика JSON/CSV/table rendering;
- `src/infrastructure/output/**` - запись готовой строки в stream;
- `application/reports/**` - stable output contracts.

## Когда Нужен Use-Case

Текущие API-команды тонкие: они вызывают один SDK method и форматируют результат.
Для таких команд отдельный use-case не обязателен.

Use-case стоит выделять, если появляется хотя бы одно:

- несколько API calls в одном сценарии;
- retry/fallback/cache decision;
- сценарные ошибки и partial success;
- provider-neutral contract;
- reuse того же сценария вне CLI;
- тесты начинают мокать слишком много деталей SDK.

## Правило Для Новых Команд

- не добавлять новую formatting logic в `cli.ts`;
- держать command handler тонким;
- описывать stable output в `application/reports`;
- держать command-specific output policy в `bootstrap/commands/*/reporter.ts`;
- использовать `infrastructure/renderers` только для общей механики формата;
- не класть JSON/CSV/table formatting в stdout sink;
- сверять новые output-решения с
  [Разделением форматирования и вывода в CLI](./cli-output-boundaries.md).
