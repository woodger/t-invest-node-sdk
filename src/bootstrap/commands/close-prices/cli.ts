import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetClosePricesRequest,
  GetClosePricesResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import {
  parseCommaSeparatedStringListOption,
  parseCommandOptions,
  withSdkOptions
} from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { closePricesFormats, formatClosePrices, type ClosePricesFormat } from './reporter';

type ClosePricesSdk = {
  marketdata: {
    getClosePrices(request: GetClosePricesRequest): Promise<GetClosePricesResponse>;
  };
  close(): void;
};

type ClosePricesSdkFactory = (options: TinkoffInvestOptions) => ClosePricesSdk;

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

const closePricesOptionsSchema = withSdkOptions({
  ...closePricesInstrumentIdsOptionsSchema,
  ...closePricesFormatOptionsSchema
} as const);

function parseClosePricesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'marketdata get-close-prices', closePricesOptionsSchema);
}

export function parseClosePricesInstrumentIds(argv: CliArgs): string[] {
  const options = parseCommandOptions(
    argv,
    'marketdata get-close-prices',
    closePricesInstrumentIdsOptionsSchema
  );

  return parseCommaSeparatedStringListOption(options['instrument-id'], 'instrument-id');
}

export function parseClosePricesRequest(argv: CliArgs): GetClosePricesRequest {
  return createClosePricesRequest(parseClosePricesOptions(argv));
}

export function parseClosePricesFormat(argv: CliArgs): ClosePricesFormat {
  return parseCommandOptions(
    argv,
    'marketdata get-close-prices',
    closePricesFormatOptionsSchema
  ).format;
}

export function createClosePricesCommand(
  createSdk: ClosePricesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function closePrices(argv: CliArgs): Promise<string> {
    const options = parseClosePricesOptions(argv);
    const request = createClosePricesRequest(options);
    const { format } = options;
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.marketdata.getClosePrices(request);

      return formatClosePrices(response.closePrices, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const closePrices = createClosePricesCommand();

export { formatClosePrices };

function createClosePricesRequest(
  options: ReturnType<typeof parseClosePricesOptions>
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
