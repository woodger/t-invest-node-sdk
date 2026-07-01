import assert from 'node:assert';
import { describe, test } from 'node:test';
import { commandNames } from '../command-registry';
import { commandHelp, isCommandHelpName } from './commands';

const unknownHelpNames = [
  'instruments options',
  'marketdata stream',
  'portfolio',
  'unknown-command',
  undefined
] as const;

describe('commandHelp', () => {
  test('contains help entries for registered public bootstrap commands', () => {
    assert.deepEqual(
      Object.keys(commandHelp).sort(),
      [...commandNames].sort()
    );
  });
});

describe('isCommandHelpName', () => {
  test('accepts registered help command names only', () => {
    for (const commandName of commandNames) {
      assert.equal(isCommandHelpName(commandName), true);
    }

    for (const commandName of unknownHelpNames) {
      assert.equal(isCommandHelpName(commandName), false);
    }
  });
});
