import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { OptionsSchema } from 'icore';
import { commandHelp, type CommandHelpName } from './help-catalog';
import { commandLineCommands } from './registry';

describe('commandHelp', () => {
  test('содержит справку для каждой preferred bootstrap-команды', () => {
    assert.deepEqual(
      Object.keys(commandHelp).sort(),
      [...commandLineCommands.names].sort()
    );
  });

  test('describes exactly the options accepted by every command', () => {
    for (const commandName of Object.keys(commandHelp) as CommandHelpName[]) {
      const help = commandHelp[commandName];
      const command = commandLineCommands.resolve(commandName.split(' '));
      const rows = optionRows([
        ...('required' in help ? help.required : []),
        ...('optional' in help ? help.optional : [])
      ]);

      assert.deepEqual(
        [...rows.keys()].sort(),
        Object.keys(command.command.options).sort(),
        commandName
      );
    }
  });

  test('documents schema-required options as required', () => {
    for (const commandName of Object.keys(commandHelp) as CommandHelpName[]) {
      const help = commandHelp[commandName];
      const command = commandLineCommands.resolve(commandName.split(' '));
      const schema: OptionsSchema = command.command.options;
      const rows = optionRows('required' in help ? help.required : []);

      for (const [name, option] of Object.entries(schema)) {
        if (option.required) {
          assert.ok(rows.has(name), `${commandName} --${name}`);
        }
      }
    }
  });

  test('documents every choice accepted by option schemas', () => {
    for (const commandName of Object.keys(commandHelp) as CommandHelpName[]) {
      const help = commandHelp[commandName];
      const command = commandLineCommands.resolve(commandName.split(' '));
      const schema: OptionsSchema = command.command.options;
      const rows = optionRows([
        ...('required' in help ? help.required : []),
        ...('optional' in help ? help.optional : [])
      ]);

      for (const [name, option] of Object.entries(schema)) {
        if (option.type === 'boolean' || option.choices === undefined) {
          continue;
        }

        const row = rows.get(name);
        const choices = row?.match(/[a-z\d-]+(?:\|[a-z\d-]+)+/i)?.[0]
          ?? row?.match(/^--[a-z\d-]+=([a-z\d-]+)(?:\s|$)/i)?.[1];

        assert.deepEqual(
          choices?.split('|').sort(),
          option.choices.map(String).sort(),
          `${commandName} --${name}`
        );
      }
    }
  });

  test('documents the defaults supplied by option schemas', () => {
    for (const commandName of Object.keys(commandHelp) as CommandHelpName[]) {
      const help = commandHelp[commandName];
      const command = commandLineCommands.resolve(commandName.split(' '));
      const schema: OptionsSchema = command.command.options;
      const rows = optionRows([
        ...('required' in help ? help.required : []),
        ...('optional' in help ? help.optional : [])
      ]);

      for (const [name, option] of Object.entries(schema)) {
        if (option.default !== undefined) {
          assert.equal(
            rows.get(name)?.match(/\(default: ([^)]+)\)/)?.[1],
            String(option.default),
            `${commandName} --${name}`
          );
        }
      }
    }
  });
});

function optionRows(rows: readonly string[]): Map<string, string> {
  const options = new Map<string, string>();

  for (const row of rows) {
    for (const match of row.matchAll(/--([a-z][a-z\d-]*)/g)) {
      const name = match[1];

      assert.ok(name);
      options.set(name, row);

      // Строки режимов перечисляют несколько обязательных опций. В обычной
      // строке последующие --options могут быть ссылками на другие параметры.
      if (row.startsWith('--')) {
        break;
      }
    }
  }

  return options;
}
