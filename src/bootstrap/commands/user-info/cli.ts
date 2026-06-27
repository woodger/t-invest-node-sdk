import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetInfoResponse } from '../../../generated/users';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatUserInfo, userInfoFormats, type UserInfoFormat } from './reporter';

type UserInfoSdk = {
  users: {
    getInfo(request: Record<string, never>): Promise<GetInfoResponse>;
  };
  close(): void;
};

type UserInfoSdkFactory = (options: TinkoffInvestOptions) => UserInfoSdk;

const userInfoOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: userInfoFormats,
    default: 'table'
  }
} as const);

function parseUserInfoOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'users get-info', userInfoOptionsSchema);
}

export function parseUserInfoFormat(argv: CliArgs): UserInfoFormat {
  return parseUserInfoOptions(argv).format;
}

export function createUserInfoCommand(
  createSdk: UserInfoSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function userInfo(argv: CliArgs): Promise<string> {
    const { format } = parseUserInfoOptions(argv);
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
