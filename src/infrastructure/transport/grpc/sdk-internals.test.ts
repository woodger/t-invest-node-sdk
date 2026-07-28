import assert from 'node:assert';
import { describe, test } from 'node:test';
import { Throttle } from '../../../application/services/unary-throttle.service';
import { packageConfig } from '../../../config';
import { UsersServiceDefinition } from '../../../generated/users';
import {
  createSdkChannel,
  createSdkClient,
  createSdkMetadata,
  UnaryLimitResolver
} from './index';

describe('infrastructure transport grpc', () => {
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

      assert.equal(metadata.get('Authorization'), 'Bearer token');
      assert.equal(metadata.get('x-app-name'), 'sdk-app');
    });
  });

  describe('createSdkChannel', () => {
    test('creates a channel object for the configured endpoint', () => {
      const channel = createSdkChannel({
        token: 'token',
        endpoint: 'localhost:50051',
        useSsl: false
      }, packageConfig.grpc.maxReceiveMessageLength);

      assert.ok(channel);
      assert.equal(typeof channel.close, 'function');
    });
  });

  describe('createSdkClient', () => {
    test('creates a typed client for the service definition', () => {
      const channel = createSdkChannel({
        token: 'token',
        endpoint: 'localhost:50051',
        useSsl: false
      }, packageConfig.grpc.maxReceiveMessageLength);
      const metadata = createSdkMetadata({
        token: 'token',
        endpoint: 'localhost:50051'
      });
      const resolver = new UnaryLimitResolver({ UsersService: 100 });
      const throttle = new Throttle();
      const lifecycleController = new AbortController();
      const client = createSdkClient<{ getAccounts: unknown }>(
        UsersServiceDefinition,
        channel,
        metadata,
        true,
        resolver,
        throttle,
        {
          signal: lifecycleController.signal,
          assertOpen() {}
        }
      );

      assert.equal(typeof client.getAccounts, 'function');
    });
  });
});
