import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  InstrumentRequest,
  OptionResponse
} from '../../../generated/instruments';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
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

const optionCommandName = 'instruments option-by';
const optionCommandPath = ['instruments', 'option-by'] as const;
const defaultOptionSdkFactory: OptionSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const optionFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: optionFormats,
    default: 'table'
  }
} as const;

const optionOptionsSchema = withSdkOptions(
  instrumentLookupOptionsSchema,
  optionFormatOptionsSchema
);

type OptionOptions = InferOptions<typeof optionOptionsSchema>;

export const parseOptionIdType = parseInstrumentLookupIdType;
export const parseOptionRequest = parseInstrumentLookupRequest;

export function parseOptionFormat(argv: CliArgs): OptionFormat {
  return parseCommandOptions(
    argv,
    optionCommandName,
    optionFormatOptionsSchema
  ).format;
}

export function createOptionCommand(
  createSdk: OptionSdkFactory = defaultOptionSdkFactory
) {
  return defineCommand({
    path: optionCommandPath,
    options: optionOptionsSchema,
    handle({ options }) {
      return runOptionCommand(options, createSdk);
    }
  });
}

export const optionCommand = createOptionCommand();

async function runOptionCommand(
  options: OptionOptions,
  createSdk: OptionSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentLookupRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.optionBy(request);

    return formatOption(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatOption };
