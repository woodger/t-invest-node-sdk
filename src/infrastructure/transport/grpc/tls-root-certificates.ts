/**
 * Модуль trust material загружает корневой сертификат из package asset.
 *
 * Здесь допустимы:
 * - разрешение стабильного пути от compiled module к package root;
 * - ленивое кешированное чтение bundled PEM;
 *
 * Здесь не должно быть сетевой загрузки или изменения system trust store.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const bundledTlsRootCertificatesPath = resolve(
  __dirname,
  '../../../../certificates/russian-trusted-root-ca.pem'
);

let bundledTlsRootCertificates: Buffer | undefined;

export function loadBundledTlsRootCertificates(): Buffer {
  bundledTlsRootCertificates ??= readFileSync(
    bundledTlsRootCertificatesPath
  );

  return bundledTlsRootCertificates;
}
