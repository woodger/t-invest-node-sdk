import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  FutureResponse,
  InstrumentRequest
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentLookupArgNames,
  parseInstrumentLookupIdType,
  parseInstrumentLookupRequest
} from '../instruments-args';
import { formatFuture, futureFormats, type FutureFormat } from './reporter';

type FutureSdk = {
  instruments: {
    futureBy(request: InstrumentRequest): Promise<FutureResponse>;
  };
  close(): void;
};

type FutureSdkFactory = (options: TinkoffInvestOptions) => FutureSdk;

const futureArgNames = new Set([
  ...sdkOptionArgNames,
  ...instrumentLookupArgNames,
  'format'
]);

export const parseFutureIdType = parseInstrumentLookupIdType;
export const parseFutureRequest = parseInstrumentLookupRequest;

export function parseFutureFormat(argv: CliArgs): FutureFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', futureFormats) ?? 'table';
}

export function createFutureCommand(
  createSdk: FutureSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function future(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, futureArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments future-by');

    const request = parseFutureRequest(argv);
    const format = parseFutureFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.futureBy(request);

      return formatFuture(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const future = createFutureCommand();

export { formatFuture };
