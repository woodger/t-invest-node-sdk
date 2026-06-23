import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetLastPricesRequest,
  GetLastPricesResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatLastPrices, lastPricesFormats, type LastPricesFormat } from './reporter';

type LastPricesSdk = {
  marketdata: {
    getLastPrices(request: GetLastPricesRequest): Promise<GetLastPricesResponse>;
  };
  close(): void;
};

type LastPricesSdkFactory = (options: TinkoffInvestOptions) => LastPricesSdk;

const lastPricesArgNames = new Set([
  ...sdkOptionArgNames,
  'instrument-id',
  'format'
]);

export function parseLastPricesInstrumentIds(argv: CliArgs): string[] {
  return ArgGuards.requireCommaSeparatedStringListArg(argv, 'instrument-id');
}

export function parseLastPricesRequest(argv: CliArgs): GetLastPricesRequest {
  return {
    figi: [],
    instrumentId: parseLastPricesInstrumentIds(argv)
  };
}

export function parseLastPricesFormat(argv: CliArgs): LastPricesFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', lastPricesFormats) ?? 'table';
}

export function createLastPricesCommand(
  createSdk: LastPricesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function lastPrices(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, lastPricesArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'marketdata get-last-prices');

    const request = parseLastPricesRequest(argv);
    const format = parseLastPricesFormat(argv);
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
