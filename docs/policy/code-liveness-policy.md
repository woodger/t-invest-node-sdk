# Политика жизненности кода

> Type: Policy. Этот документ задает правила классификации кода при refactoring audit, deletion audit и cleanup pass.

## Назначение

Код считается живым не потому, что он компилируется, экспортируется или имеет тесты. Код считается живым, если у него есть подтвержденная роль в текущем production graph, поддерживаемом public/internal contract или runtime binding.

Эта policy помогает отличать:

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
- `src/bootstrap/tinkoff-invest-node-sdk.ts`;
- SDK internals, middleware, channel/client creation в `src/infrastructure/transport/grpc`;
- CLI entrypoint в `src/bootstrap/cli.ts`, reusable CLI guards в `src/bootstrap/args`, command registry и registered handlers в `src/bootstrap/commands`, если они связаны через `package.json` `bin`;
- proto generation entrypoint в `src/bootstrap/compile-proto.ts`, если он связан через `package.json` script;
- throttling runtime configuration;
- `contracts/**/*.proto`;
- `src/generated-exports.ts` и generated modules, если они экспортируются пакетом;
- dynamic runtime bindings, если они подтверждены кодом или конфигурацией.

Код, достижимый из production graph, нельзя удалять как dead code.

### Test Graph

Test graph начинается от `*.test.ts` и test runner.

Тесты подтверждают, что код имеет проверяемое поведение. Тесты не доказывают, что код используется SDK в runtime.

Если модуль достижим только из test graph, он классифицируется отдельно и не удаляется без owner decision.

## Категории

### Active Runtime Code

Код имеет подтвержденный путь из production graph.

Признаки:

- импортируется runtime-кодом;
- участвует в package entrypoint или public exports;
- используется SDK client, middleware, generated exports или runtime config;
- является declaration/config/entrypoint-файлом, нужным сборке или запуску;
- является явно поддерживаемым public/internal API.

Решение: `keep`.

### Generated Contract Code

Код получен из `contracts/**/*.proto` и воспроизводится proto workflow.

Признаки:

- находится в `src/generated/**` или `dist/generated/**`;
- соответствует proto contract;
- используется generated exports или public API.

Решение: `keep`, если source proto и exports актуальны.

Generated code нельзя чистить вручную как обычный handwritten code. Если он устарел, нужно исправлять proto workflow или source contracts.

### Unused File

Файл не имеет входящих ссылок.

Признаки:

- нет imports;
- нет barrel exports;
- нет test references;
- нет docs references;
- нет package script / entrypoint references;
- нет dynamic string references;
- файл не является declaration/config/entrypoint-файлом.

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

Такой код нельзя удалять механически: сначала нужно понять, это устаревшая реализация, потерянный runtime flow или намеренно сохраненный contract.

### Barrel-only Export

Код экспортируется через `index.ts` или другой barrel, но не используется production-кодом.

Признаки:

- есть `export * from ...` или named re-export;
- symbols не импортируются active runtime code;
- tests могут существовать или отсутствовать;
- package public API может быть шире внутреннего runtime graph.

Решение: `needs owner decision`.

Barrel export сам по себе не доказывает жизненность внутреннего кода, но может быть public API contract. Удаление требует отдельного решения.

### Orphaned Island

Группа файлов использует друг друга, но у всей группы нет входящего production reference.

Признаки:

- модуль выглядит используемым, потому что его импортирует другой файл;
- этот другой файл сам не достижим из production graph;
- island может иметь tests и internal utilities;
- удаление одного файла требует рассматривать всю группу.

Решение: `needs owner decision` или отдельный small deletion pass после подтверждения владельца.

Внутренняя зависимость внутри острова не делает остров активным.

### Roadmap Code

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

Используется, если код:

- достижим из production graph;
- нужен сборке, типам, declarations или runtime config;
- является package entrypoint;
- поддерживается как public/internal API;
- имеет действующий documented contract.

### Delete Candidate

Используется, если код:

- не имеет production usage;
- не имеет public/internal API роли;
- не нужен test harness как осознанный contract;
- не является declaration/config/entrypoint;
- не содержит важного архитектурного намерения.

Удаление выполняется только small batch-ами.

### Move To Roadmap

Используется, если код:

- описывает будущую возможность;
- не имеет текущего consumer-а;
- существует как placeholder;
- лучше выражается документом, чем source file.

### Needs Owner Decision

Используется, если код:

- имеет реальную реализацию;
- покрыт тестами;
- экспортируется через barrel;
- выглядит архитектурно значимым;
- но не достижим из production graph.

Такой код нельзя удалять в автоматическом cleanup pass.

## Чеклист аудита

Перед deletion pass нужно проверить:

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
- является ли файл частью orphaned island.

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

Если по файлу есть сомнение, он остается в `needs owner decision`.
