import assert from 'node:assert';
import { describe, test } from 'node:test';
import { commandHelp, isCommandHelpName } from './commands';

describe('commandHelp', () => {
  test('contains help entries for public bootstrap commands', () => {
    assert.deepEqual(
      Object.keys(commandHelp).sort(),
      ['accounts', 'candles', 'help', 'instrument', 'last-prices', 'orders', 'portfolio', 'positions', 'version']
    );
  });
});

describe('isCommandHelpName', () => {
  test('accepts registered help command names only', () => {
    assert.equal(isCommandHelpName('accounts'), true);
    assert.equal(isCommandHelpName('candles'), true);
    assert.equal(isCommandHelpName('instrument'), true);
    assert.equal(isCommandHelpName('last-prices'), true);
    assert.equal(isCommandHelpName('orders'), true);
    assert.equal(isCommandHelpName('portfolio'), true);
    assert.equal(isCommandHelpName('positions'), true);
    assert.equal(isCommandHelpName('help'), true);
    assert.equal(isCommandHelpName('version'), true);
    assert.equal(isCommandHelpName('unknown-command'), false);
    assert.equal(isCommandHelpName(undefined), false);
  });
});
