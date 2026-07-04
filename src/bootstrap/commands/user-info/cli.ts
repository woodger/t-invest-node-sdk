/**
 * Модуль CLI-команды `users get-info`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetInfoResponse } from '../../../generated/users';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatUserInfo, userInfoFormats, type UserInfoFormat } from './reporter';

type UserInfoSdk = {
  users: {
    getInfo(request: Record<string, never>): Promise<GetInfoResponse>;
  };
  close(): void;
};

type UserInfoSdkFactory = (options: TinkoffInvestOptions) => UserInfoSdk;

const userInfoCommandPath = ['users', 'get-info'] as const;
const defaultUserInfoSdkFactory: UserInfoSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const userInfoOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: userInfoFormats,
    default: 'table'
  }
} as const);

type UserInfoOptions = InferOptions<typeof userInfoOptionsSchema>;

export function parseUserInfoFormat(rawOptions: CommandRawOptions): UserInfoFormat {
  return parseCommandOptions(rawOptions, userInfoOptionsSchema).format;
}

export function createUserInfoCommand(
  createSdk: UserInfoSdkFactory = defaultUserInfoSdkFactory
) {
  return command.define({
    path: userInfoCommandPath,
    options: userInfoOptionsSchema,
    handle({ options }) {
      return runUserInfoCommand(options, createSdk);
    }
  });
}

export const userInfoCommand = createUserInfoCommand();

async function runUserInfoCommand(
  options: UserInfoOptions,
  createSdk: UserInfoSdkFactory
): Promise<string> {
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.users.getInfo({});

    return formatUserInfo(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatUserInfo };
