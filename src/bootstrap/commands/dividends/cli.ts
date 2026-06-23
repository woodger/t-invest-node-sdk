import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetDividendsRequest,
  GetDividendsResponse
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { dividendsFormats, formatDividends, type DividendsFormat } from './reporter';

type DividendsSdk = {
  instruments: {
    getDividends(request: GetDividendsRequest): Promise<GetDividendsResponse>;
  };
  close(): void;
};

type DividendsSdkFactory = (options: TinkoffInvestOptions) => DividendsSdk;

const dividendsArgNames = new Set([
  ...sdkOptionArgNames,
  'figi',
  'from',
  'to',
  'format'
]);

export function parseDividendsRequest(argv: CliArgs): GetDividendsRequest {
  const from = ArgGuards.parseDateArg(argv, 'from');
  const to = ArgGuards.parseDateArg(argv, 'to');

  if (from.getTime() > to.getTime()) {
    throw new Error("Expected '--from' to be earlier than or equal to '--to'");
  }

  return {
    figi: ArgGuards.requireStringArg(argv, 'figi'),
    from,
    to
  };
}

export function parseDividendsFormat(argv: CliArgs): DividendsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', dividendsFormats) ?? 'table';
}

export function createDividendsCommand(
  createSdk: DividendsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function dividends(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, dividendsArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments get-dividends');

    const request = parseDividendsRequest(argv);
    const format = parseDividendsFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getDividends(request);

      return formatDividends(response.dividends, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const dividends = createDividendsCommand();

export { formatDividends };
