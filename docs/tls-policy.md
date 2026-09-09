# TLS-доверие

> Type: Reference. Здесь описаны встроенный корневой сертификат, его переопределение для отдельного SDK instance и границы TLS policy.

## Настройки по умолчанию для T-Invest

T-Invest API требует сертификаты НУЦ Минцифры РФ для prod и sandbox endpoints. SDK включает Russian Trusted Root CA как статический PEM asset и при `useSsl: true` передаёт его в `ChannelCredentials.createSsl()`.

Сертификат действует только для gRPC channel конкретного SDK instance:

- system trust store не изменяется;
- `NODE_EXTRA_CA_CERTS` не используется;
- install и runtime не скачивают сертификаты;
- hostname endpoint продолжает проверяться TLS transport-ом;
- сервер T-Invest передаёт промежуточный Russian Trusted Sub CA в своей цепочке.

Официальные endpoints и требование сертификатов описаны в [документации T-Invest](https://developer.tbank.ru/invest/intro/developer/network).

## Происхождение встроенного сертификата

Официальный источник, путь получения, X.509 fingerprint, границы распространения, package path и Consumer override описаны в отдельном документе [«Встроенный Russian Trusted Root CA»](./bundled-ca.md).

## Переопределение для экземпляра SDK

Для custom или test endpoint можно передать собственный PEM root bundle через `tls.rootCertificates`. SDK принимает содержимое сертификатов в `Buffer`, а не filesystem path. Переданный bundle полностью заменяет встроенный сертификат для нового channel; при `useSsl: false` SDK игнорирует TLS options. Полный пример приведён в [документе о встроенном сертификате](./bundled-ca.md#переопределение-в-коде-consumer-а).

## Граница безопасности

Bundled CA обеспечивает воспроизводимое доверие к TLS-цепочке T-Invest, но не закрепляет конкретный публичный ключ T-Bank. Владелец доверенного CA может выпустить сертификат для другого endpoint. Если проекту понадобится более строгий SPKI pin, для него потребуется отдельная policy и собственная модель ротации.

Порядок проверяемого обновления сертификата описан в [документе о встроенном сертификате](./bundled-ca.md#обновление-сертификата).

## Ошибки проверки сертификата

Если TLS transport однозначно сообщает об ошибке проверки цепочки сертификатов или несовпадении hostname, SDK возвращает `SdkErrorCode.Unavailable` с `source: 'tls'`. Ошибка сохраняет gRPC method `path`, исходные `details` и transport-specific `cause`.

Обычные provider и network `UNAVAILABLE`, включая DNS failures, connection refusal/reset и timeout, остаются `source: 'grpc'`. SDK не объявляет ни одну из этих ошибок retryable: решение о повторе принадлежит Consumer-у.

На границе с `nice-grpc` публичная ошибка не сохраняет структурированный low-level TLS code. Поэтому infrastructure adapter распознаёт внутри SDK закрытый набор однозначных certificate diagnostics. Это implementation detail: Consumer должен проверять `code` и `source`, но не разбирать `details` или `cause`.
