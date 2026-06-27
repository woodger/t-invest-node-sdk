import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetLastPricesRequest,
  GetLastPricesResponse
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
import { formatLastPrices, lastPricesFormats, type LastPricesFormat } from './reporter';

type LastPricesSdk = {
  marketdata: {
    getLastPrices(request: GetLastPricesRequest): Promise<GetLastPricesResponse>;
  };
  close(): void;
};

type LastPricesSdkFactory = (options: TinkoffInvestOptions) => LastPricesSdk;

const lastPricesCommandName = 'marketdata get-last-prices';
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

function parseLastPricesOptions(argv: CliArgs) {
  return parseCommandOptions(argv, lastPricesCommandName, lastPricesOptionsSchema);
}

export function parseLastPricesInstrumentIds(argv: CliArgs): string[] {
  const options = parseCommandOptions(
    argv,
    lastPricesCommandName,
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
    lastPricesCommandName,
    lastPricesFormatOptionsSchema
  ).format;
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

export function lastPrices(argv: CliArgs): Promise<string> {
  return runLastPricesCommand(
    parseLastPricesOptions(argv),
    defaultLastPricesSdkFactory
  );
}

export const lastPricesCommand = createLastPricesCommand();

async function runLastPricesCommand(
  options: ReturnType<typeof parseLastPricesOptions>,
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
