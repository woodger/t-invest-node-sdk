/**
 * Модуль CLI-команды `users get-user-tariff`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetUserTariffResponse } from '../../../generated/users';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatUserTariff, userTariffFormats, type UserTariffFormat } from './reporter';

type UserTariffSdk = {
  users: {
    getUserTariff(request: Record<string, never>): Promise<GetUserTariffResponse>;
  };
  close(): void;
};

type UserTariffSdkFactory = (options: TinkoffInvestOptions) => UserTariffSdk;

const userTariffCommandPath = ['users', 'get-user-tariff'] as const;
const defaultUserTariffSdkFactory: UserTariffSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const userTariffOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: userTariffFormats,
    default: 'table'
  }
} as const);

type UserTariffOptions = InferOptions<typeof userTariffOptionsSchema>;

export function parseUserTariffFormat(rawOptions: CommandRawOptions): UserTariffFormat {
  return parseCommandOptions(rawOptions, userTariffOptionsSchema).format;
}

export function createUserTariffCommand(
  createSdk: UserTariffSdkFactory = defaultUserTariffSdkFactory
) {
  return command.define({
    path: userTariffCommandPath,
    options: userTariffOptionsSchema,
    handle({ options }) {
      return runUserTariffCommand(options, createSdk);
    }
  });
}

export const userTariffCommand = createUserTariffCommand();

async function runUserTariffCommand(
  options: UserTariffOptions,
  createSdk: UserTariffSdkFactory
): Promise<string> {
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.users.getUserTariff({});

    return formatUserTariff(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatUserTariff };
