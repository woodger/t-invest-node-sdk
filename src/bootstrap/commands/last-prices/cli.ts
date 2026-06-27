import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetLastPricesRequest,
  GetLastPricesResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import {
  parseCommaSeparatedStringListOption,
  parseCommandOptions,
  withSdkOptions
} from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatLastPrices, lastPricesFormats, type LastPricesFormat } from './reporter';

type LastPricesSdk = {
  marketdata: {
    getLastPrices(request: GetLastPricesRequest): Promise<GetLastPricesResponse>;
  };
  close(): void;
};

type LastPricesSdkFactory = (options: TinkoffInvestOptions) => LastPricesSdk;

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

const lastPricesOptionsSchema = withSdkOptions({
  ...lastPricesInstrumentIdsOptionsSchema,
  ...lastPricesFormatOptionsSchema
} as const);

function parseLastPricesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'marketdata get-last-prices', lastPricesOptionsSchema);
}

export function parseLastPricesInstrumentIds(argv: CliArgs): string[] {
  const options = parseCommandOptions(
    argv,
    'marketdata get-last-prices',
    lastPricesInstrumentIdsOptionsSchema
  );

  return parseCommaSeparatedStringListOption(options['instrument-id'], 'instrument-id');
}

export function parseLastPricesRequest(argv: CliArgs): GetLastPricesRequest {
  return createLastPricesRequest(parseLastPricesOptions(argv));
}

export function parseLastPricesFormat(argv: CliArgs): LastPricesFormat {
  return parseCommandOptions(
    argv,
    'marketdata get-last-prices',
    lastPricesFormatOptionsSchema
  ).format;
}

export function createLastPricesCommand(
  createSdk: LastPricesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function lastPrices(argv: CliArgs): Promise<string> {
    const options = parseLastPricesOptions(argv);
    const request = createLastPricesRequest(options);
    const { format } = options;
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.marketdata.getLastPrices(request);

      return formatLastPrices(response.lastPrices, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const lastPrices = createLastPricesCommand();

export { formatLastPrices };

function createLastPricesRequest(
  options: ReturnType<typeof parseLastPricesOptions>
): GetLastPricesRequest {
  return {
    figi: [],
    instrumentId: parseCommaSeparatedStringListOption(
      options['instrument-id'],
      'instrument-id'
    )
  };
}
