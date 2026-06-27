import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetInfoResponse } from '../../../generated/users';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
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

const userInfoCommandName = 'users get-info';
const userInfoCommandPath = ['users', 'get-info'] as const;
const defaultUserInfoSdkFactory: UserInfoSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const userInfoOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: userInfoFormats,
    default: 'table'
  }
} as const);

function parseUserInfoOptions(argv: CliArgs) {
  return parseCommandOptions(argv, userInfoCommandName, userInfoOptionsSchema);
}

export function parseUserInfoFormat(argv: CliArgs): UserInfoFormat {
  return parseUserInfoOptions(argv).format;
}

export function createUserInfoCommand(
  createSdk: UserInfoSdkFactory = defaultUserInfoSdkFactory
) {
  return defineCommand({
    path: userInfoCommandPath,
    options: userInfoOptionsSchema,
    handle({ options }) {
      return runUserInfoCommand(options, createSdk);
    }
  });
}

export const userInfoCommand = createUserInfoCommand();

async function runUserInfoCommand(
  options: ReturnType<typeof parseUserInfoOptions>,
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
