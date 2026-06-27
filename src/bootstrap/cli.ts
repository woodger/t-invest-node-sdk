#!/usr/bin/env node

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
