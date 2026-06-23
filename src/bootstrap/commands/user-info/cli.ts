import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetInfoResponse } from '../../../generated/users';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatUserInfo, userInfoFormats, type UserInfoFormat } from './reporter';

type UserInfoSdk = {
  users: {
    getInfo(request: Record<string, never>): Promise<GetInfoResponse>;
  };
  close(): void;
};

type UserInfoSdkFactory = (options: TinkoffInvestOptions) => UserInfoSdk;

const userInfoArgNames = new Set([
  ...sdkOptionArgNames,
  'format'
]);

export function parseUserInfoFormat(argv: CliArgs): UserInfoFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', userInfoFormats) ?? 'table';
}

export function createUserInfoCommand(
  createSdk: UserInfoSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function userInfo(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, userInfoArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'users get-info');

    const format = parseUserInfoFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.users.getInfo({});

      return formatUserInfo(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const userInfo = createUserInfoCommand();

export { formatUserInfo };
