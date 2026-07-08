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
  'market get-candles',
  'market get-close-prices',
  'market get-last-prices',
  'market get-last-trades',
  'market get-order-book',
  'market get-trading-status',
  'market get-trading-statuses',
  'operation get-broker-report',
  'operation get-dividends-foreign-issuer',
  'operation get-operations',
  'operation get-operations-by-cursor',
  'operation get-portfolio',
  'operation get-positions',
  'operation get-withdraw-limits',
  'order cancel-order',
  'order get-order-state',
  'order get-orders',
  'order post-order',
  'order replace-order',
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
  'stop-order cancel-stop-order',
  'stop-order get-stop-orders',
  'stop-order post-stop-order'
] as const;

const preferredCommandNames = [
  'account info',
  'account list',
  'account margin',
  'account tariff',
  'dev compile-proto',
  'instrument asset list',
  'instrument asset show',
  'instrument bond accrued',
  'instrument bond coupons',
  'instrument bond list',
  'instrument bond show',
  'instrument brand list',
  'instrument brand show',
  'instrument country list',
  'instrument currency list',
  'instrument currency show',
  'instrument dividends',
  'instrument etf list',
  'instrument etf show',
  'instrument favorite edit',
  'instrument favorite list',
  'instrument future list',
  'instrument future margin',
  'instrument future show',
  'instrument option list',
  'instrument option show',
  'instrument schedules',
  'instrument search',
  'instrument share list',
  'instrument share show',
  'instrument show',
  'market candles',
  'market close-prices',
  'market last-prices',
  'market order-book',
  'market status',
  'market statuses',
  'market trades',
  'operation broker-report',
  'operation foreign-dividends-report',
  'operation list',
  'operation page',
  'operation portfolio',
  'operation positions',
  'operation withdraw-limits',
  'order cancel',
  'order list',
  'order place',
  'order replace',
  'order show',
  'sandbox account close',
  'sandbox account list',
  'sandbox account open',
  'sandbox operation list',
  'sandbox operation page',
  'sandbox order cancel',
  'sandbox order list',
  'sandbox order place',
  'sandbox order replace',
  'sandbox order show',
  'sandbox pay-in',
  'sandbox portfolio',
  'sandbox position list',
  'sandbox withdraw-limits',
  'stop-order cancel',
  'stop-order list',
  'stop-order place'
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
  'instruments bond list',
  'instruments favorite list',
  'instruments share list',
  'marketdata stream',
  'operations broker-report',
  'operations list',
  'operations portfolio',
  'portfolio',
  'sandbox account get-sandbox-accounts',
  'sandbox order post-sandbox-order',
  'stoporders list',
  'stoporders place',
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
      'instrument asset list',
      'instrument bond accrued',
      'instrument bond coupons',
      'instrument bond list',
      'instrument bond show',
      'instrument brand list',
      'instrument country list',
      'instrument currency list',
      'instrument dividends',
      'instrument etf list',
      'instrument favorite edit',
      'instrument favorite list',
      'instrument future list',
      'instrument future margin',
      'instrument option list',
      'instrument schedules',
      'instrument search',
      'instrument share list',
      'instrument share show',
      'instrument show',
      'market candles',
      'market last-prices',
      'operation broker-report',
      'operation foreign-dividends-report',
      'operation list',
      'operation page',
      'operation portfolio',
      'operation positions',
      'operation withdraw-limits',
      'order list',
      'order place',
      'sandbox account close',
      'sandbox account list',
      'sandbox account open',
      'sandbox operation list',
      'sandbox operation page',
      'sandbox order cancel',
      'sandbox order list',
      'sandbox order place',
      'sandbox order replace',
      'sandbox order show',
      'sandbox pay-in',
      'sandbox portfolio',
      'sandbox position list',
      'sandbox withdraw-limits',
      'stop-order cancel',
      'stop-order list',
      'stop-order place'
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
        path: ['instrument', 'shares'],
        args: ['--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['instrument', 'share-by'],
        args: ['--id=instrument-id', '--id-type=uid', '--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['instrument', 'bonds'],
        args: ['--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['instrument', 'bond-by'],
        args: ['--id=instrument-id', '--id-type=uid', '--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['instrument', 'get-bond-coupons'],
        args: [
          '--instrument-id=instrument-id',
          '--from=2026-01-01T00:00:00Z',
          '--to=2026-01-31T00:00:00Z',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['instrument', 'get-accrued-interests'],
        args: [
          '--instrument-id=instrument-id',
          '--from=2026-01-01T00:00:00Z',
          '--to=2026-01-31T00:00:00Z',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['instrument', 'find-instrument'],
        args: ['--query=query', '--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['instrument', 'get-favorites'],
        args: ['--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['instrument', 'edit-favorites'],
        args: [
          '--instrument-id=instrument-id',
          '--action=add',
          '--confirm',
          '--format=xml'
        ],
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
      },
      {
        path: ['stop-order', 'get-stop-orders'],
        args: [
          '--account-id=account-id',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['stop-order', 'post-stop-order'],
        args: [
          '--account-id=account-id',
          '--instrument-id=instrument-id',
          '--quantity=1',
          '--stop-price=95.5',
          '--direction=sell',
          '--expiration-type=good-till-cancel',
          '--stop-order-type=stop-loss',
          '--confirm',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['operation', 'get-operations'],
        args: [
          '--account-id=account-id',
          '--from=2026-06-01T00:00:00Z',
          '--to=2026-06-19T00:00:00Z',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['operation', 'get-portfolio'],
        args: [
          '--account-id=account-id',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['sandbox', 'get-sandbox-accounts'],
        args: ['--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['sandbox', 'open-sandbox-account'],
        args: ['--confirm', '--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['sandbox', 'post-sandbox-order'],
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
      },
      {
        path: ['sandbox', 'get-sandbox-orders'],
        args: ['--account-id=account-id', '--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['sandbox', 'get-sandbox-portfolio'],
        args: ['--account-id=account-id', '--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['sandbox', 'sandbox-pay-in'],
        args: ['--account-id=account-id', '--amount=100', '--confirm', '--format=xml'],
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
        path: ['instruments', 'shares'],
        args: ['--format=xml'],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['instruments', 'get-favorites'],
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
      },
      {
        path: ['stoporders', 'get-stop-orders'],
        args: [
          '--account-id=account-id',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['stoporders', 'post-stop-order'],
        args: [
          '--account-id=account-id',
          '--instrument-id=instrument-id',
          '--quantity=1',
          '--stop-price=95.5',
          '--direction=sell',
          '--expiration-type=good-till-cancel',
          '--stop-order-type=stop-loss',
          '--confirm',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['operations', 'get-operations'],
        args: [
          '--account-id=account-id',
          '--from=2026-06-01T00:00:00Z',
          '--to=2026-06-19T00:00:00Z',
          '--format=xml'
        ],
        expectedError: /Expected '--format' as one of: json, table/
      },
      {
        path: ['operations', 'get-portfolio'],
        args: [
          '--account-id=account-id',
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
