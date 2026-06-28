import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetLastPricesRequest,
  GetLastPricesResponse
} from '../../../generated/marketdata';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../command-options';
import {
  parseCommaSeparatedStringListOption,
  parseCommandOptions,
  withSdkOptions
} from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatLastPrices, lastPricesFormats, type LastPricesFormat } from './reporter';

type LastPricesSdk = {
  marketdata: {
    getLastPrices(request: GetLastPricesRequest): Promise<GetLastPricesResponse>;
  };
  close(): void;
};

type LastPricesSdkFactory = (options: TinkoffInvestOptions) => LastPricesSdk;

const lastPricesCommandPath = ['marketdata', 'get-last-prices'] as const;
const defaultLastPricesSdkFactory: LastPricesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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


export function parseLastPricesInstrumentIds(rawOptions: CommandRawOptions): string[] {
  const options = parseCommandOptions(rawOptions, lastPricesInstrumentIdsOptionsSchema);

  return parseCommaSeparatedStringListOption(options['instrument-id'], 'instrument-id');
}


export function parseLastPricesFormat(rawOptions: CommandRawOptions): LastPricesFormat {
  return parseCommandOptions(rawOptions, lastPricesFormatOptionsSchema).format;
}

export function createLastPricesCommand(
  createSdk: LastPricesSdkFactory = defaultLastPricesSdkFactory
) {
  return defineCommand({
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
  return {
    figi: [],
    instrumentId: parseCommaSeparatedStringListOption(
      options['instrument-id'],
      'instrument-id'
    )
  };
}
