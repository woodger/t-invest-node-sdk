import assert from 'node:assert';
import { describe, test } from 'node:test';
import { commandHelp, isCommandHelpName } from './commands';

describe('commandHelp', () => {
  test('contains help entries for public bootstrap commands', () => {
    assert.deepEqual(
      Object.keys(commandHelp).sort(),
      [
        'help',
        'instruments get-instrument-by',
        'marketdata get-candles',
        'marketdata get-last-prices',
        'marketdata get-order-book',
        'marketdata get-trading-status',
        'marketdata get-trading-statuses',
        'operations get-portfolio',
        'operations get-positions',
        'orders get-orders',
        'users get-accounts',
        'users get-info',
        'version'
      ]
    );
  });
});

describe('isCommandHelpName', () => {
  test('accepts registered help command names only', () => {
    assert.equal(isCommandHelpName('users get-accounts'), true);
    assert.equal(isCommandHelpName('users get-info'), true);
    assert.equal(isCommandHelpName('marketdata get-candles'), true);
    assert.equal(isCommandHelpName('instruments get-instrument-by'), true);
    assert.equal(isCommandHelpName('marketdata get-last-prices'), true);
    assert.equal(isCommandHelpName('marketdata get-order-book'), true);
    assert.equal(isCommandHelpName('marketdata get-trading-status'), true);
    assert.equal(isCommandHelpName('marketdata get-trading-statuses'), true);
    assert.equal(isCommandHelpName('orders get-orders'), true);
    assert.equal(isCommandHelpName('operations get-portfolio'), true);
    assert.equal(isCommandHelpName('operations get-positions'), true);
    assert.equal(isCommandHelpName('help'), true);
    assert.equal(isCommandHelpName('version'), true);
    assert.equal(isCommandHelpName('portfolio'), false);
    assert.equal(isCommandHelpName('unknown-command'), false);
    assert.equal(isCommandHelpName(undefined), false);
  });
});
