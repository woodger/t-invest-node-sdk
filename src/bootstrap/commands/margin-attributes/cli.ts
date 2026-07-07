/**
 * Модуль CLI-команды `account get-margin-attributes`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetMarginAttributesRequest,
  GetMarginAttributesResponse
} from '../../../generated/users';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
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

const marginAttributesCommandPath = ['account', 'get-margin-attributes'] as const;
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

type MarginAttributesOptions = InferOptions<typeof marginAttributesOptionsSchema>;
type MarginAttributesRequestOptions = CommandRequestOptions<MarginAttributesOptions, 'account-id'>;



export function parseMarginAttributesFormat(rawOptions: CommandRawOptions): MarginAttributesFormat {
  return parseCommandOptions(rawOptions, marginAttributesFormatOptionsSchema).format;
}

export function createMarginAttributesCommand(
  createSdk: MarginAttributesSdkFactory = defaultMarginAttributesSdkFactory
) {
  return command.define({
    path: marginAttributesCommandPath,
    options: marginAttributesOptionsSchema,
    handle({ options }) {
      return runMarginAttributesCommand(options, createSdk);
    }
  });
}

export const marginAttributesCommand = createMarginAttributesCommand();

async function runMarginAttributesCommand(
  options: MarginAttributesOptions,
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

export function createMarginAttributesRequest(
  options: MarginAttributesRequestOptions
): GetMarginAttributesRequest {
  return {
    accountId: options['account-id']
  };
}
