import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetUserTariffResponse } from '../../../generated/users';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

const userTariffOptionsSchema = withSdkOptions({
  format: {
    type: 'string',
    choices: userTariffFormats,
    default: 'table'
  }
} as const);

function parseUserTariffOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'users get-user-tariff', userTariffOptionsSchema);
}

export function parseUserTariffFormat(argv: CliArgs): UserTariffFormat {
  return parseUserTariffOptions(argv).format;
}

export function createUserTariffCommand(
  createSdk: UserTariffSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function userTariff(argv: CliArgs): Promise<string> {
    const { format } = parseUserTariffOptions(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.users.getUserTariff({});

      return formatUserTariff(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const userTariff = createUserTariffCommand();

export { formatUserTariff };
