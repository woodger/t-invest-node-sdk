import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type InstrumentsRequest,
  type SharesResponse
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentStatusArgNames,
  parseInstrumentsRequest,
  parseInstrumentStatus
} from '../instruments-args';
import { formatShares, sharesFormats, type SharesFormat } from './reporter';

type SharesSdk = {
  instruments: {
    shares(request: InstrumentsRequest): Promise<SharesResponse>;
  };
  close(): void;
};

type SharesSdkFactory = (options: TinkoffInvestOptions) => SharesSdk;

const sharesArgNames = new Set([
  ...sdkOptionArgNames,
  ...instrumentStatusArgNames,
  'format'
]);

export const parseSharesInstrumentStatus = parseInstrumentStatus;
export const parseSharesRequest = parseInstrumentsRequest;

export function parseSharesFormat(argv: CliArgs): SharesFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', sharesFormats) ?? 'table';
}

export function createSharesCommand(
  createSdk: SharesSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function shares(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, sharesArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments shares');

    const request = parseSharesRequest(argv);
    const format = parseSharesFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.shares(request);

      return formatShares(response.instruments, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const shares = createSharesCommand();

export { formatShares };
