import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetUserTariffResponse } from '../../../generated/users';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-mechanics';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
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
  return defineCommand({
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
