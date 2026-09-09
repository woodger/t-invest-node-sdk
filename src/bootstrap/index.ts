#!/usr/bin/env node

/**
 * Исполняемая точка входа CLI сохраняет package binary в
 * `dist/bootstrap/index.js` и делегирует bootstrap-механику CLI runner-у.
 */

import { runCli } from './cli/runner';
import { installWarningInterceptor } from '../infrastructure/interceptor/warning-interceptor';

installWarningInterceptor({
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
