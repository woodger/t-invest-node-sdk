import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetFuturesMarginRequest,
  GetFuturesMarginResponse
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  formatFuturesMargin,
  futuresMarginFormats,
  type FuturesMarginFormat
} from './reporter';

type FuturesMarginSdk = {
  instruments: {
    getFuturesMargin(request: GetFuturesMarginRequest): Promise<GetFuturesMarginResponse>;
  };
  close(): void;
};

type FuturesMarginSdkFactory = (options: TinkoffInvestOptions) => FuturesMarginSdk;

const futuresMarginArgNames = new Set([
  ...sdkOptionArgNames,
  'figi',
  'format'
]);

export function parseFuturesMarginRequest(argv: CliArgs): GetFuturesMarginRequest {
  return {
    figi: ArgGuards.requireStringArg(argv, 'figi')
  };
}

export function parseFuturesMarginFormat(argv: CliArgs): FuturesMarginFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', futuresMarginFormats) ?? 'table';
}

export function createFuturesMarginCommand(
  createSdk: FuturesMarginSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function futuresMargin(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, futuresMarginArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments get-futures-margin');

    const request = parseFuturesMarginRequest(argv);
    const format = parseFuturesMarginFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.getFuturesMargin(request);

      return formatFuturesMargin(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const futuresMargin = createFuturesMarginCommand();

export { formatFuturesMargin };
