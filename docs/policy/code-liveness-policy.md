# Политика жизненности кода

> Type: Policy. Здесь описана классификация кода для refactoring audit, deletion audit и cleanup pass.

## Назначение

Компиляция, export или наличие тестов сами по себе не делают код живым. Для этого нужна подтверждённая роль в текущем production graph, поддерживаемом public/internal contract или runtime binding.

Эта policy различает:

- активный runtime-код;
- полностью неиспользуемые файлы;
- TODO/placeholders;
- реализации, используемые только тестами;
- barrel-only exports;
- orphaned islands;
- roadmap code, который должен жить в документации, а не в `src`.

## Production graph и test graph

### Production Graph

Production graph начинается от runtime entrypoints и рабочих связей проекта:

- `package.json` `main`, `types`, `exports` и runtime scripts;
- `src/index.ts`;
- `src/bootstrap/t-invest-node-sdk.ts`;
- SDK internals, middleware, channel/client creation в `src/infrastructure/transport/grpc`;
- CLI entrypoint в `src/bootstrap/index.ts`, CLI mechanics в `src/bootstrap/cli/**`, reusable CLI guards в `src/bootstrap/args`, registered handlers в `src/bootstrap/commands`, если они связаны через `package.json` `bin`;
- proto generation entrypoint в `src/bootstrap/commands/compile-proto/cli.ts` и `src/bootstrap/proto/compile-proto.ts`, если он связан через CLI registry;
- unary quota configuration и limiter runtime;
- `contracts/*.proto`;
- `src/bootstrap/generated-exports.ts` и generated modules, если они экспортируются пакетом;
- dynamic runtime bindings, если они подтверждены кодом или конфигурацией.

Код, достижимый из production graph, нельзя удалять как dead code.

### Test Graph

Test graph начинается от `*.test.ts` и `package.json` `test` script, который вызывает test runner `fwa`.

Тесты подтверждают проверяемое поведение кода, но не доказывают, что SDK использует его в runtime.

Модуль, достижимый только из test graph, относится к отдельной категории. Не удаляйте его без owner decision.

## Категории

### Активный runtime-код

Код имеет подтвержденный путь из production graph.

Признаки:

- импортируется runtime-кодом;
- участвует в package entrypoint или public exports;
- используется SDK client, middleware, generated exports или runtime config;
- нужен сборке или запуску как declaration/config/entrypoint-файл;
- явно поддерживается как public/internal API.

Решение: `keep`.

### Сгенерированный код контрактов

Код получен из `contracts/*.proto` и воспроизводится proto workflow.

Признаки:

- находится в `src/generated/**` или `dist/generated/**`;
- соответствует proto contract;
- используется generated exports или public API.

Решение: `keep`, если source proto и exports актуальны.

Не чистите generated code вручную как обычный handwritten code. Если он устарел, исправьте proto workflow или source contracts.

### Unused File

Файл не имеет входящих ссылок.

Признаки:

- нет imports;
- нет barrel exports;
- нет test references;
- нет docs references;
- нет package script / entrypoint references;
- нет dynamic string references;
- файл не нужен как declaration/config/entrypoint.

Решение: `delete candidate`, если нет архитектурного намерения или публичного контракта.

### Placeholder

Файл содержит только TODO, комментарий или пустую архитектурную заготовку.

Признаки:

- нет executable code;
- нет meaningful exports;
- нет production usage;
- текст описывает будущую идею, а не текущую реализацию.

Решение: `move to roadmap` или `delete candidate`.

Практическое правило: пока нет consumer-а, это документация, а не source code.

### Test-only Implementation

Реальная реализация используется только тестами.

Признаки:

- есть executable code;
- есть tests;
- нет production imports;
- нет runtime usage.

Решение: `needs owner decision`.

Не удаляйте такой код механически. Сначала выясните, что перед вами: устаревшая реализация, потерянный runtime flow или намеренно сохранённый contract.

### Barrel-only Export

Код экспортируется через `index.ts` или другой barrel, но не используется production-кодом.

Признаки:

- есть `export * from ...` или named re-export;
- symbols не импортируются active runtime code;
- tests могут существовать или отсутствовать;
- package public API может быть шире внутреннего runtime graph.

Решение: `needs owner decision`.

Barrel export сам по себе не доказывает жизненность внутреннего кода, но может входить в public API contract. Для удаления нужно отдельное решение.

### Orphaned Island

Группа файлов использует друг друга, но у всей группы нет входящего production reference.

Признаки:

- модуль выглядит используемым, потому что его импортирует другой файл;
- этот другой файл сам не достижим из production graph;
- island может иметь tests и internal utilities;
- удаление одного файла требует рассматривать всю группу.

Решение: `needs owner decision` или отдельный small deletion pass после подтверждения владельца.

Внутренние зависимости не делают такой остров активным.

### Код из roadmap

Код выражает будущее намерение, но не имеет текущего consumer-а.

Признаки:

- planned port, strategy, service или adapter;
- пустой interface или stub;
- TODO-only implementation;
- design example без runtime usage.

Решение: `move to roadmap`.

Roadmap должен жить в docs, issue tracker или планах, а не в пустых runtime файлах.

## Решения

### Keep

Выберите `keep`, если код:

- достижим из production graph;
- нужен сборке, типам, declarations или runtime config;
- служит package entrypoint;
- поддерживается как public/internal API;
- имеет действующий documented contract.

### Delete Candidate

Считайте код `delete candidate`, если он:

- не имеет production usage;
- не имеет public/internal API роли;
- не нужен test harness как осознанный contract;
- не нужен как declaration/config/entrypoint;
- не содержит важного архитектурного намерения.

Удаляйте такой код только small batch-ами.

### Move To Roadmap

Выберите `move to roadmap`, если код:

- описывает будущую возможность;
- не имеет текущего consumer-а;
- существует как placeholder;
- лучше выражается документом, чем source file.

### Needs Owner Decision

Выберите `needs owner decision`, если код:

- имеет реальную реализацию;
- покрыт тестами;
- экспортируется через barrel;
- выглядит архитектурно значимым;
- но не достижим из production graph.

Такой код нельзя удалять в автоматическом cleanup pass.

## Чеклист аудита

Перед deletion pass проверьте:

- imports по имени файла;
- imports по exported symbols;
- barrel exports;
- test references;
- docs references;
- package `main`, `types`, `exports` и scripts;
- tsconfig include/exclude;
- generated exports;
- proto workflow;
- runtime config;
- dynamic string references;
- не входит ли файл в orphaned island.

## Минимальное правило удаления

Deletion pass должен быть ограничен заранее перечисленными файлами.

Обязательные условия:

- не менять behavior runtime flow;
- не делать unrelated cleanup;
- не переносить архитектуру по пути;
- не обновлять зависимости;
- не удалять owner-decision candidates без подтверждения;
- запускать build, tests, lint и diff checks;
- показывать diff summary.

Если по файлу есть сомнение, оставьте его в `needs owner decision`.
