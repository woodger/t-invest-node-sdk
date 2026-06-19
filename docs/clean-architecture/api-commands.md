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
  csv-renderer.ts
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
- JSON/CSV/table formatting.

`*-renderer.ts` сейчас отвечает за:

- технические детали plain-text table или CSV row rendering.

## Что Уже Хорошо

- CLI args validation отделена в `bootstrap/args`;
- stable output shape вынесен в `application/reports`;
- команды закрывают SDK в `finally`;
- formatting logic вынесена из `cli.ts`;
- table/CSV escaping не дублируется в command reporter-ах.

## Текущая Проблема

`bootstrap` по смыслу должен быть composition/entrypoint layer:

```text
parse entrypoint -> assemble dependencies -> call command -> return status/output
```

Но сейчас в `bootstrap` уже лежит presentation/adaptation logic:

```text
application report -> JSON/CSV/table
generated response -> stable report
```

Если JSON formatting начнет содержать логику совместимости, redaction,
normalization или версионирование output, `bootstrap` начнет расти
неконтролируемо.

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

## Возможное Целевое Разделение

Если решено держать adapters внутри `infrastructure`, целевая структура может
быть такой:

```text
src/bootstrap
  args/
  cli/
  commands/
    accounts/cli.ts
    candles/cli.ts

src/infrastructure
  grpc/
  adapters/
    cli/
      commands/
        accounts/reporter.ts
        candles/reporter.ts
      renderers/
        csv-renderer.ts
        table-renderer.ts
    stdout/
      stdout-writer.ts
```

Граница:

- `bootstrap/commands/*/cli.ts` - command entrypoint и wiring;
- `infrastructure/adapters/cli/**` - application report -> CLI output;
- `infrastructure/adapters/stdout/**` - string -> process stdout, если нужен
  отдельный sink;
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

Пока placement CLI adapters не выбран окончательно:

- не добавлять новую formatting logic в `cli.ts`;
- держать command handler тонким;
- описывать stable output в `application/reports`;
- не класть JSON/CSV/table formatting в stdout sink;
- при втором consumer-е переносить общий rendering code из command reporter-а.
