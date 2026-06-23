import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  FuturesResponse,
  InstrumentsRequest
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentStatusArgNames,
  parseInstrumentsRequest,
  parseInstrumentStatus
} from '../instruments-args';
import { formatFutures, futuresFormats, type FuturesFormat } from './reporter';

type FuturesSdk = {
  instruments: {
    futures(request: InstrumentsRequest): Promise<FuturesResponse>;
  };
  close(): void;
};

type FuturesSdkFactory = (options: TinkoffInvestOptions) => FuturesSdk;

const futuresArgNames = new Set([
  ...sdkOptionArgNames,
  ...instrumentStatusArgNames,
  'format'
]);

export const parseFuturesInstrumentStatus = parseInstrumentStatus;
export const parseFuturesRequest = parseInstrumentsRequest;

export function parseFuturesFormat(argv: CliArgs): FuturesFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', futuresFormats) ?? 'table';
}

export function createFuturesCommand(
  createSdk: FuturesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function futures(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, futuresArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments futures');

    const request = parseFuturesRequest(argv);
    const format = parseFuturesFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.futures(request);

      return formatFutures(response.instruments, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const futures = createFuturesCommand();

export { formatFutures };
