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
        T_INVEST_TOKEN: 'env-token',
        T_INVEST_ENDPOINT: 'env.example:443'
      }
    );

    assert.deepEqual(options, {
      token: 'env-token',
      endpoint: 'env.example:443'
    });
  });

  test('does not read the former environment names', () => {
    assert.throws(
      () => resolveSdkOptionsFromCommandOptions(
        {},
        {
          TINKOFF_TOKEN: 'env-token',
          TINKOFF_ENDPOINT: 'env.example:443'
        }
      ),
      /Expected '--token' or T_INVEST_TOKEN/
    );
  });

  test('throws when required token is missing', () => {
    assert.throws(
      () => resolveSdkOptionsFromCommandOptions(
        { endpoint: 'localhost:50051' },
        {}
      ),
      /Expected '--token' or T_INVEST_TOKEN/
    );
  });

  test('rejects blank command values instead of using environment fallbacks', () => {
    for (const [options, message] of [
      [
        {
          token: ' ',
          endpoint: 'localhost:50051'
        },
        /Expected '--token' or T_INVEST_TOKEN/
      ],
      [
        {
          token: 'token',
          endpoint: ''
        },
        /Expected '--endpoint' or T_INVEST_ENDPOINT/
      ]
    ] as const) {
      assert.throws(
        () => resolveSdkOptionsFromCommandOptions(
          options,
          {
            T_INVEST_TOKEN: 'env-token',
            T_INVEST_ENDPOINT: 'env.example:443'
          }
        ),
        message
      );
    }
  });
});
