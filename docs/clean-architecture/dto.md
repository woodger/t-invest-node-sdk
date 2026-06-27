# DTO И Reports

> Type: Design Note. Документ объясняет boundary contracts текущего SDK.

## Кратко

В текущем проекте есть несколько разных типов contracts, и их нельзя смешивать:

- proto-generated DTO из `src/generated/**`;
- application DTO из `src/application/dto/**`;
- application report contracts из `src/application/reports/**`;
- CLI command option schemas из `src/bootstrap/commands/**` и общие SDK options
  из `src/bootstrap/args/**`.

## Generated DTO

`src/generated/**` воспроизводится из `contracts/**/*.proto`.

Это wire contracts внешнего API. Их нельзя редактировать вручную и нельзя
использовать как место для project-specific правил.

Допустимо:

- импортировать generated types в infrastructure adapters;
- использовать generated service definitions при создании gRPC clients;
- возвращать generated clients из публичного SDK facade, потому что SDK
  сохраняет совместимость с T-Invest API.

Нежелательно:

- делать generated DTO основой новых application reports;
- добавлять handwritten mapping или helpers в generated файлы;
- завязывать CLI output format на нестабильный generated JSON shape.

## Application DTO

`src/application/dto/tinkoff-invest-options.ts` описывает options SDK facade.

Это не CLI DTO и не gRPC DTO. Один и тот же contract может использоваться из
bootstrap, tests и публичного SDK facade.

Правило:

```text
CLI/env parsing -> TinkoffInvestOptions -> SDK facade/infrastructure
```

`application/dto` не должен читать env и не должен знать про CLI flags.

## Reports

`src/application/reports/**` содержит stable output contracts API-команд.

Reports отвечают на вопрос:

```text
что команда сообщает наружу?
```

Они не отвечают на вопрос:

```text
как это вывести в JSON, CSV, table или stdout?
```

Форматирование должно жить во внешнем adapter/presentation слое.

## CLI Input

Raw `process.argv` остается на границе `bootstrap/cli.ts` и дальше
обрабатывается через `icore` command registry:

```text
process.argv -> icore command registry -> typed command options -> command handler
```

Command-specific primitive options описываются декларативными `icore` schemas в
`src/bootstrap/commands/**`. Общие SDK options нормализуются в
`src/bootstrap/args/**`. Эти модули не должны создавать SDK clients, вызывать API
или форматировать reports.

После `icore` validation command handler работает с typed command options. Raw
CLI option maps не должны передаваться в request builders. Если нужен focused
parser для CLI edge case, он должен оставаться `parse*` helper-ом и работать с
raw options. Mapping typed options в generated request DTO должен жить в
`create*Request` helper-е.

## Mapping

Текущий flow API-команды:

```text
process.argv
  -> icore parser/validator
  -> typed command options
  -> generated request DTO
  -> generated SDK call
  -> application report
  -> CLI output
```

Где должен жить mapping:

| Mapping | Текущее место | Возможное целевое место |
| --- | --- | --- |
| typed command options -> `TinkoffInvestOptions` | `bootstrap/args` | без изменений |
| typed command options -> generated request DTO | `bootstrap/commands/*/cli.ts`, `create*Request` | application use-case, если command перестает быть тонким adapter-ом |
| generated API response -> application report | `bootstrap/commands/*/reporter.ts` | CLI adapter или application use-case, зависит от выбранной границы |
| application report -> command-specific output values | `bootstrap/commands/*/reporter.ts` | без изменений для компактного Inventory-style CLI |
| output values -> JSON/CSV/table | `infrastructure/renderers/*` | без изменений, пока renderer-ы остаются механическими |
| string -> stdout/stderr | `infrastructure/output/*`, подключается из `bootstrap/cli.ts` | без изменений |

## Типичные Ошибки

- передавать raw CLI args глубже bootstrap boundary;
- смешивать raw CLI parsing и generated request DTO mapping в одной функции;
- форматировать пользовательский output внутри application report contract;
- класть JSON/CSV/table logic в stdout sink;
- считать generated DTO стабильным CLI output contract;
- создавать generic DTO только ради красивой структуры.

## Резюме

- DTO и reports - это boundary contracts, а не domain models.
- Generated contracts принадлежат proto workflow.
- Application reports стабильны и transport-neutral.
- CLI formatting должен быть отделен от записи в stdout.
