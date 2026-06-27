import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetMarginAttributesRequest,
  GetMarginAttributesResponse
} from '../../../generated/users';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
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

const marginAttributesCommandName = 'users get-margin-attributes';
const marginAttributesCommandPath = ['users', 'get-margin-attributes'] as const;
const defaultMarginAttributesSdkFactory: MarginAttributesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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
  return parseCommandOptions(argv, marginAttributesCommandName, marginAttributesOptionsSchema);
}

export function parseMarginAttributesRequest(argv: CliArgs): GetMarginAttributesRequest {
  return createMarginAttributesRequest(parseMarginAttributesOptions(argv));
}

export function parseMarginAttributesFormat(argv: CliArgs): MarginAttributesFormat {
  return parseCommandOptions(
    argv,
    marginAttributesCommandName,
    marginAttributesFormatOptionsSchema
  ).format;
}

export function createMarginAttributesCommand(
  createSdk: MarginAttributesSdkFactory = defaultMarginAttributesSdkFactory
) {
  return defineCommand({
    path: marginAttributesCommandPath,
    options: marginAttributesOptionsSchema,
    handle({ options }) {
      return runMarginAttributesCommand(options, createSdk);
    }
  });
}

export function marginAttributes(argv: CliArgs): Promise<string> {
  return runMarginAttributesCommand(
    parseMarginAttributesOptions(argv),
    defaultMarginAttributesSdkFactory
  );
}

export const marginAttributesCommand = createMarginAttributesCommand();

async function runMarginAttributesCommand(
  options: ReturnType<typeof parseMarginAttributesOptions>,
  createSdk: MarginAttributesSdkFactory
): Promise<string> {
  const request = createMarginAttributesRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.users.getMarginAttributes(request);

    return formatMarginAttributes(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatMarginAttributes };

function createMarginAttributesRequest(
  options: ReturnType<typeof parseMarginAttributesOptions>
): GetMarginAttributesRequest {
  return {
    accountId: options['account-id']
  };
}
