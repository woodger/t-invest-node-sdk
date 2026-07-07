import assert from 'node:assert';
import { describe, test } from 'node:test';
import { commandNames, isCommandName, resolveCommand } from './registry';

const legacyCommandNames = [
  'compile-proto',
  'help',
  'instruments bond-by',
  'instruments bonds',
  'instruments currencies',
  'instruments currency-by',
  'instruments edit-favorites',
  'instruments etf-by',
  'instruments etfs',
  'instruments find-instrument',
  'instruments future-by',
  'instruments futures',
  'instruments get-accrued-interests',
  'instruments get-asset-by',
  'instruments get-assets',
  'instruments get-bond-coupons',
  'instruments get-brand-by',
  'instruments get-brands',
  'instruments get-countries',
  'instruments get-dividends',
  'instruments get-favorites',
  'instruments get-futures-margin',
  'instruments get-instrument-by',
  'instruments option-by',
  'instruments options-by',
  'instruments share-by',
  'instruments shares',
  'instruments trading-schedules',
  'marketdata get-candles',
  'marketdata get-close-prices',
  'marketdata get-last-prices',
  'marketdata get-last-trades',
  'marketdata get-order-book',
  'marketdata get-trading-status',
  'marketdata get-trading-statuses',
  'operations get-broker-report',
  'operations get-dividends-foreign-issuer',
  'operations get-operations',
  'operations get-operations-by-cursor',
  'operations get-portfolio',
  'operations get-positions',
  'operations get-withdraw-limits',
  'orders cancel-order',
  'orders get-order-state',
  'orders get-orders',
  'orders post-order',
  'orders replace-order',
  'sandbox cancel-sandbox-order',
  'sandbox close-sandbox-account',
  'sandbox get-sandbox-accounts',
  'sandbox get-sandbox-operations',
  'sandbox get-sandbox-operations-by-cursor',
  'sandbox get-sandbox-order-state',
  'sandbox get-sandbox-orders',
  'sandbox get-sandbox-portfolio',
  'sandbox get-sandbox-positions',
  'sandbox get-sandbox-withdraw-limits',
  'sandbox open-sandbox-account',
  'sandbox post-sandbox-order',
  'sandbox replace-sandbox-order',
  'sandbox sandbox-pay-in',
  'stoporders cancel-stop-order',
  'stoporders get-stop-orders',
  'stoporders post-stop-order',
  'stream run',
  'users get-accounts',
  'users get-info',
  'users get-margin-attributes',
  'users get-user-tariff',
  'version'
] as const;

const technicalCompatibilityCommandNames = [
  'account get-accounts',
  'account get-info',
  'account get-margin-attributes',
  'account get-user-tariff',
  'market get-candles',
  'market get-close-prices',
  'market get-last-prices',
  'market get-last-trades',
  'market get-order-book',
  'market get-trading-status',
  'market get-trading-statuses',
  'order cancel-order',
  'order get-order-state',
  'order get-orders',
  'order post-order',
  'order replace-order'
] as const;

const preferredCommandNames = [
  'account info',
  'account list',
  'account margin',
  'account tariff',
  'dev compile-proto',
  'instrument bond-by',
  'instrument bonds',
  'instrument currencies',
  'instrument currency-by',
  'instrument edit-favorites',
  'instrument etf-by',
  'instrument etfs',
  'instrument find-instrument',
  'instrument future-by',
  'instrument futures',
  'instrument get-accrued-interests',
  'instrument get-asset-by',
  'instrument get-assets',
  'instrument get-bond-coupons',
  'instrument get-brand-by',
  'instrument get-brands',
  'instrument get-countries',
  'instrument get-dividends',
  'instrument get-favorites',
  'instrument get-futures-margin',
  'instrument get-instrument-by',
  'instrument option-by',
  'instrument options-by',
  'instrument share-by',
  'instrument shares',
  'instrument trading-schedules',
  'market candles',
  'market close-prices',
  'market last-prices',
  'market order-book',
  'market status',
  'market statuses',
  'market trades',
  'operation get-broker-report',
  'operation get-dividends-foreign-issuer',
  'operation get-operations',
  'operation get-operations-by-cursor',
  'operation get-portfolio',
  'operation get-positions',
  'operation get-withdraw-limits',
  'order cancel',
  'order list',
  'order place',
  'order replace',
  'order show',
  'stop-order cancel-stop-order',
  'stop-order get-stop-orders',
  'stop-order post-stop-order'
] as const;

