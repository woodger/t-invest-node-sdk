import assert from 'node:assert';
import { describe, test } from 'node:test';
import packageJson from '../../../package.json';
import { isVersionRequested, renderVersionInfo } from './version';

describe('version', () => {
  test('detects the canonical version flag', () => {
    assert.equal(isVersionRequested({ version: true }), true);
    assert.equal(isVersionRequested({ version: false }), false);
  });

  test('renders the package version as one line', () => {
    assert.equal(
      renderVersionInfo(),
      `t-invest-node-sdk ${packageJson.version}\n`
    );
  });
});
