/**
 * Модуль SDK options CLI-слоя нормализует общие auth/runtime параметры API-команд.
 *
 * Здесь допустимы:
 * - чтение `--token`, `--endpoint`, `--app-name`, `--insecure`;
 * - fallback на ENV для credentials/endpoint;
 * - возврат `TInvestOptions` для bootstrap command handlers.
 *
 * Здесь не должно быть создания `TInvestNodeSDK` или вызовов API.
 */

import type { TInvestOptions } from '../../application/dto/t-invest-options';
import { CliUsageError } from 'icore';

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

  if (value === undefined || value.trim() === '') {
    throw new CliUsageError(`Expected '--${optionName}' or ${envName}`);
  }

  return value;
}

export function resolveSdkOptionsFromCommandOptions(
  options: SdkCommandOptions,
  env: NodeJS.ProcessEnv = process.env
): TInvestOptions {
  const token = requiredCliOrEnvValue(
    options.token,
    env,
    'T_INVEST_TOKEN',
    'token'
  );
  const endpoint = requiredCliOrEnvValue(
    options.endpoint,
    env,
    'T_INVEST_ENDPOINT',
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
