/**
 * Модуль CLI-команды `market close-prices`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  GetClosePricesRequest,
  GetClosePricesResponse
} from '../../../generated/marketdata';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRequestOptions } from '../../args/command-options';
import { parseCommaSeparatedStringListOption, withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { closePricesFormats, formatClosePrices } from './reporter';

type ClosePricesSdk = {
  marketdata: {
    getClosePrices(request: GetClosePricesRequest): Promise<GetClosePricesResponse>;
  };
  close(): void;
};

type ClosePricesSdkFactory = (options: TInvestOptions) => ClosePricesSdk;

const closePricesCommandPath = ['market', 'close-prices'] as const;
const defaultClosePricesSdkFactory: ClosePricesSdkFactory = (options) => new TInvestNodeSDK(options);

const closePricesInstrumentIdsOptionsSchema = {
  'instrument-id': {
    type: 'string',
    required: true
  }
} as const;

const closePricesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: closePricesFormats,
    default: 'table'
  }
} as const;

const closePricesOptionsSchema = withSdkOptions(
  closePricesInstrumentIdsOptionsSchema,
  closePricesFormatOptionsSchema
);

type ClosePricesOptions = InferOptions<typeof closePricesOptionsSchema>;
type ClosePricesRequestOptions = CommandRequestOptions<ClosePricesOptions, 'instrument-id'>;

export function createClosePricesCommand(
  createSdk: ClosePricesSdkFactory = defaultClosePricesSdkFactory
) {
  return command.define({
    path: closePricesCommandPath,
    options: closePricesOptionsSchema,
    handle({ options }) {
      return runClosePricesCommand(options, createSdk);
    }
  });
}

export const closePricesCommand = createClosePricesCommand();

async function runClosePricesCommand(
  options: ClosePricesOptions,
  createSdk: ClosePricesSdkFactory
): Promise<string> {
  const request = createClosePricesRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.marketdata.getClosePrices(request);

    return formatClosePrices(response.closePrices, format);
  }
  finally {
    sdk.close();
  }
}

export { formatClosePrices };

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
