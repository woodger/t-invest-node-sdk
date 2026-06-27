import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  InstrumentRequest,
  OptionResponse
} from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentLookupOptionsSchema,
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

const optionFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: optionFormats,
    default: 'table'
  }
} as const;

const optionOptionsSchema = withSdkOptions({
  ...instrumentLookupOptionsSchema,
  ...optionFormatOptionsSchema
} as const);

function parseOptionOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments option-by', optionOptionsSchema);
}

export const parseOptionIdType = parseInstrumentLookupIdType;
export const parseOptionRequest = parseInstrumentLookupRequest;

export function parseOptionFormat(argv: CliArgs): OptionFormat {
  return parseCommandOptions(
    argv,
    'instruments option-by',
    optionFormatOptionsSchema
  ).format;
}

export function createOptionCommand(
  createSdk: OptionSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function option(argv: CliArgs): Promise<string> {
    const { format } = parseOptionOptions(argv);
    const request = parseOptionRequest(argv);
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
