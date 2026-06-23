import assert from 'node:assert';
import { describe, test } from 'node:test';
import { commandHelp, isCommandHelpName } from './commands';

describe('commandHelp', () => {
  test('contains help entries for public bootstrap commands', () => {
    assert.deepEqual(
      Object.keys(commandHelp).sort(),
      [
        'help',
        'instruments find-instrument',
        'instruments get-accrued-interests',
        'instruments get-bond-coupons',
        'instruments get-brand-by',
        'instruments get-brands',
        'instruments get-countries',
        'instruments get-dividends',
        'instruments get-favorites',
        'instruments get-futures-margin',
        'instruments get-instrument-by',
        'instruments trading-schedules',
        'marketdata get-candles',
        'marketdata get-close-prices',
        'marketdata get-last-prices',
        'marketdata get-last-trades',
        'marketdata get-order-book',
        'marketdata get-trading-status',
        'marketdata get-trading-statuses',
        'operations get-operations',
        'operations get-operations-by-cursor',
        'operations get-portfolio',
        'operations get-positions',
        'operations get-withdraw-limits',
        'orders get-order-state',
        'orders get-orders',
        'stoporders get-stop-orders',
        'users get-accounts',
        'users get-info',
        'users get-margin-attributes',
        'users get-user-tariff',
        'version'
      ]
    );
  });
});

describe('isCommandHelpName', () => {
  test('accepts registered help command names only', () => {
    assert.equal(isCommandHelpName('users get-accounts'), true);
    assert.equal(isCommandHelpName('users get-info'), true);
    assert.equal(isCommandHelpName('users get-margin-attributes'), true);
    assert.equal(isCommandHelpName('users get-user-tariff'), true);
    assert.equal(isCommandHelpName('marketdata get-candles'), true);
    assert.equal(isCommandHelpName('marketdata get-close-prices'), true);
    assert.equal(isCommandHelpName('instruments get-accrued-interests'), true);
    assert.equal(isCommandHelpName('instruments get-bond-coupons'), true);
    assert.equal(isCommandHelpName('instruments get-brand-by'), true);
    assert.equal(isCommandHelpName('instruments get-brands'), true);
    assert.equal(isCommandHelpName('instruments get-countries'), true);
    assert.equal(isCommandHelpName('instruments get-dividends'), true);
    assert.equal(isCommandHelpName('instruments get-favorites'), true);
    assert.equal(isCommandHelpName('instruments find-instrument'), true);
    assert.equal(isCommandHelpName('instruments get-futures-margin'), true);
    assert.equal(isCommandHelpName('instruments get-instrument-by'), true);
    assert.equal(isCommandHelpName('instruments trading-schedules'), true);
    assert.equal(isCommandHelpName('marketdata get-last-prices'), true);
    assert.equal(isCommandHelpName('marketdata get-last-trades'), true);
    assert.equal(isCommandHelpName('marketdata get-order-book'), true);
    assert.equal(isCommandHelpName('marketdata get-trading-status'), true);
    assert.equal(isCommandHelpName('marketdata get-trading-statuses'), true);
    assert.equal(isCommandHelpName('orders get-orders'), true);
    assert.equal(isCommandHelpName('orders get-order-state'), true);
    assert.equal(isCommandHelpName('operations get-operations-by-cursor'), true);
    assert.equal(isCommandHelpName('operations get-operations'), true);
    assert.equal(isCommandHelpName('operations get-portfolio'), true);
    assert.equal(isCommandHelpName('operations get-positions'), true);
    assert.equal(isCommandHelpName('operations get-withdraw-limits'), true);
    assert.equal(isCommandHelpName('stoporders get-stop-orders'), true);
    assert.equal(isCommandHelpName('help'), true);
    assert.equal(isCommandHelpName('version'), true);
    assert.equal(isCommandHelpName('portfolio'), false);
    assert.equal(isCommandHelpName('unknown-command'), false);
    assert.equal(isCommandHelpName(undefined), false);
  });
});
