import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetMarginAttributesRequest,
  GetMarginAttributesResponse
} from '../../../generated/users';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  formatMarginAttributes,
  marginAttributesFormats,
  type MarginAttributesFormat
} from './reporter';

type MarginAttributesSdk = {
  users: {
    getMarginAttributes(request: GetMarginAttributesRequest): Promise<GetMarginAttributesResponse>;
  };
  close(): void;
};

type MarginAttributesSdkFactory = (options: TinkoffInvestOptions) => MarginAttributesSdk;

const marginAttributesArgNames = new Set([
  ...sdkOptionArgNames,
  'account-id',
  'format'
]);

export function parseMarginAttributesRequest(argv: CliArgs): GetMarginAttributesRequest {
  return {
    accountId: ArgGuards.requireStringArg(argv, 'account-id')
  };
}

export function parseMarginAttributesFormat(argv: CliArgs): MarginAttributesFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', marginAttributesFormats) ?? 'table';
}

export function createMarginAttributesCommand(
  createSdk: MarginAttributesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function marginAttributes(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, marginAttributesArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'users get-margin-attributes');

    const request = parseMarginAttributesRequest(argv);
    const format = parseMarginAttributesFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.users.getMarginAttributes(request);

      return formatMarginAttributes(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const marginAttributes = createMarginAttributesCommand();

export { formatMarginAttributes };
