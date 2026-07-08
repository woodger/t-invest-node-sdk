import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { OpenSandboxAccountRequest } from '../../../generated/sandbox';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createSandboxOpenAccountCommand,
  createSandboxOpenAccountRequest,
  parseSandboxOpenAccountFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

describe('sandbox-open-account command', () => {
  describe('createSandboxOpenAccountRequest', () => {
    test('returns generated openSandboxAccount request', () => {
      assert.deepEqual(createSandboxOpenAccountRequest(), {});
    });
  });

  describe('parseSandboxOpenAccountFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxOpenAccountFormat(rawOptions()), 'table');
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
      let receivedOptions: TinkoffInvestOptions | undefined;
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
