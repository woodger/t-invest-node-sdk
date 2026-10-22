/**
 * Модуль CLI-команды `market close-prices`.
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
import type { GetClosePricesRequest, GetClosePricesResponse } from '../../../generated/marketdata';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { parseCommaSeparatedStringListOption, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { closePricesFormats, formatClosePrices } from './reporter';

type ClosePricesSdk = {
  marketData: {
    getClosePrices(request: GetClosePricesRequest): Promise<GetClosePricesResponse>;
  };
  close(): void;
};

type ClosePricesSdkFactory = (options: TInvestOptions) => ClosePricesSdk;

type ClosePricesOptions = InferOptions<typeof closePricesOptionsSchema>;
type ClosePricesRequestOptions = CommandRequestOptions<ClosePricesOptions, 'instrument-id'>;

const closePricesOptionsSchema = withSdkOptions({
  'instrument-id': {
    type: 'string',
    required: true
  },
  format: {
    type: 'string',
    choices: closePricesFormats,
    default: 'table'
  }
});

export function createClosePricesCommand(
  createSdk: ClosePricesSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['market', 'close-prices'] as const,
    options: closePricesOptionsSchema,
    async handle({ options }) {
      const request = createClosePricesRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.marketData.getClosePrices(request);

        return formatClosePrices(response.closePrices, format);
      });
    }
  });
}

export const closePricesCommand = createClosePricesCommand();

export function createClosePricesRequest(
  options: ClosePricesRequestOptions
): GetClosePricesRequest {
  return {
    instruments: parseCommaSeparatedStringListOption(
      options['instrument-id'],
      'instrument-id'
    ).map((instrumentId) => ({
      instrumentId
    }))
  };
}
