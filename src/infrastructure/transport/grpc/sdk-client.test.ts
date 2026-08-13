import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  createSecureServer,
  type ServerHttp2Stream
} from 'node:http2';
import { resolve } from 'node:path';
import { describe, test } from 'node:test';
import {
  ChannelCredentials,
  ClientError,
  createChannel,
  createServer,
  Metadata,
  ServerError,
  Status
} from 'nice-grpc';
import type {
  CallOptions,
  Channel,
  ServiceDefinition
} from 'nice-grpc';
import {
  isSdkError,
  SdkErrorCode
} from '../../../application/errors/sdk-error';
import type { ThrottleRule } from '../../../application/services/unary-throttle.service';
import { Throttle } from '../../../application/services/unary-throttle.service';
import { createSdkChannel } from './sdk-channel';
import { createSdkClient } from './sdk-client';
import { loadBundledTlsRootCertificates } from './tls-root-certificates';
import { UnaryLimitResolver } from './unary-limit-resolver';

const payload = new Uint8Array([1, 2, 3]);
const payloadPath = '/test.PayloadService/GetPayload';
const requestSerializationPath =
  '/test.RequestSerializationService/GetPayload';
const oneMiB = 1024 * 1024;
const twoMiB = 2 * oneMiB;
const maxReceiveMessageLength = 4 * 1024 * 1024;
const tlsFixturesDirectory = resolve(
  __dirname,
  '../../../../src/infrastructure/transport/grpc/test-fixtures'
);

const payloadServiceDefinition = {
  getPayload: {
    path: payloadPath,
    requestStream: false,
    responseStream: false,
    requestSerialize: () => new Uint8Array(),
    requestDeserialize: () => ({}),
    responseSerialize: (value: Uint8Array) => value,
    responseDeserialize: (value: Uint8Array) => value,
    options: {}
  }
} as const satisfies ServiceDefinition;

const requestSerializationServiceDefinition = {
  getPayload: {
    ...payloadServiceDefinition.getPayload,
    path: requestSerializationPath,
    requestSerialize() {
      throw new Error('invalid test request');
    }
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
        useSsl: false,
        maxReceiveMessageLength,
        signal: lifecycleController.signal,
        // This metadata scenario does not exercise lifecycle rejection.
        // oxlint-disable-next-line no-empty-function
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

  test('rejects a unary call when the header callback throws', async () => {
    const server = createServer();
    const callbackError = new Error('header callback failed');

    server.add(payloadServiceDefinition, {
      async getPayload(_request, context) {
        context.header.set('x-response-id', 'response-id');

        return payload;
      }
    });

    const port = await server.listen('127.0.0.1:0');
    const channel = createSdkChannel({
      token: 'token',
      endpoint: `127.0.0.1:${port}`,
      useSsl: false
    }, maxReceiveMessageLength);
    const client = createPayloadClient(channel, false);

    try {
      await assert.rejects(
        client.getPayload({}, {
          onHeader() {
            throw callbackError;
          }
        }),
        (error: unknown) => error === callbackError
      );
    }
    finally {
      channel.close();
      await server.shutdown();
    }
  });

  test('rejects a unary call when the trailer callback throws', async () => {
    const server = createServer();
    const callbackError = new Error('trailer callback failed');

    server.add(payloadServiceDefinition, {
      async getPayload(_request, context) {
        context.trailer.set('x-response-id', 'response-id');

        return payload;
      }
    });

    const port = await server.listen('127.0.0.1:0');
    const channel = createSdkChannel({
      token: 'token',
      endpoint: `127.0.0.1:${port}`,
      useSsl: false
    }, maxReceiveMessageLength);
    const client = createPayloadClient(channel, false);

    try {
      await assert.rejects(
        client.getPayload({}, {
          onTrailer() {
            throw callbackError;
          }
        }),
        (error: unknown) => error === callbackError
      );
    }
    finally {
      channel.close();
      await server.shutdown();
    }
  });

  test('maps a request serialization failure to the SDK source', async () => {
    const server = createServer();
    let handlerCalls = 0;

    server.add(requestSerializationServiceDefinition, {
      async getPayload() {
        handlerCalls += 1;

        return payload;
      }
    });

    const port = await server.listen('127.0.0.1:0');
    const channel = createSdkChannel({
      token: 'token',
      endpoint: `127.0.0.1:${port}`,
      useSsl: false
    }, maxReceiveMessageLength);
    const client = createPayloadClient(
      channel,
      false,
      maxReceiveMessageLength,
      requestSerializationServiceDefinition
    );

    try {
      await assert.rejects(
        client.getPayload({}),
        (error: unknown) => isSdkError(error, SdkErrorCode.Internal)
          && error.source === 'sdk'
          && error.path === requestSerializationPath
          && error.details?.startsWith(
            'Request message serialization failure:'
          ) === true
          && error.cause instanceof ClientError
      );
      assert.equal(handlerCalls, 0);
    }
    finally {
      channel.close();
      await server.shutdown();
    }
  });

  test('maps a local receive message limit failure to the SDK source', async () => {
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
    const client = createPayloadClient(channel, false, oneMiB);

    try {
      await assert.rejects(
        client.getPayload({}),
        (error: unknown) => {
          if (
            !isSdkError(error, SdkErrorCode.ResourceExhausted)
            || !(error.cause instanceof ClientError)
          ) {
            return false;
          }

          return error.source === 'sdk'
            && error.path === payloadPath
            && error.details === error.cause.details;
        }
      );
    }
    finally {
      channel.close();
      await server.shutdown();
    }
  });

  test('keeps provider quota exhaustion in the gRPC source', async () => {
    const server = createServer();

    server.add(payloadServiceDefinition, {
      async getPayload() {
        throw new ServerError(
          Status.RESOURCE_EXHAUSTED,
          'provider quota exhausted'
        );
      }
    });

    const port = await server.listen('127.0.0.1:0');
    const channel = createSdkChannel({
      token: 'token',
      endpoint: `127.0.0.1:${port}`,
      useSsl: false
    }, oneMiB);
    const client = createPayloadClient(channel, false, oneMiB);

    try {
      await assert.rejects(
        client.getPayload({}),
        (error: unknown) => {
          if (
            !isSdkError(error, SdkErrorCode.ResourceExhausted)
            || !(error.cause instanceof ClientError)
          ) {
            return false;
          }

          return error.source === 'grpc'
            && error.path === payloadPath
            && error.details === 'provider quota exhausted'
            && error.details === error.cause.details;
        }
      );
    }
    finally {
      channel.close();
      await server.shutdown();
    }
  });

  test('maps an unknown certificate authority to the TLS source', async () => {
    const server = createPayloadTlsServer();
    const port = await listen(server);
    const channel = createChannel(
      `localhost:${port}`,
      ChannelCredentials.createSsl(loadBundledTlsRootCertificates()),
      {
        'grpc.ssl_target_name_override': 'localhost'
      }
    );
    const client = createPayloadClient(channel, true);

    try {
      await assert.rejects(
        client.getPayload({}),
        (error: unknown) => {
          if (
            !isSdkError(error, SdkErrorCode.Unavailable)
            || !(error.cause instanceof ClientError)
          ) {
            return false;
          }

          return error.source === 'tls'
            && error.path === payloadPath
            && error.details === error.cause.details;
        }
      );
    }
    finally {
      channel.close();
      await close(server);
    }
  });

  test('maps a certificate hostname mismatch to the TLS source', async () => {
    const server = createPayloadTlsServer();
    const port = await listen(server);
    const channel = createChannel(
      `localhost:${port}`,
      ChannelCredentials.createSsl(readTlsFixture('tls-root.cert.pem')),
      {
        'grpc.ssl_target_name_override': 'unexpected.test'
      }
    );
    const client = createPayloadClient(channel, true);

    try {
      await assert.rejects(
        client.getPayload({}),
        (error: unknown) => isSdkError(error, SdkErrorCode.Unavailable)
          && error.source === 'tls'
          && error.path === payloadPath
      );
    }
    finally {
      channel.close();
      await close(server);
    }
  });

  test('keeps a provider UNAVAILABLE response in the gRPC source', async () => {
    const server = createPayloadTlsServer(
      Status.UNAVAILABLE,
      'temporarily unavailable'
    );
    const port = await listen(server);
    const channel = createSdkChannel({
      token: 'token',
      endpoint: `localhost:${port}`,
      useSsl: true,
      tls: {
        rootCertificates: readTlsFixture('tls-root.cert.pem')
      }
    }, maxReceiveMessageLength);
    const client = createPayloadClient(channel, true);

    try {
      await assert.rejects(
        client.getPayload({}),
        (error: unknown) => isSdkError(error, SdkErrorCode.Unavailable)
          && error.source === 'grpc'
          && error.path === payloadPath
          && error.details === 'temporarily unavailable'
      );
    }
    finally {
      channel.close();
      await close(server);
    }
  });
});

function createPayloadClient(
  channel: Channel,
  useSsl: boolean,
  receiveMessageLength: number = maxReceiveMessageLength,
  service: ServiceDefinition = payloadServiceDefinition
): PayloadServiceClient {
  const signal = new AbortController().signal;

  return createSdkClient<PayloadServiceClient>(
    service,
    channel,
    new Metadata(),
    false,
    new UnaryLimitResolver({}),
    new Throttle(),
    {
      useSsl,
      maxReceiveMessageLength: receiveMessageLength,
      signal,
      assertOpen() {
        if (signal.aborted) {
          throw signal.reason;
        }
      }
    }
  );
}

function readTlsFixture(name: string): Buffer {
  return readFileSync(resolve(tlsFixturesDirectory, name));
}

function createPayloadTlsServer(
  grpcStatus: Status = Status.OK,
  grpcDetails?: string
) {
  const server = createSecureServer({
    cert: readTlsFixture('tls-server.cert.pem'),
    key: readTlsFixture('tls-server.key.pem')
  });

  server.on('stream', (stream: ServerHttp2Stream) => {
    stream.resume();
    stream.once('end', () => {
      const frame = Buffer.alloc(5 + payload.byteLength);

      frame.writeUInt32BE(payload.byteLength, 1);
      frame.set(payload, 5);
      stream.respond({
        ':status': 200,
        'content-type': 'application/grpc+proto'
      }, {
        waitForTrailers: true
      });
      stream.once('wantTrailers', () => {
        stream.sendTrailers({
          'grpc-status': String(grpcStatus),
          ...(grpcDetails === undefined
            ? {}
            : { 'grpc-message': grpcDetails })
        });
      });
      stream.end(grpcStatus === Status.OK ? frame : undefined);
    });
  });

  return server;
}

async function listen(
  server: ReturnType<typeof createPayloadTlsServer>
): Promise<number> {
  await new Promise<void>((resolvePromise, reject) => {
    const rejectOnError = (error: Error) => {
      reject(error);
    };

    server.once('error', rejectOnError);
    server.listen(0, '127.0.0.1', () => {
      server.off('error', rejectOnError);
      resolvePromise();
    });
  });

  const address = server.address();

  if (address === null || typeof address === 'string') {
    throw new Error('Expected local TLS server address');
  }

  return address.port;
}

async function close(
  server: ReturnType<typeof createPayloadTlsServer>
): Promise<void> {
  await new Promise<void>((resolvePromise, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolvePromise();
    });
  });
}
