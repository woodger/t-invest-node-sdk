#!/usr/bin/env node

/**
 * Executable CLI entrypoint.
 *
 * Keeps the package binary at `dist/cli.js` and delegates bootstrap mechanics
 * to the CLI runner.
 */

import { runCli } from './bootstrap/cli-runner';

void runCli(process.argv.slice(2))
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
