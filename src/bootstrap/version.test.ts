import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { CliArgs } from './cli-contract';
import { appVersion, isVersionRequested, renderVersionInfo } from './version';

function argv(args: Partial<CliArgs>): CliArgs {
  return {
    _: [],
    ...args
  };
}

describe('version', () => {
  test('exposes package version', () => {
    assert.match(appVersion, /^\d+\.\d+\.\d+/);
  });

  test('detects version flag aliases', () => {
    assert.equal(isVersionRequested(argv({ version: true })), true);
    assert.equal(isVersionRequested(argv({ v: true })), true);
    assert.equal(isVersionRequested(argv({ version: false })), false);
  });

  test('renders detailed version info', () => {
    const version = renderVersionInfo();

    assert.match(version, /^tinkoff-invest-node-sdk \d+\.\d+\.\d+/);
    assert.match(version, /node v\d+/);
    assert.match(version, /platform /);
  });
});
