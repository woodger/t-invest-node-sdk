# TLS-доверие

> Type: Reference. Документ описывает package-owned trust material,
> per-instance override и границы TLS policy SDK.

## Default для T-Invest

T-Invest API требует сертификаты НУЦ Минцифры РФ для prod и sandbox endpoints.
SDK включает Russian Trusted Root CA как статический PEM asset и при
`useSsl: true` передаёт его в `ChannelCredentials.createSsl()`.

Asset применяется только к gRPC channel конкретного SDK instance:

- system trust store не изменяется;
- `NODE_EXTRA_CA_CERTS` не используется;
- install и runtime не скачивают сертификаты;
- hostname endpoint продолжает проверяться TLS transport-ом;
- сервер T-Invest передаёт промежуточный Russian Trusted Sub CA в своей цепочке.

Официальные endpoints и требование сертификатов описаны в
[документации T-Invest](https://developer.tbank.ru/invest/intro/developer/network).

## Provenance bundled asset

Источник — [страница сертификатов Госуслуг](https://www.gosuslugi.ru/crt).
В package хранится PEM из
[официального download endpoint](https://gu-st.ru/content/lending/russian_trusted_root_ca_pem.crt):
[`certificates/russian-trusted-root-ca.pem`](../certificates/russian-trusted-root-ca.pem).

| Поле | Значение |
| --- | --- |
| Subject | `C=RU, O=The Ministry of Digital Development and Communications, CN=Russian Trusted Root CA` |
| Issuer | совпадает с Subject |
| Valid from | `2022-03-01T21:04:15Z` |
| Valid to | `2032-02-27T21:04:15Z` |
| SHA-256 fingerprint | `D2:6D:2D:02:31:B7:C3:9F:92:CC:73:85:12:BA:54:10:35:19:E4:40:5D:68:B5:BD:70:3E:97:88:CA:8E:CF:31` |

Fingerprint относится к X.509 certificate, а не к текстовому PEM-файлу и его
line endings. Subject, issuer, validity и fingerprint защищены regression-тестом.

## Per-instance override

Custom или test endpoint может передать собственный PEM root bundle:

```ts
import { readFile } from 'node:fs/promises';
import { TinkoffInvestNodeSDK } from 'tinkoff-invest-node-sdk';

const rootCertificates = await readFile('./certificates/custom-root.pem');
const sdk = new TinkoffInvestNodeSDK({
  token,
  endpoint,
  tls: {
    rootCertificates
  }
});
```

SDK принимает содержимое сертификатов, а не filesystem path. Чтение файла,
secret storage и rotation custom CA принадлежат Consumer-у.

Явный `tls.rootCertificates` полностью заменяет bundled Russian Trusted Root CA
для создаваемого channel. Стандартные roots Node.js автоматически не
подмешиваются. При `useSsl: false` создаются insecure credentials, а `tls`
игнорируется.

## Security boundary

Bundled CA решает воспроизводимое TLS-доверие к цепочке T-Invest, но не является
pinning-ом конкретного публичного ключа T-Bank. Владелец доверенного CA способен
выпустить сертификат для другого endpoint, поэтому более строгий SPKI pin, если
он потребуется, должен вводиться отдельной policy с собственной rotation model.

При обновлении CA необходимо:

1. получить сертификат только из официального источника;
2. проверить subject, issuer, validity и согласованный fingerprint;
3. обновить asset и regression-тест одним изменением;
4. проверить TLS-вызов, Git installation и состав package tarball.
