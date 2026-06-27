import assert from 'node:assert';
import { describe, test } from 'node:test';
import { runCommand } from 'icore';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  AccessLevel,
  AccountStatus,
  AccountType,
  type Account
} from '../../../generated/users';
import type { CliArgs } from '../../cli-contract';
import {
  createAccountsCommand,
  parseAccountsFormat
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['users get-accounts'],
    ...args
  };
}

function account(overrides: Partial<Account> = {}): Account {
  return {
    id: 'account-id',
    name: 'Main account',
    type: AccountType.ACCOUNT_TYPE_TINKOFF,
    status: AccountStatus.ACCOUNT_STATUS_OPEN,
    openedDate: new Date('2026-06-19T00:00:00.000Z'),
    closedDate: undefined,
    accessLevel: AccessLevel.ACCOUNT_ACCESS_LEVEL_FULL_ACCESS,
    ...overrides
  };
}

describe('accounts command', () => {
  describe('parseAccountsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseAccountsFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseAccountsFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createAccountsCommand', () => {
    test('calls getAccounts and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let closeCalls = 0;
      let getAccountsCalls = 0;
      const command = createAccountsCommand((options) => {
        receivedOptions = options;

        return {
          users: {
            async getAccounts() {
              getAccountsCalls += 1;

              return {
                accounts: [account()]
              };
            }
          },
          close() {
            closeCalls += 1;
          }
        };
      });

      const output = await runCommand(
        command,
        [
          'users',
          'get-accounts',
          '--token=token',
          '--endpoint=localhost:50051',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.equal(getAccountsCalls, 1);
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].id, 'account-id');
    });

    test('closes sdk when getAccounts rejects', async () => {
      let closeCalls = 0;
      const command = createAccountsCommand(() => ({
        users: {
          async getAccounts() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => runCommand(
          command,
          [
            'users',
            'get-accounts',
            '--token=token',
            '--endpoint=localhost:50051'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
