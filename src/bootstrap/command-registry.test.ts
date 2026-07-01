import assert from 'node:assert';
import { describe, test } from 'node:test';
import { commandNames, isCommandName, resolveCommand } from './command-registry';

const expectedCommandNames = [
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
    const command = resolveCommand(['users', 'get-accounts']);

    await assert.rejects(
      async () => {
        await command.handler(['users', 'get-accounts', '--format=xml']);
      },
      /Expected '--format' as one of: json, table/
    );
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
