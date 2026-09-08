# TLS-доверие

> Type: Reference. Документ описывает bundled trust material, per-instance override и границы TLS policy SDK.

## Настройки по умолчанию для T-Invest

T-Invest API требует сертификаты НУЦ Минцифры РФ для prod и sandbox endpoints. SDK включает Russian Trusted Root CA как статический PEM asset и при `useSsl: true` передаёт его в `ChannelCredentials.createSsl()`.

Asset применяется только к gRPC channel конкретного SDK instance:

- system trust store не изменяется;
- `NODE_EXTRA_CA_CERTS` не используется;
- install и runtime не скачивают сертификаты;
- hostname endpoint продолжает проверяться TLS transport-ом;
- сервер T-Invest передаёт промежуточный Russian Trusted Sub CA в своей цепочке.

Официальные endpoints и требование сертификатов описаны в [документации T-Invest](https://developer.tbank.ru/invest/intro/developer/network).

## Происхождение встроенного сертификата

Официальный источник, путь получения, X.509 fingerprint, границы распространения, package path и Consumer override описаны в отдельном документе [«Встроенный Russian Trusted Root CA»](./bundled-ca.md).

## Переопределение для экземпляра SDK

Custom или test endpoint может передать собственный PEM root bundle через `tls.rootCertificates`. SDK принимает содержимое сертификатов в `Buffer`, а не filesystem path. Явный bundle полностью заменяет встроенный сертификат для создаваемого channel; при `useSsl: false` TLS options игнорируются. Законченный пример приведён в [документе о встроенном сертификате](./bundled-ca.md#переопределение-в-коде-consumer-а).

## Граница безопасности

Bundled CA решает воспроизводимое TLS-доверие к цепочке T-Invest, но не является pinning-ом конкретного публичного ключа T-Bank. Владелец доверенного CA способен выпустить сертификат для другого endpoint, поэтому более строгий SPKI pin, если он потребуется, должен вводиться отдельной policy с собственной rotation model.

Процедура проверяемого обновления сертификата зафиксирована в [документе о встроенном сертификате](./bundled-ca.md#обновление-сертификата).

## Ошибки проверки сертификата

Если TLS transport однозначно сообщает об ошибке проверки цепочки сертификатов или несоответствии hostname, SDK возвращает `SdkErrorCode.Unavailable` с `source: 'tls'`. При этом сохраняются gRPC method `path`, исходные `details` и transport-specific `cause`.

Обычные provider и network `UNAVAILABLE`, включая DNS failures, connection refusal/reset и timeout, остаются `source: 'grpc'`. SDK не объявляет ни одну из этих ошибок retryable: решение о повторе принадлежит Consumer-у.

Текущий `nice-grpc` boundary не сохраняет структурированный low-level TLS code в публичной ошибке. Поэтому infrastructure adapter распознает закрытый набор однозначных certificate diagnostics внутри SDK. Это implementation detail: Consumer должен проверять `code` и `source`, но не разбирать `details` или `cause`.
