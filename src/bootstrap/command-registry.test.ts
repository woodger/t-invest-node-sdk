import assert from 'node:assert';
import { describe, test } from 'node:test';
import { isCommandName, resolveCommand } from './command-registry';

describe('resolveCommand', () => {
  test('resolves accounts command', () => {
    const command = resolveCommand(['users', 'get-accounts']);

    assert.equal(command.name, 'users get-accounts');
    assert.deepEqual(command.path, ['users', 'get-accounts']);
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves user-info command', () => {
    const command = resolveCommand(['users', 'get-info']);

    assert.equal(command.name, 'users get-info');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves margin-attributes command', () => {
    const command = resolveCommand(['users', 'get-margin-attributes']);

    assert.equal(command.name, 'users get-margin-attributes');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves user-tariff command', () => {
    const command = resolveCommand(['users', 'get-user-tariff']);

    assert.equal(command.name, 'users get-user-tariff');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves candles command', () => {
    const command = resolveCommand(['marketdata', 'get-candles']);

    assert.equal(command.name, 'marketdata get-candles');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves close-prices command', () => {
    const command = resolveCommand(['marketdata', 'get-close-prices']);

    assert.equal(command.name, 'marketdata get-close-prices');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves instrument command', () => {
    const command = resolveCommand(['instruments', 'get-instrument-by']);

    assert.equal(command.name, 'instruments get-instrument-by');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves accrued-interests command', () => {
    const command = resolveCommand(['instruments', 'get-accrued-interests']);

    assert.equal(command.name, 'instruments get-accrued-interests');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves asset command', () => {
    const command = resolveCommand(['instruments', 'get-asset-by']);

    assert.equal(command.name, 'instruments get-asset-by');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves assets command', () => {
    const command = resolveCommand(['instruments', 'get-assets']);

    assert.equal(command.name, 'instruments get-assets');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves bond-coupons command', () => {
    const command = resolveCommand(['instruments', 'get-bond-coupons']);

    assert.equal(command.name, 'instruments get-bond-coupons');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves bond command', () => {
    const command = resolveCommand(['instruments', 'bond-by']);

    assert.equal(command.name, 'instruments bond-by');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves bonds command', () => {
    const command = resolveCommand(['instruments', 'bonds']);

    assert.equal(command.name, 'instruments bonds');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves brand command', () => {
    const command = resolveCommand(['instruments', 'get-brand-by']);

    assert.equal(command.name, 'instruments get-brand-by');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves brands command', () => {
    const command = resolveCommand(['instruments', 'get-brands']);

    assert.equal(command.name, 'instruments get-brands');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves countries command', () => {
    const command = resolveCommand(['instruments', 'get-countries']);

    assert.equal(command.name, 'instruments get-countries');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves currencies command', () => {
    const command = resolveCommand(['instruments', 'currencies']);

    assert.equal(command.name, 'instruments currencies');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves currency command', () => {
    const command = resolveCommand(['instruments', 'currency-by']);

    assert.equal(command.name, 'instruments currency-by');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves favorites command', () => {
    const command = resolveCommand(['instruments', 'get-favorites']);

    assert.equal(command.name, 'instruments get-favorites');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves edit-favorites command', () => {
    const command = resolveCommand(['instruments', 'edit-favorites']);

    assert.equal(command.name, 'instruments edit-favorites');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves dividends command', () => {
    const command = resolveCommand(['instruments', 'get-dividends']);

    assert.equal(command.name, 'instruments get-dividends');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves etf command', () => {
    const command = resolveCommand(['instruments', 'etf-by']);

    assert.equal(command.name, 'instruments etf-by');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves etfs command', () => {
    const command = resolveCommand(['instruments', 'etfs']);

    assert.equal(command.name, 'instruments etfs');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves find-instrument command', () => {
    const command = resolveCommand(['instruments', 'find-instrument']);

    assert.equal(command.name, 'instruments find-instrument');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves future command', () => {
    const command = resolveCommand(['instruments', 'future-by']);

    assert.equal(command.name, 'instruments future-by');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves futures command', () => {
    const command = resolveCommand(['instruments', 'futures']);

    assert.equal(command.name, 'instruments futures');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves futures-margin command', () => {
    const command = resolveCommand(['instruments', 'get-futures-margin']);

    assert.equal(command.name, 'instruments get-futures-margin');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves option command', () => {
    const command = resolveCommand(['instruments', 'option-by']);

    assert.equal(command.name, 'instruments option-by');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves options-by command', () => {
    const command = resolveCommand(['instruments', 'options-by']);

    assert.equal(command.name, 'instruments options-by');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves trading-schedules command', () => {
    const command = resolveCommand(['instruments', 'trading-schedules']);

    assert.equal(command.name, 'instruments trading-schedules');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves share command', () => {
    const command = resolveCommand(['instruments', 'share-by']);

    assert.equal(command.name, 'instruments share-by');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves shares command', () => {
    const command = resolveCommand(['instruments', 'shares']);

    assert.equal(command.name, 'instruments shares');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves portfolio command', () => {
    const command = resolveCommand(['operations', 'get-portfolio']);

    assert.equal(command.name, 'operations get-portfolio');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves last-prices command', () => {
    const command = resolveCommand(['marketdata', 'get-last-prices']);

    assert.equal(command.name, 'marketdata get-last-prices');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves last-trades command', () => {
    const command = resolveCommand(['marketdata', 'get-last-trades']);

    assert.equal(command.name, 'marketdata get-last-trades');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves order-book command', () => {
    const command = resolveCommand(['marketdata', 'get-order-book']);

    assert.equal(command.name, 'marketdata get-order-book');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves trading-status command', () => {
    const command = resolveCommand(['marketdata', 'get-trading-status']);

    assert.equal(command.name, 'marketdata get-trading-status');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves trading-statuses command', () => {
    const command = resolveCommand(['marketdata', 'get-trading-statuses']);

    assert.equal(command.name, 'marketdata get-trading-statuses');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves positions command', () => {
    const command = resolveCommand(['operations', 'get-positions']);

    assert.equal(command.name, 'operations get-positions');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves withdraw-limits command', () => {
    const command = resolveCommand(['operations', 'get-withdraw-limits']);

    assert.equal(command.name, 'operations get-withdraw-limits');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves orders command', () => {
    const command = resolveCommand(['orders', 'get-orders']);

    assert.equal(command.name, 'orders get-orders');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves order-state command', () => {
    const command = resolveCommand(['orders', 'get-order-state']);

    assert.equal(command.name, 'orders get-order-state');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves post-order command', () => {
    const command = resolveCommand(['orders', 'post-order']);

    assert.equal(command.name, 'orders post-order');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves cancel-order command', () => {
    const command = resolveCommand(['orders', 'cancel-order']);

    assert.equal(command.name, 'orders cancel-order');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves replace-order command', () => {
    const command = resolveCommand(['orders', 'replace-order']);

    assert.equal(command.name, 'orders replace-order');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves operations command', () => {
    const command = resolveCommand(['operations', 'get-operations']);

    assert.equal(command.name, 'operations get-operations');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves operations-by-cursor command', () => {
    const command = resolveCommand(['operations', 'get-operations-by-cursor']);

    assert.equal(command.name, 'operations get-operations-by-cursor');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves broker-report command', () => {
    const command = resolveCommand(['operations', 'get-broker-report']);

    assert.equal(command.name, 'operations get-broker-report');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves dividends-foreign-issuer command', () => {
    const command = resolveCommand(['operations', 'get-dividends-foreign-issuer']);

    assert.equal(command.name, 'operations get-dividends-foreign-issuer');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves stop-orders command', () => {
    const command = resolveCommand(['stoporders', 'get-stop-orders']);

    assert.equal(command.name, 'stoporders get-stop-orders');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves post-stop-order command', () => {
    const command = resolveCommand(['stoporders', 'post-stop-order']);

    assert.equal(command.name, 'stoporders post-stop-order');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves cancel-stop-order command', () => {
    const command = resolveCommand(['stoporders', 'cancel-stop-order']);

    assert.equal(command.name, 'stoporders cancel-stop-order');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves help command', () => {
    const command = resolveCommand(['help']);

    assert.equal(command.name, 'help');
    assert.equal(typeof command.handler, 'function');
  });

  test('resolves version command', () => {
    const command = resolveCommand(['version']);

    assert.equal(command.name, 'version');
    assert.equal(typeof command.handler, 'function');
  });

  test('returns executable command handler', async () => {
    const command = resolveCommand(['version']);
    const output = await command.handler(['version']);

    assert.match(output ?? '', /^tinkoff-invest-node-sdk \d+\.\d+\.\d+/);
  });

  test('returns executable help command handler', async () => {
    const command = resolveCommand(['help']);
    const output = await command.handler(['help', 'version']);

    assert.match(output ?? '', /version - Show package and runtime version info/);
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
    assert.equal(isCommandName('users get-accounts'), true);
    assert.equal(isCommandName('users get-info'), true);
    assert.equal(isCommandName('users get-margin-attributes'), true);
    assert.equal(isCommandName('users get-user-tariff'), true);
    assert.equal(isCommandName('marketdata get-candles'), true);
    assert.equal(isCommandName('marketdata get-close-prices'), true);
    assert.equal(isCommandName('instruments bond-by'), true);
    assert.equal(isCommandName('instruments bonds'), true);
    assert.equal(isCommandName('instruments get-accrued-interests'), true);
    assert.equal(isCommandName('instruments get-asset-by'), true);
    assert.equal(isCommandName('instruments get-assets'), true);
    assert.equal(isCommandName('instruments get-bond-coupons'), true);
    assert.equal(isCommandName('instruments get-brand-by'), true);
    assert.equal(isCommandName('instruments get-brands'), true);
    assert.equal(isCommandName('instruments get-countries'), true);
    assert.equal(isCommandName('instruments currencies'), true);
    assert.equal(isCommandName('instruments currency-by'), true);
    assert.equal(isCommandName('instruments get-dividends'), true);
    assert.equal(isCommandName('instruments etf-by'), true);
    assert.equal(isCommandName('instruments etfs'), true);
    assert.equal(isCommandName('instruments get-favorites'), true);
    assert.equal(isCommandName('instruments edit-favorites'), true);
    assert.equal(isCommandName('instruments find-instrument'), true);
    assert.equal(isCommandName('instruments future-by'), true);
    assert.equal(isCommandName('instruments futures'), true);
    assert.equal(isCommandName('instruments get-futures-margin'), true);
    assert.equal(isCommandName('instruments get-instrument-by'), true);
    assert.equal(isCommandName('instruments option-by'), true);
    assert.equal(isCommandName('instruments options-by'), true);
    assert.equal(isCommandName('instruments share-by'), true);
    assert.equal(isCommandName('instruments shares'), true);
    assert.equal(isCommandName('instruments trading-schedules'), true);
    assert.equal(isCommandName('marketdata get-last-prices'), true);
    assert.equal(isCommandName('marketdata get-last-trades'), true);
    assert.equal(isCommandName('marketdata get-order-book'), true);
    assert.equal(isCommandName('marketdata get-trading-status'), true);
    assert.equal(isCommandName('marketdata get-trading-statuses'), true);
    assert.equal(isCommandName('orders get-orders'), true);
    assert.equal(isCommandName('orders get-order-state'), true);
    assert.equal(isCommandName('orders post-order'), true);
    assert.equal(isCommandName('orders cancel-order'), true);
    assert.equal(isCommandName('orders replace-order'), true);
    assert.equal(isCommandName('operations get-broker-report'), true);
    assert.equal(isCommandName('operations get-dividends-foreign-issuer'), true);
    assert.equal(isCommandName('operations get-operations'), true);
    assert.equal(isCommandName('operations get-operations-by-cursor'), true);
    assert.equal(isCommandName('operations get-portfolio'), true);
    assert.equal(isCommandName('operations get-positions'), true);
    assert.equal(isCommandName('operations get-withdraw-limits'), true);
    assert.equal(isCommandName('stoporders get-stop-orders'), true);
    assert.equal(isCommandName('stoporders post-stop-order'), true);
    assert.equal(isCommandName('stoporders cancel-stop-order'), true);
    assert.equal(isCommandName('help'), true);
    assert.equal(isCommandName('version'), true);
    assert.equal(isCommandName('instruments options'), false);
    assert.equal(isCommandName('marketdata stream'), false);
    assert.equal(isCommandName('portfolio'), false);
    assert.equal(isCommandName('unknown-command'), false);
    assert.equal(isCommandName(undefined), false);
  });
});
