import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  createServer,
  Metadata
} from 'nice-grpc';
import type { ServiceDefinition } from 'nice-grpc';
import type { ThrottleRule } from '../../../application/services/unary-throttle.service';
import { Throttle } from '../../../application/services/unary-throttle.service';
import { createSdkChannel } from './sdk-channel';
import { createSdkClient } from './sdk-client';
import { UnaryLimitResolver } from './unary-limit-resolver';

const payload = new Uint8Array([1, 2, 3]);

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

interface PayloadServiceClient {
  getPayload(request: Record<string, never>): Promise<Uint8Array>;
}

describe('createSdkClient', () => {
  test('wires shared metadata and throttling into typed client calls', async () => {
    const server = createServer();
    let receivedAuthorization: string | undefined;

    server.add(payloadServiceDefinition, {
      async getPayload(request, context) {
        void request;

        receivedAuthorization = context.metadata.get('Authorization');

        return payload;
      }
    });

    const port = await server.listen('127.0.0.1:0');
    const channel = createSdkChannel({
      token: 'token',
      endpoint: `127.0.0.1:${port}`,
      useSsl: false
    }, 4 * 1024 * 1024);
    const throttle = new Throttle();
    let throttledRule: ThrottleRule | undefined;

    throttle.reduce = async (rule) => {
      throttledRule = rule;
    };

    const lifecycleController = new AbortController();
    const client = createSdkClient<PayloadServiceClient>(
      payloadServiceDefinition,
      channel,
      new Metadata({
        Authorization: 'Bearer token'
      }),
      true,
      new UnaryLimitResolver({
        PayloadService: 60
      }),
      throttle,
      {
        signal: lifecycleController.signal,
        assertOpen() {}
      }
    );

    try {
      const response = await client.getPayload({});

      assert.deepEqual([...response], [...payload]);
      assert.equal(receivedAuthorization, 'Bearer token');
      assert.equal(throttledRule?.limitPerMinute, 60);
    }
    finally {
      channel.close();
      await server.shutdown();
    }
  });
});
