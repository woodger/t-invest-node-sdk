import assert from 'node:assert';
import { describe, test } from 'node:test';
import { commandHelp, isCommandHelpName } from './commands';

describe('commandHelp', () => {
  test('contains help entries for public bootstrap commands', () => {
    assert.deepEqual(
      Object.keys(commandHelp).sort(),
      [
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
    assert.equal(isCommandHelpName('instruments bond-by'), true);
    assert.equal(isCommandHelpName('instruments bonds'), true);
    assert.equal(isCommandHelpName('instruments get-accrued-interests'), true);
    assert.equal(isCommandHelpName('instruments get-asset-by'), true);
    assert.equal(isCommandHelpName('instruments get-assets'), true);
    assert.equal(isCommandHelpName('instruments get-bond-coupons'), true);
    assert.equal(isCommandHelpName('instruments get-brand-by'), true);
    assert.equal(isCommandHelpName('instruments get-brands'), true);
    assert.equal(isCommandHelpName('instruments get-countries'), true);
    assert.equal(isCommandHelpName('instruments currencies'), true);
    assert.equal(isCommandHelpName('instruments currency-by'), true);
    assert.equal(isCommandHelpName('instruments etf-by'), true);
    assert.equal(isCommandHelpName('instruments etfs'), true);
    assert.equal(isCommandHelpName('instruments get-dividends'), true);
    assert.equal(isCommandHelpName('instruments get-favorites'), true);
    assert.equal(isCommandHelpName('instruments edit-favorites'), true);
    assert.equal(isCommandHelpName('instruments find-instrument'), true);
    assert.equal(isCommandHelpName('instruments future-by'), true);
    assert.equal(isCommandHelpName('instruments futures'), true);
    assert.equal(isCommandHelpName('instruments get-futures-margin'), true);
    assert.equal(isCommandHelpName('instruments get-instrument-by'), true);
    assert.equal(isCommandHelpName('instruments option-by'), true);
    assert.equal(isCommandHelpName('instruments options-by'), true);
    assert.equal(isCommandHelpName('instruments share-by'), true);
    assert.equal(isCommandHelpName('instruments shares'), true);
    assert.equal(isCommandHelpName('instruments trading-schedules'), true);
    assert.equal(isCommandHelpName('marketdata get-last-prices'), true);
    assert.equal(isCommandHelpName('marketdata get-last-trades'), true);
    assert.equal(isCommandHelpName('marketdata get-order-book'), true);
    assert.equal(isCommandHelpName('marketdata get-trading-status'), true);
    assert.equal(isCommandHelpName('marketdata get-trading-statuses'), true);
    assert.equal(isCommandHelpName('orders get-orders'), true);
    assert.equal(isCommandHelpName('orders get-order-state'), true);
    assert.equal(isCommandHelpName('orders post-order'), true);
    assert.equal(isCommandHelpName('orders cancel-order'), true);
    assert.equal(isCommandHelpName('orders replace-order'), true);
    assert.equal(isCommandHelpName('operations get-broker-report'), true);
    assert.equal(isCommandHelpName('operations get-dividends-foreign-issuer'), true);
    assert.equal(isCommandHelpName('operations get-operations-by-cursor'), true);
    assert.equal(isCommandHelpName('operations get-operations'), true);
    assert.equal(isCommandHelpName('operations get-portfolio'), true);
    assert.equal(isCommandHelpName('operations get-positions'), true);
    assert.equal(isCommandHelpName('operations get-withdraw-limits'), true);
    assert.equal(isCommandHelpName('stoporders get-stop-orders'), true);
    assert.equal(isCommandHelpName('stoporders post-stop-order'), true);
    assert.equal(isCommandHelpName('stoporders cancel-stop-order'), true);
    assert.equal(isCommandHelpName('sandbox open-sandbox-account'), true);
    assert.equal(isCommandHelpName('sandbox get-sandbox-accounts'), true);
    assert.equal(isCommandHelpName('sandbox close-sandbox-account'), true);
    assert.equal(isCommandHelpName('sandbox post-sandbox-order'), true);
    assert.equal(isCommandHelpName('sandbox replace-sandbox-order'), true);
    assert.equal(isCommandHelpName('sandbox get-sandbox-orders'), true);
    assert.equal(isCommandHelpName('sandbox cancel-sandbox-order'), true);
    assert.equal(isCommandHelpName('sandbox get-sandbox-order-state'), true);
    assert.equal(isCommandHelpName('sandbox get-sandbox-positions'), true);
    assert.equal(isCommandHelpName('sandbox get-sandbox-operations'), true);
    assert.equal(isCommandHelpName('sandbox get-sandbox-operations-by-cursor'), true);
    assert.equal(isCommandHelpName('sandbox get-sandbox-portfolio'), true);
    assert.equal(isCommandHelpName('sandbox sandbox-pay-in'), true);
    assert.equal(isCommandHelpName('sandbox get-sandbox-withdraw-limits'), true);
    assert.equal(isCommandHelpName('stream run'), true);
    assert.equal(isCommandHelpName('help'), true);
    assert.equal(isCommandHelpName('version'), true);
    assert.equal(isCommandHelpName('instruments options'), false);
    assert.equal(isCommandHelpName('marketdata stream'), false);
    assert.equal(isCommandHelpName('portfolio'), false);
    assert.equal(isCommandHelpName('unknown-command'), false);
    assert.equal(isCommandHelpName(undefined), false);
  });
});
