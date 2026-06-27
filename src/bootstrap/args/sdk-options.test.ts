import assert from 'node:assert';
import { describe, test } from 'node:test';
import { resolveSdkOptionsFromCommandOptions } from './sdk-options';

describe('resolveSdkOptionsFromCommandOptions', () => {
  test('maps parsed command options to SDK options', () => {
    const options = resolveSdkOptionsFromCommandOptions(
      {
        token: 'token',
        endpoint: 'localhost:50051',
        'app-name': 'cli-app',
        insecure: true
      },
      {}
    );

    assert.deepEqual(options, {
      token: 'token',
      endpoint: 'localhost:50051',
      appName: 'cli-app',
      useSsl: false
    });
  });

  test('keeps environment fallback for absent command options', () => {
    const options = resolveSdkOptionsFromCommandOptions(
      {},
      {
        TINKOFF_TOKEN: 'env-token',
        TINKOFF_ENDPOINT: 'env.example:443'
      }
    );

    assert.deepEqual(options, {
      token: 'env-token',
      endpoint: 'env.example:443'
    });
  });

  test('throws when required token is missing', () => {
    assert.throws(
      () => resolveSdkOptionsFromCommandOptions(
        { endpoint: 'localhost:50051' },
        {}
      ),
      /Expected '--token' or TINKOFF_TOKEN/
    );
  });
});
