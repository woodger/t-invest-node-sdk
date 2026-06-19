# DTO И Reports

> Type: Design Note. Документ объясняет boundary contracts текущего SDK.

## Кратко

В текущем проекте есть несколько разных типов contracts, и их нельзя смешивать:

- proto-generated DTO из `src/generated/**`;
- application DTO из `src/application/dto/**`;
- application report contracts из `src/application/reports/**`;
- CLI args contract из `src/bootstrap/cli-contract.ts` и `src/bootstrap/args/**`.

## Generated DTO

`src/generated/**` воспроизводится из `contracts/*.proto`.

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

## CLI Args

CLI args - это boundary contract bootstrap-слоя:

```text
process.argv -> CliArgs -> command handler
```

`src/bootstrap/args/**` проверяет primitive CLI values и нормализует общие SDK
options. Он не должен создавать SDK clients, вызывать API или форматировать
reports.

## Mapping

Текущий flow API-команды:

```text
CliArgs
  -> command parser
  -> generated SDK call
  -> application report
  -> CLI output
```

Где должен жить mapping:

| Mapping | Текущее место | Возможное целевое место |
| --- | --- | --- |
| CLI args -> `TinkoffInvestOptions` | `bootstrap/args` | без изменений |
| generated API response -> application report | `bootstrap/commands/*/reporter.ts` | CLI adapter или application use-case, зависит от выбранной границы |
| application report -> JSON/CSV/table | `bootstrap/commands/*/reporter.ts`, `bootstrap/*-renderer.ts` | `infrastructure/adapters/cli` или отдельный interface adapter слой |
| string -> stdout | `bootstrap/cli` через writable context | future stdout adapter, если появится abstraction |

## Типичные Ошибки

- передавать raw CLI args глубже bootstrap boundary;
- форматировать пользовательский output внутри application report contract;
- класть JSON/CSV/table logic в stdout sink;
- считать generated DTO стабильным CLI output contract;
- создавать generic DTO только ради красивой структуры.

## Резюме

- DTO и reports - это boundary contracts, а не domain models.
- Generated contracts принадлежат proto workflow.
- Application reports стабильны и transport-neutral.
- CLI formatting должен быть отделен от записи в stdout.
