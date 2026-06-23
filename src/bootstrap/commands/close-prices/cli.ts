import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetClosePricesRequest,
  GetClosePricesResponse
} from '../../../generated/marketdata';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { closePricesFormats, formatClosePrices, type ClosePricesFormat } from './reporter';

type ClosePricesSdk = {
  marketdata: {
    getClosePrices(request: GetClosePricesRequest): Promise<GetClosePricesResponse>;
  };
  close(): void;
};

type ClosePricesSdkFactory = (options: TinkoffInvestOptions) => ClosePricesSdk;

const closePricesArgNames = new Set([
  ...sdkOptionArgNames,
  'instrument-id',
  'format'
]);

export function parseClosePricesInstrumentIds(argv: CliArgs): string[] {
  return ArgGuards.requireCommaSeparatedStringListArg(argv, 'instrument-id');
}

export function parseClosePricesRequest(argv: CliArgs): GetClosePricesRequest {
  return {
    instruments: parseClosePricesInstrumentIds(argv).map((instrumentId) => ({
      instrumentId
    }))
  };
}

export function parseClosePricesFormat(argv: CliArgs): ClosePricesFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', closePricesFormats) ?? 'table';
}

export function createClosePricesCommand(
  createSdk: ClosePricesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function closePrices(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, closePricesArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'marketdata get-close-prices');

    const request = parseClosePricesRequest(argv);
    const format = parseClosePricesFormat(argv);
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
