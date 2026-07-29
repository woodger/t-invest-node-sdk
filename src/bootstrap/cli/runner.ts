/**
 * Модуль CLI runner владеет глобальными help/version shortcuts и
 * stdout/stderr wiring.
 *
 * API-команды запускаются через `icore` terminal app; этот файл не собирает
 * промежуточный argv contract и не выполняет command-specific parsing.
 */

import {
  CliUsageError,
  createCommands,
  createOutput,
  createTerminalApp,
  parseArgv,
  parseOptions,
  type Output,
  type OptionsSchema,
  type RawOptionValue
} from 'icore';
import { terminalErrorPolicy } from './error';
import { isHelpRequested, renderCliHelp, renderHelp } from './help';
import { isVersionRequested, renderVersionInfo } from './version';

const bootstrapOptionsSchema = {
  help: {
    type: 'boolean',
    alias: 'h'
  },
  version: {
    type: 'boolean',
    alias: 'v'
  },
  insecure: {
    type: 'boolean'
  }
} as const satisfies OptionsSchema;

const bootstrapOptionNames = Object.keys(bootstrapOptionsSchema);

// Пустой registry сохраняет единый TerminalApp error contract,
// не загружая API-команды для глобальных shortcuts.
const bootstrapCommands = createCommands([] as const);

export function parseCliInput(argv: readonly string[]) {
  const parsedArgv = parseArgv(argv, bootstrapOptionsSchema);

  rejectUndocumentedLongAliases(parsedArgv.options);
  validateBootstrapOptions(parsedArgv.options);

  return parsedArgv;
}

function rejectUndocumentedLongAliases(options: Record<string, RawOptionValue>): void {
  const replacements: Readonly<Record<string, string>> = {
    h: "'--help' or '-h'",
    'no-h': "'--help' or '-h'",
    v: "'--version' or '-v'",
    'no-v': "'--version' or '-v'"
  };

  for (const [name, replacement] of Object.entries(replacements)) {
    if (Object.hasOwn(options, name)) {
      throw new CliUsageError(`Unexpected option '--${name}'; use ${replacement}`);
    }
  }
}

function validateBootstrapOptions(options: Record<string, RawOptionValue>): void {
  const bootstrapOptions: Record<string, RawOptionValue> = {};

  for (const name of bootstrapOptionNames) {
    if (Object.hasOwn(options, name)) {
      bootstrapOptions[name] = options[name] as RawOptionValue;
    }
  }

  // Опции конкретной команды намеренно остаются у terminal app `icore`:
  // эта проверка охватывает только глобальные логические флаги runner-а.
  parseOptions(bootstrapOptionsSchema, bootstrapOptions);
}

export async function runCli(
  argv: readonly string[] = [],
  io: Output = createOutput()
): Promise<number> {
  const bootstrapApp = createTerminalApp({
    commands: bootstrapCommands,
    output: io,
    errorPolicy: terminalErrorPolicy
  });
  let parsedArgv: ReturnType<typeof parseCliInput>;

  try {
    parsedArgv = parseCliInput(argv);
    rejectUnsupportedShortcutOptions(
      parsedArgv.positionals,
      parsedArgv.options
    );
  }
  catch (error) {
    return bootstrapApp.reportError(error, {
      phase: 'external',
      args: argv
    });
  }

  const writeBootstrapOutput = async (text: string): Promise<number> => {
    try {
      await bootstrapApp.output.write(text);

      return 0;
    }
    catch (error) {
      return bootstrapApp.reportError(error, {
        phase: 'external',
        args: argv
      });
    }
  };

  // Глобальные флаги обрабатываются до запуска команды, чтобы `--help` и
  // `--version` не требовали SDK credentials и обязательных опций команды.
  if (isHelpRequested(parsedArgv.options)) {
    return writeBootstrapOutput(renderHelp(parsedArgv.positionals));
  }

  if (isVersionRequested(parsedArgv.options)) {
    return writeBootstrapOutput(renderVersionInfo());
  }

  if (parsedArgv.positionals.length === 0) {
    return writeBootstrapOutput(renderCliHelp());
  }

  let registry: typeof import('./registry.js');

  try {
    registry = await import('./registry.js');
  }
  catch (error) {
    return bootstrapApp.reportError(error, {
      phase: 'external',
      args: argv
    });
  }

  const app = createTerminalApp({
    commands: registry.commandLineCommands,
    output: io,
    errorPolicy: terminalErrorPolicy
  });
  let prepared: Awaited<ReturnType<typeof app.prepare>>;

  try {
    prepared = await app.prepare(argv);
  }
  catch (error) {
    return app.reportError(error, {
      phase: 'prepare',
      args: argv
    });
  }

  try {
    for (const warning of registry.resolveCommandWarnings(prepared.name, argv)) {
      await app.output.error(warning);
    }
  }
  catch (error) {
    return app.reportError(error, {
      phase: 'write',
      args: argv,
      prepared
    });
  }

  return app.runPrepared(prepared, undefined);
}

function rejectUnsupportedShortcutOptions(
  positionals: readonly string[],
  options: Record<string, RawOptionValue>
): void {
  if (positionals.length > 0 && !isVersionRequested(options)) {
    return;
  }

  for (const name of Object.keys(options)) {
    if (!bootstrapOptionNames.includes(name)) {
      throw new CliUsageError(`Unexpected option '--${name}'`);
    }
  }
}
