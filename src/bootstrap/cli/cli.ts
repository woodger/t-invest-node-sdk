#!/usr/bin/env node

import type { CliArgs } from '../cli-contract';
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

export function parseCliArgs(argv: string[]): CliArgs {
  const parsed: CliArgs = {
    _: []
  };

  for (const arg of argv) {
    if (arg === '--help') {
      parsed.help = true;
    }
    else if (arg === '-h') {
      parsed.h = true;
    }
    else if (arg === '--version') {
      parsed.version = true;
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

export function runCli(
  argv = process.argv.slice(2),
  io: CliIO = {
    stdout: process.stdout,
    stderr: process.stderr
  }
): number {
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

  try {
    const command = resolveCommand(action);
    const output = command.handler(parsedArgv);

    if (output !== undefined) {
      io.stdout.write(output);
    }

    return 0;
  }
  catch {
    io.stderr.write(`Unknown command: ${action}\n\n`);
    io.stderr.write(renderCliHelp());
  }

  return 1;
}

if (require.main === module) {
  process.exitCode = runCli();
}
