import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { CloseSandboxAccountRequest } from '../../../generated/sandbox';
import { createSandboxCloseAccountCommand, createSandboxCloseAccountRequest } from './cli';

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
          ['sandbox', 'account', 'close', '--account-id=sandbox-account-id'],
          undefined
        ),
        /Expected '--confirm' to execute side-effect command/
      );
      assert.equal(sdkCreated, false);
    });

    test('calls closeSandboxAccount and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
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
          'account',
          'close',
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
