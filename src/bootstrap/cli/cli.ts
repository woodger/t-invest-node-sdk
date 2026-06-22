#!/usr/bin/env node

import type { CliArgs } from '../cli-contract';
import { createStderrWriter } from '../../infrastructure/output/stderr-writer';
import { createStdoutWriter } from '../../infrastructure/output/stdout-writer';
import { resolveCommand } from '../command-registry';
import { isHelpRequested, renderCliHelp, renderHelp } from '../help';
import { isVersionRequested, renderVersionInfo } from '../version';

type CliWritable = {
  write(chunk: string): unknown;
};

type CliIO = {
  stdout: CliWritable;
  stderr: CliWritable;
};

const booleanOptionNames = new Set([
  'help',
  'version',
  'insecure'
]);

export function parseCliArgs(argv: string[]): CliArgs {
  const parsed: CliArgs = {
    _: []
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg.startsWith('--')) {
      const option = arg.slice(2);
      const separatorIndex = option.indexOf('=');
      const name = separatorIndex === -1
        ? option
        : option.slice(0, separatorIndex);
      let value: string | boolean = separatorIndex === -1
        ? true
        : option.slice(separatorIndex + 1);

      if (name === '') {
        parsed._.push(arg);
      }
      else {
        const nextArg = argv[index + 1];

        if (
          value === true &&
          !booleanOptionNames.has(name) &&
          nextArg !== undefined &&
          !nextArg.startsWith('-')
        ) {
          value = nextArg;
          index += 1;
        }

        parsed[name] = value;
      }
    }
    else if (arg === '-h') {
      parsed.h = true;
    }
    else if (arg === '-v') {
      parsed.v = true;
    }
    else {
      parsed._.push(arg);
    }
  }

  return parsed;
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

  const action = parsedArgv._[0] ?? 'help';
  let command;

  try {
    command = resolveCommand(action);
  }
  catch {
    io.stderr.write(`Unknown command: ${action}\n\n`);
    io.stderr.write(renderCliHelp());

    return 1;
  }

  try {
    const output = await command.handler(parsedArgv);

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
