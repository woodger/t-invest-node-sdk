import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { CliArgs } from '../cli-contract';
import {
  resolveSdkOptions,
  resolveSdkOptionsFromCommandOptions,
  sdkOptionArgNames
} from './sdk-options';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: [],
    ...args
  };
}

describe('resolveSdkOptions', () => {
  test('prefers explicit CLI values over environment values', () => {
    const options = resolveSdkOptions(
      argv({
        token: 'cli-token',
        endpoint: 'cli.example:443',
        'app-name': 'cli-app'
      }),
      {
        TINKOFF_TOKEN: 'env-token',
        TINKOFF_ENDPOINT: 'env.example:443'
      }
    );

    assert.deepEqual(options, {
      token: 'cli-token',
      endpoint: 'cli.example:443',
      appName: 'cli-app'
    });
  });

  test('falls back to environment token and endpoint', () => {
    const options = resolveSdkOptions(
      argv(),
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

  test('maps insecure flag to disabled ssl', () => {
    const options = resolveSdkOptions(
      argv({
        token: 'token',
        endpoint: 'localhost:50051',
        insecure: true
      }),
      {}
    );

    assert.equal(options.useSsl, false);
  });

  test('throws when required token is missing', () => {
    assert.throws(
      () => resolveSdkOptions(
        argv({ endpoint: 'localhost:50051' }),
        {}
      ),
      /Expected '--token' or TINKOFF_TOKEN/
    );
  });

  test('rejects boolean flag form for value options', () => {
    assert.throws(
      () => resolveSdkOptions(
        argv({
          token: true,
          endpoint: 'localhost:50051'
        }),
        {}
      ),
      /Expected '--token' as string/
    );
  });
});

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
});

describe('sdkOptionArgNames', () => {
  test('lists shared SDK option names for command-level known-arg checks', () => {
    assert.equal(sdkOptionArgNames.has('token'), true);
    assert.equal(sdkOptionArgNames.has('endpoint'), true);
    assert.equal(sdkOptionArgNames.has('app-name'), true);
    assert.equal(sdkOptionArgNames.has('insecure'), true);
  });
});
