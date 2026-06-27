#!/usr/bin/env node

import type { CliArgs } from './cli-contract';
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

export function parseCliArgs(argv: string[]): CliArgs {
  const parsed = parseArgv(normalizeCliAliases(argv), bootstrapOptionsSchema);

  return {
    _: parsed.positionals,
    ...parsed.options
  };
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
  const parsedArgv = parseCliArgs(argv);

  if (isHelpRequested(parsedArgv)) {
    io.stdout.write(renderHelp(parsedArgv));

    return 0;
  }

  if (isVersionRequested(parsedArgv)) {
    io.stdout.write(renderVersionInfo());

    return 0;
  }

  const action = parsedArgv._.length === 0 ? ['help'] : parsedArgv._;
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
    const output = await command.handler({
      ...parsedArgv,
      _: [
        command.name,
        ...parsedArgv._.slice(command.path.length)
      ]
    });

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
