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
  parseOptionsSubsetDetailed,
  type Output,
  type OptionsSchema,
  type RawOptionValue
} from 'icore';
import { helpCommand } from '../commands/help/cli';
import { versionCommand } from '../commands/version/cli';
import { terminalErrorPolicy } from './error';
import { isHelpRequested } from './help';
import { isVersionRequested } from './version';

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

// Служебный registry запускает быстрые вызовы через общий terminal lifecycle,
// не загружая API-команды и транспорт SDK.
const bootstrapCommands = createCommands([helpCommand, versionCommand]);

export function parseCliInput(argv: readonly string[]) {
  const parsedArgv = parseArgv(argv, bootstrapOptionsSchema);

  rejectUndocumentedLongAliases(parsedArgv.options);
  // Опции конкретной команды проверит полный registry после выбора команды.
  parseOptionsSubsetDetailed(bootstrapOptionsSchema, parsedArgv.options);

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
      throw new CliUsageError(
        `Unexpected option '--${name}'; use ${replacement}`
      );
    }
  }
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

  // Глобальные флаги обрабатываются до запуска команды, чтобы `--help` и
  // `--version` не требовали SDK credentials и обязательных опций команды.
  if (isHelpRequested(parsedArgv.options)) {
    // Разделитель сохраняет буквальные аргументы после исходного `--`.
    return bootstrapApp.run(['help', '--', ...parsedArgv.positionals], undefined);
  }

  if (isVersionRequested(parsedArgv.options)) {
    return bootstrapApp.run(['version'], undefined);
  }

  if (parsedArgv.positionals.length === 0) {
    return bootstrapApp.run(['help'], undefined);
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
    for (
      const warning of registry.resolveCommandWarnings(prepared.name, prepared.provided)
    ) {
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
