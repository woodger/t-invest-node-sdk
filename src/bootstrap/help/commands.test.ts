import assert from 'node:assert';
import { describe, test } from 'node:test';
import { commandHelp, isCommandHelpName } from './commands';

describe('commandHelp', () => {
  test('contains help entries for public bootstrap commands', () => {
    assert.deepEqual(
      Object.keys(commandHelp).sort(),
      ['accounts', 'candles', 'help', 'portfolio', 'version']
    );
  });
});

describe('isCommandHelpName', () => {
  test('accepts registered help command names only', () => {
    assert.equal(isCommandHelpName('accounts'), true);
    assert.equal(isCommandHelpName('candles'), true);
    assert.equal(isCommandHelpName('portfolio'), true);
    assert.equal(isCommandHelpName('help'), true);
    assert.equal(isCommandHelpName('version'), true);
    assert.equal(isCommandHelpName('orders'), false);
    assert.equal(isCommandHelpName(undefined), false);
  });
});
