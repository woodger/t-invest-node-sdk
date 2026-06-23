import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetUserTariffResponse } from '../../../generated/users';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatUserTariff, userTariffFormats, type UserTariffFormat } from './reporter';

type UserTariffSdk = {
  users: {
    getUserTariff(request: Record<string, never>): Promise<GetUserTariffResponse>;
  };
  close(): void;
};

type UserTariffSdkFactory = (options: TinkoffInvestOptions) => UserTariffSdk;

const userTariffArgNames = new Set([
  ...sdkOptionArgNames,
  'format'
]);

export function parseUserTariffFormat(argv: CliArgs): UserTariffFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', userTariffFormats) ?? 'table';
}

export function createUserTariffCommand(
  createSdk: UserTariffSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function userTariff(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, userTariffArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'users get-user-tariff');

    const format = parseUserTariffFormat(argv);
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
