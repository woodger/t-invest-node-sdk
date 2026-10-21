/**
 * Модуль CLI-команды `market last-prices`.
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
import {
  GetLastPricesRequest,
  type GetLastPricesResponse,
  LastPriceType
} from '../../../generated/marketdata';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import {
  parseCommaSeparatedStringListOption,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatLastPrices, lastPricesFormats } from './reporter';

type LastPricesSdk = {
  marketData: {
    getLastPrices(
      request: GetLastPricesRequest
    ): Promise<GetLastPricesResponse>;
  };
  close(): void;
};

type LastPricesSdkFactory = (options: TInvestOptions) => LastPricesSdk;

const lastPricesOptionsSchema = withSdkOptions({
  'instrument-id': {
    type: 'string',
    required: true
  },
  format: {
    type: 'string',
    choices: lastPricesFormats,
    default: 'table'
  }
});

type LastPricesOptions = InferOptions<typeof lastPricesOptionsSchema>;
type LastPricesRequestOptions = CommandRequestOptions<
  LastPricesOptions,
  'instrument-id'
>;

export function createLastPricesCommand(
  createSdk: LastPricesSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['market', 'last-prices'] as const,
    options: lastPricesOptionsSchema,
    async handle({ options }) {
      const request = createLastPricesRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.marketData.getLastPrices(request);

        return formatLastPrices(response.lastPrices, format);
      });
    }
  });
}

export const lastPricesCommand = createLastPricesCommand();

export function createLastPricesRequest(
  options: LastPricesRequestOptions
): GetLastPricesRequest {
  return GetLastPricesRequest.create({
    instrumentId: parseCommaSeparatedStringListOption(
      options['instrument-id'],
      'instrument-id'
    ),
    lastPriceType: LastPriceType.LAST_PRICE_UNSPECIFIED
  });
}
