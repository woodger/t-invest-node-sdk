/**
 * Модуль тестов package entrypoint проверяет публичную runtime export surface.
 *
 * Тесты смотрят на observable exports корневого модуля и не зависят от
 * внутренних bootstrap или generated implementation details.
 */

import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import * as packageExports from './index';

describe('package entrypoint', () => {
  test('does not expose generated service runtime contracts', () => {
    assert.equal(hasPackageExport('UsersServiceDefinition'), false);
    assert.equal(hasPackageExport('UsersServiceClient'), false);
    assert.equal(hasPackageExport('UsersServiceImplementation'), false);
    assert.equal(hasPackageExport('MarketDataStreamServiceDefinition'), false);
  });

  test('keeps public SDK runtime exports', () => {
    assert.equal(hasPackageExport('TinkoffInvestNodeSDK'), true);
    assert.equal(hasPackageExport('CandleInterval'), true);
    assert.equal(hasPackageExport('defaultConfig'), true);
  });
});

function hasPackageExport(name: string): boolean {
  return Object.prototype.hasOwnProperty.call(packageExports, name);
}
