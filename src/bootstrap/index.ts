#!/usr/bin/env node

/**
 * Исполняемая точка входа CLI сохраняет package binary в
 * `dist/bootstrap/index.js` и делегирует bootstrap-механику CLI runner-у.
 */

import { cliExitCodes } from './cli/error';
import { runCli } from './cli/runner';
import {
  installWarningInterceptor
} from '../infrastructure/interceptor/warning-interceptor';

installWarningInterceptor({
  rules: [
    { messageIncludes: 'client.query() when the client is already executing' }
  ]
});

// Node.js оставляет первые два argv-элемента для исполняемого файла и entry module.
const nodeCliArgumentStartIndex = 2;

void runCli(process.argv.slice(nodeCliArgumentStartIndex))
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = cliExitCodes.runtimeError;
  });
