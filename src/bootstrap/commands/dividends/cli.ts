import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetDividendsRequest,
  GetDividendsResponse
} from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import {
  parseCommandOptions,
  parseDateTimeOption,
  withSdkOptions
} from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { dividendsFormats, formatDividends, type DividendsFormat } from './reporter';

type DividendsSdk = {
  instruments: {
    getDividends(request: GetDividendsRequest): Promise<GetDividendsResponse>;
  };
  close(): void;
};

type DividendsSdkFactory = (options: TinkoffInvestOptions) => DividendsSdk;

const dividendsCommandName = 'instruments get-dividends';
const dividendsCommandPath = ['instruments', 'get-dividends'] as const;
const defaultDividendsSdkFactory: DividendsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const dividendsRequestOptionsSchema = {
  figi: {
    type: 'string',
    required: true
  },
  from: {
    type: 'string',
    required: true
  },
  to: {
    type: 'string',
    required: true
  }
} as const;

const dividendsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: dividendsFormats,
    default: 'table'
  }
} as const;

const dividendsOptionsSchema = withSdkOptions(
  dividendsRequestOptionsSchema,
  dividendsFormatOptionsSchema
);

function parseDividendsOptions(argv: CliArgs) {
  return parseCommandOptions(argv, dividendsCommandName, dividendsOptionsSchema);
}

export function parseDividendsRequest(argv: CliArgs): GetDividendsRequest {
  return createDividendsRequest(parseDividendsOptions(argv));
}

export function parseDividendsFormat(argv: CliArgs): DividendsFormat {
  return parseCommandOptions(
    argv,
    dividendsCommandName,
    dividendsFormatOptionsSchema
  ).format;
}

export function createDividendsCommand(
  createSdk: DividendsSdkFactory = defaultDividendsSdkFactory
) {
  return defineCommand({
    path: dividendsCommandPath,
    options: dividendsOptionsSchema,
    handle({ options }) {
      return runDividendsCommand(options, createSdk);
    }
  });
}

export const dividendsCommand = createDividendsCommand();

async function runDividendsCommand(
  options: ReturnType<typeof parseDividendsOptions>,
  createSdk: DividendsSdkFactory
): Promise<string> {
  const request = createDividendsRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getDividends(request);

    return formatDividends(response.dividends, format);
  }
  finally {
    sdk.close();
  }
}

export { formatDividends };

function createDividendsRequest(
  options: ReturnType<typeof parseDividendsOptions>
): GetDividendsRequest {
  const from = parseDateTimeOption(options.from, 'from');
  const to = parseDateTimeOption(options.to, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    figi: options.figi,
    from,
    to
  };
}
