# Встроенный Russian Trusted Root CA

> Type: Notice. Документ фиксирует происхождение, границы распространения и
> техническое подключение корневого сертификата, включённого в package SDK.

## Назначение документа

SDK содержит публичный корневой X.509-сертификат Russian Trusted Root CA,
необходимый для проверки TLS-цепочки T-Invest API. В package не входит
соответствующий приватный ключ.

Сертификат не является исходным кодом, созданным авторами SDK. Проект не
заявляет авторство сертификата и не представляет MIT License из корневого
[`LICENSE`](../LICENSE) как отдельное лицензионное разрешение на сертификат.
Этот документ фиксирует доступные официальные источники и принятое проектом
основание для включения trust material, но не заменяет условия, установленные
его издателем, или индивидуальную правовую оценку распространителя.

## Основание для включения в package

[Документация T-Invest](https://developer.tbank.ru/invest/intro/developer/network)
указывает, что для подключения к API необходимы сертификаты НУЦ Минцифры РФ,
и направляет пользователей на страницу сертификатов Госуслуг. Та же
документация сообщает, что официальный Python SDK может проверять соединение
по сертификату Минцифры, встроенному в библиотеку, без установки сертификата в
систему.

Официальный Python SDK действительно содержит
[`RussianTrustedRootCA.pem`](https://opensource.tbank.ru/invest/invest-python/-/blob/master/t_tech/invest/certs/RussianTrustedRootCA.pem)
и передаёт его в
[`grpc.ssl_channel_credentials()`](https://opensource.tbank.ru/invest/invest-python/-/blob/master/t_tech/invest/channels.py).
X.509 fingerprint этого сертификата совпадает с fingerprint asset-а SDK.

Проект следует той же модели поставки trust material: сертификат находится в
package, читается локально и применяется только к создаваемому gRPC channel.
Install и runtime не загружают и не обновляют его через сеть.

## Официальный источник и путь получения

Публичная точка входа источника:

1. [страница сертификатов Госуслуг](https://www.gosuslugi.ru/crt);
2. размещённый на ней
   [официальный PEM download endpoint](https://gu-st.ru/content/lending/russian_trusted_root_ca_pem.crt).

Текущий asset был добавлен в репозиторий 5 августа 2026 года. Для проверки
актуального файла источник можно загрузить отдельно и исследовать без замены
package asset-а:

```sh
curl --fail --location --proto '=https' --tlsv1.2 \
  --output russian_trusted_root_ca_pem.crt \
  https://gu-st.ru/content/lending/russian_trusted_root_ca_pem.crt

openssl x509 \
  -in russian_trusted_root_ca_pem.crt \
  -noout -subject -issuer -dates -fingerprint -sha256
```

Текстовое PEM-представление может отличаться переносами строк. Идентичность
сертификата проверяется по декодированному X.509 и его SHA-256 fingerprint, а
не по checksum текстового файла.

## Идентификаторы сертификата

| Поле | Значение |
| --- | --- |
| Subject | `C=RU, O=The Ministry of Digital Development and Communications, CN=Russian Trusted Root CA` |
| Issuer | совпадает с Subject |
| CA | `true` |
| Valid from | `2022-03-01T21:04:15Z` |
| Valid to | `2032-02-27T21:04:15Z` |
| SHA-256 fingerprint | `D2:6D:2D:02:31:B7:C3:9F:92:CC:73:85:12:BA:54:10:35:19:E4:40:5D:68:B5:BD:70:3E:97:88:CA:8E:CF:31` |

Fingerprint относится к X.509-сертификату. Эти поля и признак CA проверяет
regression-тест
[`src/infrastructure/transport/grpc/tls-root-certificates.test.ts`](https://github.com/woodger/t-invest-node-sdk/blob/main/src/infrastructure/transport/grpc/tls-root-certificates.test.ts).

## Границы распространения

Сертификат опубликован официальным источником для установки в доверенные
хранилища, а официальный поставщик T-Invest API распространяет тот же trust
material внутри собственного SDK. Это является фактическим основанием
выбранной package-модели.

При этом в проверенных материалах — на странице Госуслуг, в download endpoint
и внутри самого X.509-сертификата — не обнаружено отдельного текста лицензии
или явно сформулированных условий повторного распространения. Сам по себе
официальный пример встраивания не следует трактовать как отдельную лицензию от
имени издателя сертификата.

Поэтому проект:

- сохраняет сертификат как отдельный неизменяемый asset;
- явно указывает его источник и идентификаторы;
- не заявляет права собственности на сертификат;
- не относит сертификат к собственному коду SDK под MIT License;
- обновляет или заменяет trust material только отдельным проверяемым релизом;
- должен учесть новые официальные условия, если издатель опубликует их.

Уведомление о наличии сертификата в package также приведено в
[`THIRD_PARTY_NOTICES.md`](../THIRD_PARTY_NOTICES.md).

## Хранение и подключение по умолчанию

В репозитории и установленном package сертификат хранится по пути:

```text
certificates/russian-trusted-root-ca.pem
```

Внутренний модуль
[`src/infrastructure/transport/grpc/tls-root-certificates.ts`](https://github.com/woodger/t-invest-node-sdk/blob/main/src/infrastructure/transport/grpc/tls-root-certificates.ts)
лениво и синхронно читает этот файл относительно скомпилированного модуля и
кеширует полученный `Buffer` в пределах процесса. При `useSsl: true` transport
передаёт его в `ChannelCredentials.createSsl()`.

Bundled CA применяется только к channel конкретного SDK instance. SDK не
изменяет system trust store, не использует `NODE_EXTRA_CA_CERTS` и не выполняет
скрытых сетевых запросов для получения trust material.

## Переопределение в коде Consumer-а

Для custom или test endpoint Consumer может передать содержимое собственного
PEM root bundle:

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

`tls.rootCertificates` принимает `Buffer`, а не filesystem path. Переданный
bundle полностью заменяет встроенный сертификат для этого channel; стандартные
roots Node.js автоматически не добавляются. При `useSsl: false` SDK создаёт
insecure credentials и не читает встроенный PEM.

## Обновление сертификата

Автоматическая загрузка или rotation сертификата не является контрактом SDK.
Для обновления необходимо:

1. получить новый файл по опубликованному официальному маршруту;
2. проверить назначение, Subject, Issuer, признак CA, срок действия и
   согласованный fingerprint;
3. проверить изменение относительно предыдущего X.509-сертификата;
4. одним изменением обновить asset, этот notice и regression-тест;
5. проверить локальный TLS-вызов и наличие asset-а в package archive;
6. выпустить новую версию SDK с описанием изменения trust material.
