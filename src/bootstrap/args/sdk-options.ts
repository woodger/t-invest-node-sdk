/**
 * Модуль SDK options CLI-слоя нормализует общие auth/runtime параметры API-команд.
 *
 * Здесь допустимы:
 * - чтение `--token`, `--endpoint`, `--app-name`, `--insecure`;
 * - fallback на ENV для credentials/endpoint;
 * - возврат `TinkoffInvestOptions` для bootstrap command handlers.
 *
 * Здесь не должно быть создания `TinkoffInvestNodeSDK` или вызовов API.
 */

import type { TinkoffInvestOptions } from '../../application/dto/tinkoff-invest-options';
import type { CliArgs } from '../cli-contract';
import { ArgGuards } from './arg-guards';

export const sdkOptionArgNames = new Set([
  'token',
  'endpoint',
  'app-name',
  'insecure'
]);

function stringFromEnv(
  env: NodeJS.ProcessEnv,
  name: string
): string | undefined {
  const value = env[name];

  if (value === undefined || value.trim() === '') {
    return undefined;
  }

  return value;
}

function requiredCliOrEnvValue(
  cliValue: string | undefined,
  env: NodeJS.ProcessEnv,
  envName: string,
  optionName: string
): string {
  const value = cliValue ?? stringFromEnv(env, envName);

  if (value === undefined) {
    throw new Error(`Expected '--${optionName}' or ${envName}`);
  }

  return value;
}

export function resolveSdkOptions(
  argv: CliArgs,
  env: NodeJS.ProcessEnv = process.env
): TinkoffInvestOptions {
  const token = requiredCliOrEnvValue(
    ArgGuards.optionalStringArgValue(argv, 'token'),
    env,
    'TINKOFF_TOKEN',
    'token'
  );
  const endpoint = requiredCliOrEnvValue(
    ArgGuards.optionalStringArgValue(argv, 'endpoint'),
    env,
    'TINKOFF_ENDPOINT',
    'endpoint'
  );
  const appName = ArgGuards.optionalStringArgValue(argv, 'app-name');
  const insecure = ArgGuards.optionalBooleanFlagArg(argv, 'insecure');

  return {
    token,
    endpoint,
    ...(appName === undefined ? {} : { appName }),
    ...(insecure === true ? { useSsl: false } : {})
  };
}