const expectedCommandNames = [
  ...new Set([
    ...legacyCommandNames,
    ...technicalCompatibilityCommandNames,
    ...preferredCommandNames
  ])
] as const;

const unknownCommandNames = [
  'instruments options',
  'marketdata stream',
  'portfolio',
  'unknown-command',
  undefined
] as const;

function commandPath(commandName: string): string[] {
  return commandName.split(' ');
}

describe('commandNames', () => {
  test('contains public bootstrap command names', () => {
    assert.deepEqual(
      [...commandNames].sort(),
      [...expectedCommandNames].sort()
    );
  });
});

describe('resolveCommand', () => {
  test('resolves registered commands', () => {
    for (const commandName of expectedCommandNames) {
      const path = commandPath(commandName);
      const command = resolveCommand(path);

      assert.equal(command.name, commandName);
      assert.deepEqual(command.path, path);
      assert.equal(typeof command.handler, 'function');
    }
  });

  test('resolves friendly command paths', () => {
    for (const commandName of [
      'account list',
      'account info',
      'market candles',
      'market last-prices',
      'order list',
      'order place'
    ]) {
      const path = commandPath(commandName);
      const command = resolveCommand(path);

      assert.equal(command.name, commandName);
      assert.deepEqual(command.path, path);
    }
  });

  test('returns executable command handler', async () => {
    const command = resolveCommand(['version']);
    const output = await command.handler(['version']);

    if (typeof output !== 'string') {
      throw new Error('Expected version command output as string');
    }

    assert.match(output, /^tinkoff-invest-node-sdk \d+\.\d+\.\d+/);
  });

  test('returns executable help command handler', async () => {
    const command = resolveCommand(['help']);
    const output = await command.handler(['help', 'version']);

    if (typeof output !== 'string') {
      throw new Error('Expected help command output as string');
    }

    assert.match(output, /version - Show package and runtime version info/);
  });

  test('passes named options to command-line definitions', async () => {
    const command = resolveCommand(['account', 'list']);

    await assert.rejects(
      async () => {
        await command.handler(['account', 'list', '--format=xml']);
      },
      /Expected '--format' as one of: json, table/
    );
  });

  test('keeps technical command paths executable', async () => {
    for (const { path, args, expectedError } of [
      {
        path: ['account', 'get-accounts'],
        args: ['--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['market', 'get-candles'],
        args: [
          '--instrument-id=instrument-id',
          '--from=2026-06-19T00:00:00Z',
          '--to=2026-06-19T01:00:00Z',
          '--interval=1min',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, csv/
      },
      {
        path: ['order', 'post-order'],
        args: [
          '--account-id=account-id',
          '--instrument-id=instrument-id',
          '--quantity=1',
          '--direction=buy',
          '--order-type=market',
          '--order-id=order-id',
          '--confirm',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, table/
      }
    ]) {
      const command = resolveCommand(path);

      await assert.rejects(
        async () => {
          await command.handler([...path, ...args]);
        },
        expectedError
      );
    }
  });

  test('keeps legacy command paths executable', async () => {
    for (const { path, args, expectedError } of [
      {
        path: ['users', 'get-accounts'],
        args: ['--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['marketdata', 'get-candles'],
        args: [
          '--instrument-id=instrument-id',
          '--from=2026-06-19T00:00:00Z',
          '--to=2026-06-19T01:00:00Z',
          '--interval=1min',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, csv/
      },
      {
        path: ['orders', 'post-order'],
        args: [
          '--account-id=account-id',
          '--instrument-id=instrument-id',
          '--quantity=1',
          '--direction=buy',
          '--order-type=market',
          '--order-id=order-id',
          '--confirm',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, table/
      }
    ]) {
      const command = resolveCommand(path);

      await assert.rejects(
        async () => {
          await command.handler([...path, ...args]);
        },
        expectedError
      );
    }
  });

  test('throws for unknown command', () => {
    assert.throws(
      () => resolveCommand(['unknown-command']),
      /is not a program command/
    );
  });

  test('does not resolve legacy shortcut names', () => {
    assert.throws(
      () => resolveCommand(['portfolio']),
      /is not a program command/
    );
  });
});

describe('isCommandName', () => {
  test('accepts registered command names only', () => {
    for (const commandName of expectedCommandNames) {
      assert.equal(isCommandName(commandName), true);
    }

    for (const commandName of unknownCommandNames) {
      assert.equal(isCommandName(commandName), false);
    }
  });
});
