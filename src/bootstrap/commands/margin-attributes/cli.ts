/**
 * Модуль CLI-команды `account margin`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { GetMarginAttributesRequest, GetMarginAttributesResponse } from '../../../generated/users';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatMarginAttributes, marginAttributesFormats } from './reporter';

type MarginAttributesSdk = {
  users: {
    getMarginAttributes(
      request: GetMarginAttributesRequest
    ): Promise<GetMarginAttributesResponse>;
  };
  close(): void;
};

type MarginAttributesSdkFactory = (
  options: TInvestOptions
) => MarginAttributesSdk;

type MarginAttributesOptions = InferOptions<
  typeof marginAttributesOptionsSchema
>;
type MarginAttributesRequestOptions = CommandRequestOptions<
  MarginAttributesOptions,
  'account-id'
>;

const marginAttributesOptionsSchema = withSdkOptions({
  'account-id': {
    type: 'string',
    required: true
  },
  format: {
    type: 'string',
    choices: marginAttributesFormats,
    default: 'table'
  }
});

export function createMarginAttributesCommand(
  createSdk: MarginAttributesSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['account', 'margin'] as const,
    options: marginAttributesOptionsSchema,
    async handle({ options }) {
      const request = createMarginAttributesRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.users.getMarginAttributes(request);

        return formatMarginAttributes(response, format);
      });
    }
  });
}

export const marginAttributesCommand = createMarginAttributesCommand();

export function createMarginAttributesRequest(
  options: MarginAttributesRequestOptions
): GetMarginAttributesRequest {
  return {
    accountId: options['account-id']
  };
}
