import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { CloseSandboxAccountRequest } from '../../../generated/sandbox';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createSandboxCloseAccountCommand,
  createSandboxCloseAccountRequest,
  parseSandboxCloseAccountFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

describe('sandbox-close-account command', () => {
  describe('createSandboxCloseAccountRequest', () => {
    test('returns generated closeSandboxAccount request', () => {
      assert.deepEqual(createSandboxCloseAccountRequest({
        'account-id': 'sandbox-account-id'
      }), {
        accountId: 'sandbox-account-id'
      });
    });
  });

  describe('parseSandboxCloseAccountFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxCloseAccountFormat(rawOptions()), 'table');
    });
  });

  describe('createSandboxCloseAccountCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createSandboxCloseAccountCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          ['sandbox', 'close-sandbox-account', '--account-id=sandbox-account-id'],
          undefined
        ),
        /Expected '--confirm' to execute side-effect command/
      );
      assert.equal(sdkCreated, false);
    });

    test('calls closeSandboxAccount and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: CloseSandboxAccountRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxCloseAccountCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async closeSandboxAccount(request) {
              receivedRequest = request;

              return {};
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
          'close-sandbox-account',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=sandbox-account-id',
          '--confirm',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        accountId: 'sandbox-account-id'
      });
      assert.equal(closeCalls, 1);
      assert.deepEqual(JSON.parse(output), {
        accountId: 'sandbox-account-id',
        status: 'closed'
      });
    });
  });
});
