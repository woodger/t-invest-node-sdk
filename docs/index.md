# Документация проекта

> Type: Navigation. Выберите раздел по задаче: работа с SDK, CLI или разработка проекта.

<a id="руководства"></a>

## Начать отсюда

- [README](../readme.md) — установка, быстрый старт и параметры SDK.
- [Примеры](./examples/index.md) — запросы, потоки, ошибки и тестирование приложения.
- [CHANGELOG](../CHANGELOG.md) — история версий и миграция.

## CLI

- [Справочник CLI](./cli-reference.md) — команды, псевдонимы, аргументы и коды завершения.
- [Потоковый CLI](./cli-stream-reference.md) — поддерживаемые потоки, вывод событий и завершение `stream run`.
- [Конфигурация потокового CLI](./cli-stream-configuration.md) — подписки и настройки в JSON.

<a id="sdk-и-runtime-policies"></a>

## Настройки SDK

- [Лимиты API](./limits-policy.md) — квоты T-Invest и их применение в SDK.
- [TLS-доверие](./tls-policy.md) — настройка корневых сертификатов.
- [Встроенный CA](./bundled-ca.md) — происхождение, распространение и подключение сертификата.
- [Публичные экспорты](../src/index.ts).

<a id="proto-и-generated-contracts"></a>
<a id="источники-истины"></a>

## Разработка SDK

- [Архитектура SDK](./architecture.md) — карта слоёв и ответственность компонентов.
- [Заметки по Clean Architecture](./clean-architecture/index.md) — контракты приложения, устройство команд, форматирование и вывод.
- [Разработка и выпуск версии](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/development.md) — обновление proto и генерация TypeScript.
- [Источник контрактов](../contracts/upstream.json) — закреплённые версия и коммит T-Invest API.
- [Политики проекта](./policy/index.md) — правила внесения изменений.
- [Политика документации](./policy/documentation-policy.md) — выбор источника истины и назначение документов.
- [Roadmap](./roadmap.md) — варианты будущих изменений.
