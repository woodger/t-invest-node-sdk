#!/usr/bin/env node

/**
 * Executable CLI entrypoint.
 *
 * Keeps the package binary in `dist/bootstrap/index.js` and delegates bootstrap
 * mechanics to the CLI runner.
 */

import { runCli } from './cli/runner';
import { warningInterceptor } from '../infrastructure/interceptor';

warningInterceptor({
  rules: [
    { messageIncludes: 'client.query() when the client is already executing' }
  ]
});

void runCli(process.argv.slice(2))
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });