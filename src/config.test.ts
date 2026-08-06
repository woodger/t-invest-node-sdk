import assert from 'node:assert';
import { describe, test } from 'node:test';
import { packageConfig } from './config';

describe('packageConfig', () => {
  test('defines defaults for each SDK instance', () => {
    assert.deepEqual(packageConfig.sdk, {
      useSsl: true,
      trackLimits: true
    });
  });

  test('enables host-local cooperative quota sharing', () => {
    assert.equal(packageConfig.hostLocalQuotaSharing.enabled, true);
  });

  test('sets the gRPC receive message limit to four MiB', () => {
    assert.equal(
      packageConfig.grpc.maxReceiveMessageLength,
      4 * 1024 * 1024
    );
  });
});
