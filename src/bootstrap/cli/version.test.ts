import assert from 'node:assert';
import { describe, test } from 'node:test';
import { appVersion, isVersionRequested, renderVersionInfo } from './version';

describe('version', () => {
  test('exposes package version', () => {
    assert.match(appVersion, /^\d+\.\d+\.\d+/);
  });

  test('detects the canonical version flag', () => {
    assert.equal(isVersionRequested({ version: true }), true);
    assert.equal(isVersionRequested({ version: false }), false);
  });

  test('renders the package version as one line', () => {
    assert.equal(
      renderVersionInfo(),
      `tinkoff-invest-node-sdk ${appVersion}\n`
    );
  });
});
