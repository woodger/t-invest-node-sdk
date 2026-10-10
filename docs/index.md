# Документация проекта

> Type: Navigation. Здесь собраны ссылки на актуальные документы. Пользовательские контракты описаны в README, коде, справке CLI и тестах.

## Начать отсюда

- Установка, быстрый старт и параметры SDK: [README](../readme.md).
- Работа с SDK, потоками, ошибками и тестирование приложений: [Руководства по использованию SDK](./guides/index.md).
- История версий и инструкции по миграции: [CHANGELOG](../CHANGELOG.md).
- Слои проекта и их ответственность: [Архитектура SDK](./architecture.md).
- Правила внесения изменений: [Политики проекта](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/index.md).

## CLI

- Поддерживаемые команды, основные имена и совместимые псевдонимы: [Справочник CLI](./cli-reference.md).
- Контракт `stream run`: [Справочник потокового CLI](./cli-stream-reference.md).
- Настройка подписок и вывода потоковых команд через JSON: [Справочник конфигурации потокового CLI](./cli-stream-configuration.md).
- Как команды готовят результат, форматируют его и выводят в терминал: [Адаптеры, форматирование и вывод в CLI](./clean-architecture/cli-output-boundaries.md).

Актуальные команды и опции также показывает встроенный `--help`. Поведение CLI задают `src/bootstrap/cli/**`, `src/bootstrap/commands/**` и соответствующие тесты.

## Руководства

- [Первый SDK-вызов](./guides/getting-started.md).
- [Unary-вызовы](./guides/unary-calls.md).
- [Потоки и отмена](./guides/streams-and-cancellation.md).
- [Ошибки и lifecycle](./guides/errors-and-lifecycle.md).
- [Собственная реализация unary limiter-а](./guides/custom-unary-limiter.md).
- [Mock-сервисы через public exports](./guides/testing-with-service-definitions.md).

Руководства разбирают законченные сценарии для приложений, использующих SDK. Полный список методов, DTO и перечислений доступен в публичных типах, proto-контрактах и сгенерированном коде.

## SDK и runtime policies

- Публичные экспорты пакета: [`src/index.ts`](https://github.com/woodger/t-invest-node-sdk/blob/main/src/index.ts).
- Квоты T-Invest и ограничение частоты запросов в SDK: [Лимитная политика](./limits-policy.md).
- Встроенный корневой сертификат и настройка доверия для отдельного экземпляра SDK: [TLS-доверие](./tls-policy.md).
- Происхождение, распространение и подключение встроенного сертификата: [Встроенный Russian Trusted Root CA](./bundled-ca.md).
- Архитектурные заметки по application, DTO, отчётам и адаптерам: [Заметки по Clean Architecture](./clean-architecture/index.md).
- Неутверждённые варианты будущих изменений: [Roadmap и рабочие идеи](./roadmap.md).

## Разработка SDK

Генерация proto-контрактов и выпуск новой версии описаны в [руководстве по разработке SDK](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/development/index.md).

## Proto и generated contracts

Процесс генерации описан в [руководстве по разработке SDK](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/development/index.md#генерация-proto). [`contracts/upstream.json`](https://github.com/woodger/t-invest-node-sdk/blob/main/contracts/upstream.json) хранит адрес официального репозитория и закреплённые тег и коммит. Контракты обмена данными находятся в `contracts/*.proto`, а сгенерированный код — в `src/generated/**`; Markdown не дублирует их как отдельный справочник.

## Источники истины

Подробные правила выбора источника истины и обновления документации: [Политика документации](https://github.com/woodger/t-invest-node-sdk/blob/main/docs/policy/documentation-policy.md).

Кратко:

- публичные экспорты задаёт [`src/index.ts`](https://github.com/woodger/t-invest-node-sdk/blob/main/src/index.ts);
- скрипты и версии зависимостей задаёт [`package.json`](../package.json);
- поведение CLI задают исходный код и тесты;
- внешний API задают сохранённые proto-контракты и сведения об их источнике;
- Markdown объясняет сценарии работы и границы ответственности, а также указывает путь к актуальному контракту.
