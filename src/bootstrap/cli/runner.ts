/**
 * Модуль CLI runner владеет глобальными help/version shortcuts и
 * stdout/stderr wiring.
 *
 * API-команды запускаются через `icore` terminal app; этот файл не собирает
 * промежуточный argv contract и не выполняет command-specific parsing.
 */

import {
  createOutput,
  createTerminalApp,
  parseArgv,
  parseOptions,
  type Output,
  type OptionsSchema,
  type RawOptionValue
} from 'icore';
import {
  commandLineCommands,
  resolveCommand,
  resolveCommandWarnings
} from './registry';
import { renderCommandError } from './error';
import { isHelpRequested, renderCliHelp, renderHelp } from './help';
import { isVersionRequested, renderVersionInfo } from './version';

const bootstrapOptionsSchema = {
  help: {
    type: 'boolean'
  },
  h: {
    type: 'boolean'
  },
  version: {
    type: 'boolean'
  },
  v: {
    type: 'boolean'
  },
  insecure: {
    type: 'boolean'
  }
} as const satisfies OptionsSchema;

const bootstrapOptionNames = Object.keys(bootstrapOptionsSchema);

export function parseCliInput(argv: readonly string[]) {
  return parseNormalizedCliInput(normalizeCliAliases(argv));
}

function parseNormalizedCliInput(argv: readonly string[]) {
  const parsedArgv = parseArgv(argv, bootstrapOptionsSchema);

  validateBootstrapOptions(parsedArgv.options);

  return parsedArgv;
}

function validateBootstrapOptions(options: Record<string, RawOptionValue>): void {
  const bootstrapOptions: Record<string, RawOptionValue> = {};

  for (const name of bootstrapOptionNames) {
    if (Object.hasOwn(options, name)) {
      bootstrapOptions[name] = options[name] as RawOptionValue;
    }
  }

  // Command-specific options are intentionally left to the `icore` terminal app.
  // This check validates only global boolean flags handled by this runner.
  parseOptions(bootstrapOptionsSchema, bootstrapOptions);
}

function normalizeCliAliases(argv: readonly string[]): string[] {
  // `icore` parses long options only; normalize public short aliases before
  // command resolution so every later layer sees one option shape.
  return argv.map((arg) => {
    if (arg === '-h') {
      return '--h';
    }

    if (arg === '-v') {
      return '--v';
    }

    return arg;
  });
}

export async function runCli(
  argv: readonly string[] = [],
  io: Output = createOutput()
): Promise<number> {
  const normalizedArgv = normalizeCliAliases(argv);
  let parsedArgv: ReturnType<typeof parseCliInput>;

  try {
    parsedArgv = parseNormalizedCliInput(normalizedArgv);
  }
  catch (error) {
    await io.error(renderCommandError(error));

    return 1;
  }

  // Global flags are handled before command execution, so `--help` and
  // `--version` never need SDK credentials or command-specific required flags.
  if (isHelpRequested(parsedArgv.options)) {
    await io.write(renderHelp(parsedArgv.positionals));

    return 0;
  }

  if (isVersionRequested(parsedArgv.options)) {
    await io.write(renderVersionInfo());

    return 0;
  }

  if (parsedArgv.positionals.length === 0) {
    await io.write(renderCliHelp());

    return 0;
  }

  // Keep raw normalized args for the terminal app; command lookup here only
  // preserves the SDK-specific unknown-command message and warning policy.
  const action = parsedArgv.positionals;
  let command;

  try {
    command = resolveCommand(action);
  }
  catch {
    await io.error(`Unknown command: ${action.join(' ')}\n\n`);
    await io.error(renderCliHelp());

    return 1;
  }

  try {
    for (const warning of resolveCommandWarnings(command.name, normalizedArgv)) {
      await io.error(warning);
    }

    const app = createTerminalApp({
      commands: commandLineCommands,
      output: io
    });

    return app.run(normalizedArgv, undefined);
  }
  catch (error) {
    await io.error(renderCommandError(error));
  }

  return 1;
}
