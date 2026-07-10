import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  AccessLevel,
  AccountStatus,
  AccountType,
  type Account,
  type GetAccountsRequest
} from '../../../generated/users';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createSandboxAccountsCommand,
  createSandboxAccountsRequest,
  parseSandboxAccountsFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function account(overrides: Partial<Account> = {}): Account {
  return {
    id: 'sandbox-account-id',
    name: 'Sandbox account',
    type: AccountType.ACCOUNT_TYPE_TINKOFF,
    status: AccountStatus.ACCOUNT_STATUS_OPEN,
    openedDate: new Date('2026-06-19T00:00:00.000Z'),
    closedDate: undefined,
    accessLevel: AccessLevel.ACCOUNT_ACCESS_LEVEL_FULL_ACCESS,
    ...overrides
  } as Account;
}

describe('sandbox-accounts command', () => {
  describe('createSandboxAccountsRequest', () => {
    test('returns generated getSandboxAccounts request', () => {
      assert.deepEqual(createSandboxAccountsRequest(), {});
    });
  });

  describe('parseSandboxAccountsFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxAccountsFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseSandboxAccountsFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createSandboxAccountsCommand', () => {
    test('calls getSandboxAccounts and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetAccountsRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxAccountsCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async getSandboxAccounts(request) {
              receivedRequest = request;

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

      const output = await commandFacade.run(
        command,
        [
          'sandbox',
          'account',
          'list',
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
      assert.deepEqual(receivedRequest, {});
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output)[0].id, 'sandbox-account-id');
    });

    test('closes sdk when getSandboxAccounts rejects', async () => {
      let closeCalls = 0;
      const command = createSandboxAccountsCommand(() => ({
        sandbox: {
          async getSandboxAccounts() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'sandbox',
            'account',
            'list',
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
