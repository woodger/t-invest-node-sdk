import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type InstrumentRequest,
  type InstrumentResponse
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentLookupArgNames,
  parseInstrumentLookupIdType,
  parseInstrumentLookupRequest
} from '../instruments-args';
import { formatInstrument, instrumentFormats, type InstrumentFormat } from './reporter';

type InstrumentSdk = {
  instruments: {
    getInstrumentBy(request: InstrumentRequest): Promise<InstrumentResponse>;
  };
  close(): void;
};

type InstrumentSdkFactory = (options: TinkoffInvestOptions) => InstrumentSdk;

const instrumentArgNames = new Set([
  ...sdkOptionArgNames,
  ...instrumentLookupArgNames,
  'format'
]);

export const parseInstrumentIdType = parseInstrumentLookupIdType;
export const parseInstrumentRequest = parseInstrumentLookupRequest;

export function parseInstrumentFormat(argv: CliArgs): InstrumentFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', instrumentFormats) ?? 'table';
}

export function createInstrumentCommand(
  createSdk: InstrumentSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function instrument(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, instrumentArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments get-instrument-by');

    const request = parseInstrumentRequest(argv);
    const format = parseInstrumentFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getInstrumentBy(request);

      return formatInstrument(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const instrument = createInstrumentCommand();

export { formatInstrument };
