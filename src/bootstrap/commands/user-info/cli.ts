/**
 * Модуль CLI-команды `account info`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { GetInfoResponse } from '../../../generated/users';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatUserInfo, userInfoFormats } from './reporter';

type UserInfoSdk = {
  users: {
    getInfo(request: Record<string, never>): Promise<GetInfoResponse>;
  };
  close(): void;
};

type UserInfoSdkFactory = (options: TInvestOptions) => UserInfoSdk;

const userInfoCommandPath = ['account', 'info'] as const;
const defaultUserInfoSdkFactory: UserInfoSdkFactory = (options) => new TInvestNodeSDK(options);

const userInfoOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: userInfoFormats,
    default: 'table'
  }
} as const);

type UserInfoOptions = InferOptions<typeof userInfoOptionsSchema>;

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
