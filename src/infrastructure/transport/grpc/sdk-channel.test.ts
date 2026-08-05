import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import {
  createSecureServer,
  type ServerHttp2Stream
} from 'node:http2';
import { resolve } from 'node:path';
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
const tlsFixturesDirectory = resolve(
  __dirname,
  '../../../../src/infrastructure/transport/grpc/test-fixtures'
);

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
  test('creates TLS credentials from bundled root certificates', () => {
    const channel = createSdkChannel({
      token: 'token',
      endpoint: 'localhost:443',
      useSsl: true
    }, twoMiB);

    channel.close();
  });

  test('rejects a custom TLS endpoint with the bundled trust policy', async () => {
    const server = createPayloadTlsServer();
    const port = await listen(server);
    const channel = createSdkChannel({
      token: 'token',
      endpoint: `localhost:${port}`,
      useSsl: true
    }, twoMiB);

    try {
      const client = createClient(payloadServiceDefinition, channel);

      await assert.rejects(
        client.getPayload({}),
        (error: unknown) => error instanceof ClientError
          && error.code === Status.UNAVAILABLE
      );
    }
    finally {
      channel.close();
      await close(server);
    }
  });

  test('uses a per-instance root certificate for a TLS call', async () => {
    const server = createPayloadTlsServer();
    const port = await listen(server);
    let channel: ReturnType<typeof createSdkChannel> | undefined;

    try {
      channel = createSdkChannel({
        token: 'token',
        endpoint: `localhost:${port}`,
        useSsl: true,
        tls: {
          rootCertificates: readTlsFixture('tls-root.cert.pem')
        }
      }, twoMiB);

      const client = createClient(payloadServiceDefinition, channel);
      const response = await client.getPayload({});

      assert.deepEqual(response, new Uint8Array([1, 2, 3]));
    }
    finally {
      channel?.close();
      await close(server);
    }
  });

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

function readTlsFixture(name: string): Buffer {
  return readFileSync(resolve(tlsFixturesDirectory, name));
}

function createPayloadTlsServer() {
  const server = createSecureServer({
    cert: readTlsFixture('tls-server.cert.pem'),
    key: readTlsFixture('tls-server.key.pem')
  });

  server.on('stream', (stream: ServerHttp2Stream) => {
    stream.resume();
    stream.once('end', () => {
      const message = new Uint8Array([1, 2, 3]);
      const frame = Buffer.alloc(5 + message.byteLength);

      frame.writeUInt32BE(message.byteLength, 1);
      frame.set(message, 5);
      stream.respond({
        ':status': 200,
        'content-type': 'application/grpc+proto'
      }, {
        waitForTrailers: true
      });
      stream.once('wantTrailers', () => {
        stream.sendTrailers({
          'grpc-status': '0'
        });
      });
      stream.end(frame);
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
    server.listen(0, 'localhost', () => {
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
