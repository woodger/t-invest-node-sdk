import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetClosePricesRequest,
  GetClosePricesResponse
} from '../../../generated/marketdata';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
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

function parseClosePricesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, closePricesCommandName, closePricesOptionsSchema);
}

export function parseClosePricesInstrumentIds(argv: CliArgs): string[] {
  const options = parseCommandOptions(
    argv,
    closePricesCommandName,
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

export function closePrices(argv: CliArgs): Promise<string> {
  return runClosePricesCommand(
    parseClosePricesOptions(argv),
    defaultClosePricesSdkFactory
  );
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
