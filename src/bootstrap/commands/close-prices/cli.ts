import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetClosePricesRequest,
  GetClosePricesResponse
} from '../../../generated/marketdata';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-mechanics';
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

const closePricesCommandName = 'marketdata get-close-prices';
const closePricesCommandPath = ['marketdata', 'get-close-prices'] as const;
const defaultClosePricesSdkFactory: ClosePricesSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

function parseClosePricesOptions(rawOptions: CommandRawOptions) {
  return parseCommandOptions(rawOptions, closePricesCommandName, closePricesOptionsSchema);
}

export function parseClosePricesInstrumentIds(rawOptions: CommandRawOptions): string[] {
  const options = parseCommandOptions(
    rawOptions,
    closePricesCommandName,
    closePricesInstrumentIdsOptionsSchema
  );

  return parseCommaSeparatedStringListOption(options['instrument-id'], 'instrument-id');
}

export function parseClosePricesRequest(rawOptions: CommandRawOptions): GetClosePricesRequest {
  return createClosePricesRequest(parseClosePricesOptions(rawOptions));
}

export function parseClosePricesFormat(rawOptions: CommandRawOptions): ClosePricesFormat {
  return parseCommandOptions(
    rawOptions,
    closePricesCommandName,
    closePricesFormatOptionsSchema
  ).format;
}

export function createClosePricesCommand(
  createSdk: ClosePricesSdkFactory = defaultClosePricesSdkFactory
) {
  return defineCommand({
    path: closePricesCommandPath,
    options: closePricesOptionsSchema,
    handle({ options }) {
      return runClosePricesCommand(options, createSdk);
    }
  });
}

export const closePricesCommand = createClosePricesCommand();

async function runClosePricesCommand(
  options: ReturnType<typeof parseClosePricesOptions>,
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
