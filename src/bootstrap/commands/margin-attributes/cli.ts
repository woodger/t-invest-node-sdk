import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetMarginAttributesRequest,
  GetMarginAttributesResponse
} from '../../../generated/users';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
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

const marginAttributesRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  }
} as const;

const marginAttributesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: marginAttributesFormats,
    default: 'table'
  }
} as const;

const marginAttributesOptionsSchema = withSdkOptions(
  marginAttributesRequestOptionsSchema,
  marginAttributesFormatOptionsSchema
);

function parseMarginAttributesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'users get-margin-attributes', marginAttributesOptionsSchema);
}

export function parseMarginAttributesRequest(argv: CliArgs): GetMarginAttributesRequest {
  return createMarginAttributesRequest(parseMarginAttributesOptions(argv));
}

export function parseMarginAttributesFormat(argv: CliArgs): MarginAttributesFormat {
  return parseCommandOptions(
    argv,
    'users get-margin-attributes',
    marginAttributesFormatOptionsSchema
  ).format;
}

export function createMarginAttributesCommand(
  createSdk: MarginAttributesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function marginAttributes(argv: CliArgs): Promise<string> {
    const options = parseMarginAttributesOptions(argv);
    const request = createMarginAttributesRequest(options);
    const { format } = options;
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

function createMarginAttributesRequest(
  options: ReturnType<typeof parseMarginAttributesOptions>
): GetMarginAttributesRequest {
  return {
    accountId: options['account-id']
  };
}
