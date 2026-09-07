import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { OpenSandboxAccountRequest } from '../../../generated/sandbox';
import { createSandboxOpenAccountCommand, createSandboxOpenAccountRequest } from './cli';

describe('sandbox-open-account command', () => {
  describe('createSandboxOpenAccountRequest', () => {
    test('returns generated openSandboxAccount request', () => {
      assert.deepEqual(createSandboxOpenAccountRequest(), {});
    });
  });

  describe('createSandboxOpenAccountCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createSandboxOpenAccountCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          ['sandbox', 'account', 'open'],
          undefined
        ),
        /Expected '--confirm' to execute side-effect command/
      );
      assert.equal(sdkCreated, false);
    });

    test('calls openSandboxAccount and closes sdk', async () => {
      let receivedOptions: TInvestOptions | undefined;
      let receivedRequest: OpenSandboxAccountRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxOpenAccountCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async openSandboxAccount(request) {
              receivedRequest = request;

              return {
                accountId: 'sandbox-account-id'
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
          'open',
          '--token=token',
          '--endpoint=localhost:50051',
          '--confirm',
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
      assert.equal(JSON.parse(output).accountId, 'sandbox-account-id');
    });
  });
});
