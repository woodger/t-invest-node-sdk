import assert from 'node:assert';
import { describe, test } from 'node:test';
import {
  ClientError,
  createClient,
  createServer,
  Status
} from 'nice-grpc';
import type { ServiceDefinition } from 'nice-grpc';
import { createSdkChannel } from './sdk-channel';

const oneMiB = 1024 * 1024;
const twoMiB = 2 * 1024 * 1024;

const payloadServiceDefinition = {
  getPayload: {
    path: '/test.PayloadService/GetPayload',
    requestStream: false,
    responseStream: false,
    requestSerialize: () => new Uint8Array(),
    requestDeserialize: () => ({}),
    responseSerialize: (value: Uint8Array) => value,
    responseDeserialize: (value: Uint8Array) => value,
    options: {}
  }
} as const satisfies ServiceDefinition;

describe('createSdkChannel', () => {
  test('enforces the configured receive message limit', async () => {
    const server = createServer();

    server.add(payloadServiceDefinition, {
      async getPayload() {
        return new Uint8Array(twoMiB);
      }
    });

    const port = await server.listen('127.0.0.1:0');
    const channel = createSdkChannel({
      token: 'token',
      endpoint: `127.0.0.1:${port}`,
      useSsl: false
    }, oneMiB);

    try {
      const client = createClient(payloadServiceDefinition, channel);

      await assert.rejects(
        client.getPayload({}),
        (error: unknown) => error instanceof ClientError
          && error.code === Status.RESOURCE_EXHAUSTED
      );
    }
    finally {
      channel.close();
      await server.shutdown();
    }
  });
});
