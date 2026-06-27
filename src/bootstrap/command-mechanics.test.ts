import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { CliArgs } from './cli-contract';
import {
  parseCommaSeparatedStringListOption,
  parseCommandOptions,
  withSdkOptions
} from './command-mechanics';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['users get-accounts'],
    ...args
  };
}

describe('command mechanics', () => {
  describe('withSdkOptions', () => {
    test('allows common SDK options with command-specific options', () => {
      const options = parseCommandOptions(
        argv({
          token: 'token',
          endpoint: 'localhost:50051',
          format: 'json'
        }),
        'users get-accounts',
        withSdkOptions({
          format: {
            type: 'string',
            choices: ['json', 'table'],
            default: 'table'
          }
        } as const)
      );

      assert.deepEqual(options, {
        token: 'token',
        endpoint: 'localhost:50051',
        'app-name': undefined,
        insecure: undefined,
        format: 'json'
      });
    });
  });

  describe('parseCommandOptions', () => {
    test('rejects unexpected named options', () => {
      assert.throws(
        () => parseCommandOptions(
          argv({ unexpected: 'value' }),
          'users get-accounts',
          withSdkOptions({})
        ),
        /Unexpected argument '--unexpected'/
      );
    });

    test('rejects extra positionals', () => {
      assert.throws(
        () => parseCommandOptions(
          argv({ _: ['users get-accounts', 'extra'] }),
          'users get-accounts',
          withSdkOptions({})
        ),
        /Unexpected positional argument for 'users get-accounts': extra/
      );
    });

    test('rejects non-scalar option values from legacy CliArgs', () => {
      assert.throws(
        () => parseCommandOptions(
          argv({ token: ['token'] }),
          'users get-accounts',
          withSdkOptions({})
        ),
        /Expected '--token' as scalar option/
      );
    });
  });

  describe('parseCommaSeparatedStringListOption', () => {
    test('returns trimmed comma-separated values', () => {
      assert.deepEqual(
        parseCommaSeparatedStringListOption('first, second', 'instrument-id'),
        ['first', 'second']
      );
    });

    test('rejects empty comma-separated values', () => {
      assert.throws(
        () => parseCommaSeparatedStringListOption('first,,second', 'instrument-id'),
        /Expected '--instrument-id' as comma-separated list/
      );
    });
  });
});
