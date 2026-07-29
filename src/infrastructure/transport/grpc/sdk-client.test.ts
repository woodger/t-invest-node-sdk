import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  createServer,
  Metadata
} from 'nice-grpc';
import type {
  CallOptions,
  ServiceDefinition
} from 'nice-grpc';
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
  getPayload(
    request: Record<string, never>,
    options?: CallOptions
  ): Promise<Uint8Array>;
}

describe('createSdkClient', () => {
  test('merges SDK-owned and per-call metadata before throttled calls', async () => {
    const server = createServer();
    let receivedAuthorization: string | undefined;
    let receivedAppName: string | undefined;
    let receivedRequestId: string | undefined;

    server.add(payloadServiceDefinition, {
      async getPayload(request, context) {
        void request;

        receivedAuthorization = context.metadata.get('Authorization');
        receivedAppName = context.metadata.get('x-app-name');
        receivedRequestId = context.metadata.get('x-request-id');

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
        Authorization: 'Bearer token',
        'x-app-name': 'sdk-app'
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
      const response = await client.getPayload({}, {
        metadata: new Metadata({
          Authorization: 'Bearer per-call-token',
          'x-app-name': 'per-call-app',
          'x-request-id': 'request-id'
        })
      });

      assert.deepEqual([...response], [...payload]);
      assert.equal(receivedAuthorization, 'Bearer token');
      assert.equal(receivedAppName, 'sdk-app');
      assert.equal(receivedRequestId, 'request-id');
      assert.equal(throttledRule?.limitPerMinute, 60);
    }
    finally {
      channel.close();
      await server.shutdown();
    }
  });
});
