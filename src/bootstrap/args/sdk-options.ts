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
import { CliUsageError } from '../cli/usage-error';

type SdkCommandOptions = {
  token?: string | undefined;
  endpoint?: string | undefined;
  'app-name'?: string | undefined;
  insecure?: boolean | undefined;
};

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
    throw new CliUsageError(`Expected '--${optionName}' or ${envName}`);
  }

  return value;
}

export function resolveSdkOptionsFromCommandOptions(
  options: SdkCommandOptions,
  env: NodeJS.ProcessEnv = process.env
): TinkoffInvestOptions {
  const token = requiredCliOrEnvValue(
    options.token,
    env,
    'TINKOFF_TOKEN',
    'token'
  );
  const endpoint = requiredCliOrEnvValue(
    options.endpoint,
    env,
    'TINKOFF_ENDPOINT',
    'endpoint'
  );
  const appName = options['app-name'];
  const insecure = options.insecure;

  return {
    token,
    endpoint,
    ...(appName === undefined ? {} : { appName }),
    ...(insecure === true ? { useSsl: false } : {})
  };
}
