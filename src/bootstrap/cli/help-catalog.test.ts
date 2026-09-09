import assert from 'node:assert';
import { describe, test } from 'node:test';
import { commandHelp } from './help-catalog';
import { commandLineCommands } from './registry';

describe('commandHelp', () => {
  test('содержит справку для каждой preferred bootstrap-команды', () => {
    assert.deepEqual(
      Object.keys(commandHelp).sort(),
      [...commandLineCommands.names].sort()
    );
  });
});
