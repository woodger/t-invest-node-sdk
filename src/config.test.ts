import { strict as assert } from 'node:assert';
import { describe, test } from 'node:test';
import { packageConfig } from './config';

describe('packageConfig', () => {
  test('defines defaults for each SDK instance', () => {
    assert.deepEqual(packageConfig.sdk, {
      useSsl: true
    });
  });

  test('sets the gRPC receive message limit to four MiB', () => {
    assert.equal(packageConfig.grpc.maxReceiveMessageLength, 4_194_304);
  });
});
