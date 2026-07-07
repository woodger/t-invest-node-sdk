import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../../cli/contract';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { SandboxPayInRequest } from '../../../generated/sandbox';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createSandboxPayInCommand,
  createSandboxPayInRequest,
  parseSandboxPayInCurrency,
  parseSandboxPayInFormat
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

describe('sandbox-pay-in command', () => {
  describe('parseSandboxPayInCurrency', () => {
    test('returns rub by default', () => {
      assert.equal(parseSandboxPayInCurrency(rawOptions({
        'account-id': 'sandbox-account-id',
        amount: '100'
      })), 'rub');
    });

    test('rejects unknown currencies before request mapping', () => {
      assert.throws(
        () => parseSandboxPayInCurrency(rawOptions({
          'account-id': 'sandbox-account-id',
          amount: '100',
          currency: 'eur'
        })),
        /Expected '--currency' as one of: rub, usd/
      );
    });
  });

  describe('createSandboxPayInRequest', () => {
    test('returns generated sandboxPayIn request', () => {
      assert.deepEqual(createSandboxPayInRequest({
        'account-id': 'sandbox-account-id',
        amount: '100.25',
        currency: 'rub'
      }), {
        accountId: 'sandbox-account-id',
        amount: {
          units: 100,
          nano: 250_000_000,
          currency: 'rub'
        }
      });
    });

    test('rejects usd as unsupported provider currency', () => {
      assert.throws(
        () => createSandboxPayInRequest({
          'account-id': 'sandbox-account-id',
          amount: '100',
          currency: 'usd'
        }),
        /Unsupported '--currency=usd' for sandbox-pay-in/
      );
    });
  });

  describe('parseSandboxPayInFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseSandboxPayInFormat(rawOptions()), 'table');
    });
  });

  describe('createSandboxPayInCommand', () => {
    test('requires explicit confirmation before creating sdk', async () => {
      let sdkCreated = false;
      const command = createSandboxPayInCommand(() => {
        sdkCreated = true;
        throw new Error('must not create sdk');
      });

      await assert.rejects(
        () => commandFacade.run(
          command,
          [
            'sandbox',
            'sandbox-pay-in',
            '--account-id=sandbox-account-id',
            '--amount=100'
          ],
          undefined
        ),
        /Expected '--confirm' to execute side-effect command/
      );
      assert.equal(sdkCreated, false);
    });

    test('calls sandboxPayIn and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: SandboxPayInRequest | undefined;
      let closeCalls = 0;
      const command = createSandboxPayInCommand((options) => {
        receivedOptions = options;

        return {
          sandbox: {
            async sandboxPayIn(request) {
              receivedRequest = request;

              return {
                balance: {
                  units: 100,
                  nano: 0,
                  currency: 'rub'
                }
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
          'sandbox-pay-in',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=sandbox-account-id',
          '--amount=100',
          '--currency=rub',
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
        accountId: 'sandbox-account-id',
        amount: {
          units: 100,
          nano: 0,
          currency: 'rub'
        }
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).balance.amount, '100');
    });
  });
});
