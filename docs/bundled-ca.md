# Встроенный Russian Trusted Root CA

> Type: Notice. Здесь описаны происхождение, границы распространения и техническое подключение корневого сертификата из package SDK.

## Назначение документа

SDK содержит публичный корневой X.509-сертификат Russian Trusted Root CA, необходимый для проверки TLS-цепочки T-Invest API. В package не входит соответствующий приватный ключ.

Сертификат не относится к исходному коду авторов SDK. Проект не заявляет авторство сертификата и не распространяет на него MIT License из корневого [`LICENSE`](../LICENSE). Документ приводит доступные официальные источники и объясняет, почему trust material включён в package, но не заменяет условия издателя сертификата или самостоятельную правовую оценку распространителя.

## Основание для включения в package

[Документация T-Invest](https://developer.tbank.ru/invest/intro/developer/network) указывает, что для подключения к API необходимы сертификаты НУЦ Минцифры РФ, и направляет пользователей на страницу сертификатов Госуслуг. Та же документация сообщает, что официальный Python SDK может проверять соединение по сертификату Минцифры, встроенному в библиотеку, без установки сертификата в систему.

Официальный Python SDK действительно содержит [`RussianTrustedRootCA.pem`](https://opensource.tbank.ru/invest/invest-python/-/blob/master/t_tech/invest/certs/RussianTrustedRootCA.pem) и передаёт его в [`grpc.ssl_channel_credentials()`](https://opensource.tbank.ru/invest/invest-python/-/blob/master/t_tech/invest/channels.py). X.509 fingerprint этого сертификата совпадает с fingerprint asset-а SDK.

Проект использует ту же модель поставки trust material: сертификат находится в package, читается локально и применяется только к новому gRPC channel. Во время установки и работы SDK не загружает и не обновляет его через сеть.

## Официальный источник и путь получения

Публичная точка входа источника:

1. [страница сертификатов Госуслуг](https://www.gosuslugi.ru/crt);
2. размещённый на ней [официальный PEM download endpoint](https://gu-st.ru/content/lending/russian_trusted_root_ca_pem.crt).

Текущий asset добавлен в репозиторий 5 августа 2026 года. Чтобы проверить актуальный файл, загрузите его отдельно и исследуйте, не заменяя package asset:

```sh
curl --fail --location --proto '=https' --tlsv1.2 \
  --output russian_trusted_root_ca_pem.crt \
  https://gu-st.ru/content/lending/russian_trusted_root_ca_pem.crt

openssl x509 \
  -in russian_trusted_root_ca_pem.crt \
  -noout -subject -issuer -dates -fingerprint -sha256
```

Переносы строк в текстовом PEM-представлении могут различаться. Сравнивайте декодированный X.509 и его SHA-256 fingerprint, а не checksum текстового файла.

## Идентификаторы сертификата

| Поле | Значение |
| --- | --- |
| Subject | `C=RU, O=The Ministry of Digital Development and Communications, CN=Russian Trusted Root CA` |
| Issuer | совпадает с Subject |
| CA | `true` |
| Valid from | `2022-03-01T21:04:15Z` |
| Valid to | `2032-02-27T21:04:15Z` |
| SHA-256 fingerprint | `D2:6D:2D:02:31:B7:C3:9F:92:CC:73:85:12:BA:54:10:35:19:E4:40:5D:68:B5:BD:70:3E:97:88:CA:8E:CF:31` |

Fingerprint относится к X.509-сертификату. Regression-тест [`src/infrastructure/transport/grpc/tls-root-certificates.test.ts`](https://github.com/woodger/t-invest-node-sdk/blob/main/src/infrastructure/transport/grpc/tls-root-certificates.test.ts) проверяет эти поля и признак CA.

## Границы распространения

Официальный источник публикует сертификат для установки в доверенные хранилища, а поставщик T-Invest API распространяет тот же trust material внутри собственного SDK. На этих фактах основана выбранная package-модель.

В проверенных материалах — на странице Госуслуг, в download endpoint и внутри X.509-сертификата — нет отдельного текста лицензии или явно сформулированных условий повторного распространения. Официальный пример встраивания сам по себе не следует трактовать как отдельную лицензию от имени издателя сертификата.

Поэтому проект:

- сохраняет сертификат как отдельный неизменяемый asset;
- явно указывает его источник и идентификаторы;
- не заявляет права собственности на сертификат;
- не относит сертификат к собственному коду SDK под MIT License;
- обновляет или заменяет trust material только отдельным проверяемым релизом;
- должен учесть новые официальные условия, если издатель опубликует их.

Уведомление о наличии сертификата в package также приведено в [`NOTICE`](../NOTICE).

## Хранение и подключение по умолчанию

В репозитории и установленном package сертификат хранится по пути:

```text
certificates/russian-trusted-root-ca.pem
```

Внутренний модуль [`src/infrastructure/transport/grpc/tls-root-certificates.ts`](https://github.com/woodger/t-invest-node-sdk/blob/main/src/infrastructure/transport/grpc/tls-root-certificates.ts) лениво и синхронно читает файл относительно скомпилированного модуля, а затем кеширует полученный `Buffer` в процессе. При `useSsl: true` transport передаёт его в `ChannelCredentials.createSsl()`.

Bundled CA действует только для channel конкретного SDK instance. SDK не изменяет system trust store, не использует `NODE_EXTRA_CA_CERTS` и не делает скрытых сетевых запросов за trust material.

## Переопределение в коде Consumer-а

Для custom или test endpoint Consumer может передать содержимое собственного PEM root bundle:

```ts
import { readFile } from 'node:fs/promises';
import { TInvestNodeSDK } from '@woodger/t-invest-node-sdk';

const rootCertificates = await readFile('./certificates/custom-root.pem');
const sdk = new TInvestNodeSDK({
  token,
  endpoint,
  tls: {
    rootCertificates
  }
});
```

`tls.rootCertificates` принимает `Buffer`, а не filesystem path. Переданный bundle полностью заменяет встроенный сертификат для этого channel; стандартные roots Node.js автоматически не добавляются. При `useSsl: false` SDK создаёт insecure credentials и не читает встроенный PEM.

## Обновление сертификата

SDK не загружает и не меняет сертификат автоматически. Чтобы обновить его:

1. получить новый файл по опубликованному официальному маршруту;
2. проверить назначение, Subject, Issuer, признак CA, срок действия и согласованный fingerprint;
3. проверить изменение относительно предыдущего X.509-сертификата;
4. одним изменением обновить asset, этот notice и regression-тест;
5. проверить локальный TLS-вызов и наличие asset-а в package archive;
6. выпустить новую версию SDK с описанием изменения trust material.
