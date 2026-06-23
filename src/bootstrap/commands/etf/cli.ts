import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  EtfResponse,
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
import { etfFormats, formatEtf, type EtfFormat } from './reporter';

type EtfSdk = {
  instruments: {
    etfBy(request: InstrumentRequest): Promise<EtfResponse>;
  };
  close(): void;
};

type EtfSdkFactory = (options: TinkoffInvestOptions) => EtfSdk;

const etfArgNames = new Set([
  ...sdkOptionArgNames,
  ...instrumentLookupArgNames,
  'format'
]);

export const parseEtfIdType = parseInstrumentLookupIdType;
export const parseEtfRequest = parseInstrumentLookupRequest;

export function parseEtfFormat(argv: CliArgs): EtfFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', etfFormats) ?? 'table';
}

export function createEtfCommand(
  createSdk: EtfSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function etf(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, etfArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments etf-by');

    const request = parseEtfRequest(argv);
    const format = parseEtfFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.etfBy(request);

      return formatEtf(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const etf = createEtfCommand();

export { formatEtf };
