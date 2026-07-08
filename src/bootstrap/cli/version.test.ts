import assert from 'node:assert';
import { describe, test } from 'node:test';
import { appVersion, isVersionRequested, renderVersionInfo } from './version';

describe('version', () => {
  test('exposes package version', () => {
    assert.match(appVersion, /^\d+\.\d+\.\d+/);
  });

  test('detects version flag aliases', () => {
    assert.equal(isVersionRequested({ version: true }), true);
    assert.equal(isVersionRequested({ v: true }), true);
    assert.equal(isVersionRequested({ version: false }), false);
  });

  test('renders detailed version info', () => {
    const version = renderVersionInfo();

    assert.match(version, /^tinkoff-invest-node-sdk \d+\.\d+\.\d+/);
    assert.match(version, /node v\d+/);
    assert.match(version, /platform /);
  });
});
