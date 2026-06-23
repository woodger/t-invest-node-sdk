import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  InstrumentRequest,
  OptionResponse
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentLookupArgNames,
  parseInstrumentLookupIdType,
  parseInstrumentLookupRequest
} from '../instruments-args';
import { formatOption, optionFormats, type OptionFormat } from './reporter';

type OptionSdk = {
  instruments: {
    optionBy(request: InstrumentRequest): Promise<OptionResponse>;
  };
  close(): void;
};

type OptionSdkFactory = (options: TinkoffInvestOptions) => OptionSdk;

const optionArgNames = new Set([
  ...sdkOptionArgNames,
  ...instrumentLookupArgNames,
  'format'
]);

export const parseOptionIdType = parseInstrumentLookupIdType;
export const parseOptionRequest = parseInstrumentLookupRequest;

export function parseOptionFormat(argv: CliArgs): OptionFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', optionFormats) ?? 'table';
}

export function createOptionCommand(
  createSdk: OptionSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function option(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, optionArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments option-by');

    const request = parseOptionRequest(argv);
    const format = parseOptionFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.optionBy(request);

      return formatOption(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const option = createOptionCommand();

export { formatOption };
