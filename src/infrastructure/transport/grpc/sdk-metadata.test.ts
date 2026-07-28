import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { createSdkMetadata } from './sdk-metadata';

describe('createSdkMetadata', () => {
  test('adds authorization header', () => {
    const metadata = createSdkMetadata({
      token: 'token',
      endpoint: 'localhost:50051'
    });

    assert.equal(metadata.get('Authorization'), 'Bearer token');
    assert.equal(metadata.get('x-app-name'), undefined);
  });

  test('adds x-app-name when it is provided', () => {
    const metadata = createSdkMetadata({
      token: 'token',
      endpoint: 'localhost:50051',
      appName: 'sdk-app'
    });

    assert.equal(metadata.get('x-app-name'), 'sdk-app');
  });
});
