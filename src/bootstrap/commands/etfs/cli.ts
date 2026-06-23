import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  EtfsResponse,
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
import { etfsFormats, formatEtfs, type EtfsFormat } from './reporter';

type EtfsSdk = {
  instruments: {
    etfs(request: InstrumentsRequest): Promise<EtfsResponse>;
  };
  close(): void;
};

type EtfsSdkFactory = (options: TinkoffInvestOptions) => EtfsSdk;

const etfsArgNames = new Set([
  ...sdkOptionArgNames,
  ...instrumentStatusArgNames,
  'format'
]);

export const parseEtfsInstrumentStatus = parseInstrumentStatus;
export const parseEtfsRequest = parseInstrumentsRequest;

export function parseEtfsFormat(argv: CliArgs): EtfsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', etfsFormats) ?? 'table';
}

export function createEtfsCommand(
  createSdk: EtfsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function etfs(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, etfsArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments etfs');

    const request = parseEtfsRequest(argv);
    const format = parseEtfsFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.etfs(request);

      return formatEtfs(response.instruments, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const etfs = createEtfsCommand();

export { formatEtfs };
