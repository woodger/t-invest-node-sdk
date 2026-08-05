import assert from 'node:assert';
import { X509Certificate } from 'node:crypto';
import { describe, test } from 'node:test';
import { loadBundledTlsRootCertificates } from './tls-root-certificates';

const russianTrustedRootDistinguishedName = [
  'C=RU',
  'O=The Ministry of Digital Development and Communications',
  'CN=Russian Trusted Root CA'
].join('\n');

describe('loadBundledTlsRootCertificates', () => {
  test('loads the expected Russian Trusted Root CA', () => {
    const certificate = new X509Certificate(
      loadBundledTlsRootCertificates()
    );

    assert.equal(certificate.subject, russianTrustedRootDistinguishedName);
    assert.equal(certificate.issuer, russianTrustedRootDistinguishedName);
    assert.equal(certificate.validFrom, 'Mar  1 21:04:15 2022 GMT');
    assert.equal(certificate.validTo, 'Feb 27 21:04:15 2032 GMT');
    assert.equal(
      certificate.fingerprint256,
      'D2:6D:2D:02:31:B7:C3:9F:92:CC:73:85:12:BA:54:10:35:19:E4:40:5D:68:B5:BD:70:3E:97:88:CA:8E:CF:31'
    );
    assert.equal(certificate.ca, true);
  });
});
