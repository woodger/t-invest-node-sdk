/**
 * Модуль CLI-команды `market last-prices`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  GetLastPricesRequest,
  type GetLastPricesResponse,
  LastPriceType
} from '../../../generated/marketdata';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../args/command-options';
import {
  parseCommaSeparatedStringListOption,
  parseCommandOptions,
  withSdkOptions
} from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatLastPrices, lastPricesFormats, type LastPricesFormat } from './reporter';

type LastPricesSdk = {
  marketdata: {
    getLastPrices(request: GetLastPricesRequest): Promise<GetLastPricesResponse>;
  };
  close(): void;
};

type LastPricesSdkFactory = (options: TInvestOptions) => LastPricesSdk;

const lastPricesCommandPath = ['market', 'last-prices'] as const;
const defaultLastPricesSdkFactory: LastPricesSdkFactory = (options) => new TInvestNodeSDK(options);

const lastPricesInstrumentIdsOptionsSchema = {
  'instrument-id': {
    type: 'string',
    required: true
  }
} as const;

const lastPricesFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: lastPricesFormats,
    default: 'table'
  }
} as const;

const lastPricesOptionsSchema = withSdkOptions(
  lastPricesInstrumentIdsOptionsSchema,
  lastPricesFormatOptionsSchema
);

type LastPricesOptions = InferOptions<typeof lastPricesOptionsSchema>;
type LastPricesRequestOptions = CommandRequestOptions<LastPricesOptions, 'instrument-id'>;

export function parseLastPricesFormat(rawOptions: CommandRawOptions): LastPricesFormat {
  return parseCommandOptions(rawOptions, lastPricesFormatOptionsSchema).format;
}

export function createLastPricesCommand(
  createSdk: LastPricesSdkFactory = defaultLastPricesSdkFactory
) {
  return command.define({
    path: lastPricesCommandPath,
    options: lastPricesOptionsSchema,
    handle({ options }) {
      return runLastPricesCommand(options, createSdk);
    }
  });
}

export const lastPricesCommand = createLastPricesCommand();

async function runLastPricesCommand(
  options: LastPricesOptions,
  createSdk: LastPricesSdkFactory
): Promise<string> {
  const request = createLastPricesRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.marketdata.getLastPrices(request);

    return formatLastPrices(response.lastPrices, format);
  }
  finally {
    sdk.close();
  }
}

export { formatLastPrices };

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
