#!/usr/bin/env node

/**
 * Модуль CLI entrypoint владеет raw `process.argv`, глобальными help/version
 * shortcuts и stdout/stderr wiring.
 *
 * API-команды запускаются через `icore` command definitions; этот файл не
 * собирает промежуточный argv contract и не выполняет command-specific parsing.
 */

import { parseArgv, type OptionsSchema } from 'icore';
import { createStderrWriter } from '../infrastructure/output/stderr-writer';
import { createStdoutWriter } from '../infrastructure/output/stdout-writer';
import { resolveCommand } from './command-registry';
import { isHelpRequested, renderHelp } from './help/help';
import { renderCliHelp } from './help/renderer';
import { isVersionRequested, renderVersionInfo } from './version';

type CliWritable = {
  write(chunk: string): unknown;
};

type CliIO = {
  stdout: CliWritable;
  stderr: CliWritable;
};

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

export function parseCliInput(argv: readonly string[]) {
  return parseArgv(normalizeCliAliases(argv), bootstrapOptionsSchema);
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

function renderCommandError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.message}\n`;
  }

  return `${String(error)}\n`;
}

export async function runCli(
  argv = process.argv.slice(2),
  io: CliIO = {
    stdout: createStdoutWriter(),
    stderr: createStderrWriter()
  }
): Promise<number> {
  const normalizedArgv = normalizeCliAliases(argv);
  const parsedArgv = parseCliInput(normalizedArgv);

  // Global flags are handled before command execution, so `--help` and
  // `--version` never need SDK credentials or command-specific required flags.
  if (isHelpRequested(parsedArgv.options)) {
    io.stdout.write(renderHelp(parsedArgv.positionals));

    return 0;
  }

  if (isVersionRequested(parsedArgv.options)) {
    io.stdout.write(renderVersionInfo());

    return 0;
  }

  if (parsedArgv.positionals.length === 0) {
    io.stdout.write(renderCliHelp());

    return 0;
  }

  // Keep the raw normalized args for `icore.runCommand`; the registry only
  // resolves metadata from positionals and does not recreate a synthetic argv.
  const action = parsedArgv.positionals;
  let command;

  try {
    command = resolveCommand(action);
  }
  catch {
    io.stderr.write(`Unknown command: ${action.join(' ')}\n\n`);
    io.stderr.write(renderCliHelp());

    return 1;
  }

  try {
    const output = await command.handler(normalizedArgv);

    if (output !== undefined) {
      io.stdout.write(output);
    }

    return 0;
  }
  catch (error) {
    io.stderr.write(renderCommandError(error));
  }

  return 1;
}

if (require.main === module) {
  void runCli()
    .then((exitCode) => {
      process.exitCode = exitCode;
    })
    .catch((error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    });
}
