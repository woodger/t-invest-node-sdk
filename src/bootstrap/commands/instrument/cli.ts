/**
 * Модуль CLI-команды `instrument show`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import {
  type InstrumentRequest,
  type InstrumentResponse
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../args/command-options';
import { parseCommandOptions, withSdkOptions } from '../../args/command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema,
  parseInstrumentLookupIdType,
} from '../../args/instruments-args';
import { formatInstrument, instrumentFormats, type InstrumentFormat } from './reporter';

type InstrumentSdk = {
  instruments: {
    getInstrumentBy(request: InstrumentRequest): Promise<InstrumentResponse>;
  };
  close(): void;
};

type InstrumentSdkFactory = (options: TinkoffInvestOptions) => InstrumentSdk;

const instrumentCommandPath = ['instrument', 'show'] as const;
const defaultInstrumentSdkFactory: InstrumentSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const instrumentFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: instrumentFormats,
    default: 'table'
  }
} as const;

const instrumentOptionsSchema = withSdkOptions(
  instrumentLookupOptionsSchema,
  instrumentFormatOptionsSchema
);

type InstrumentOptions = InferOptions<typeof instrumentOptionsSchema>;

export const parseInstrumentIdType = parseInstrumentLookupIdType;
export const createInstrumentRequest = createInstrumentLookupRequestFromOptions;

export function parseInstrumentFormat(rawOptions: CommandRawOptions): InstrumentFormat {
  return parseCommandOptions(rawOptions, instrumentFormatOptionsSchema).format;
}

export function createInstrumentCommand(
  createSdk: InstrumentSdkFactory = defaultInstrumentSdkFactory
) {
  return command.define({
    path: instrumentCommandPath,
    options: instrumentOptionsSchema,
    handle({ options }) {
      return runInstrumentCommand(options, createSdk);
    }
  });
}

export const instrumentCommand = createInstrumentCommand();

async function runInstrumentCommand(
  options: InstrumentOptions,
  createSdk: InstrumentSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentLookupRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.getInstrumentBy(request);

    return formatInstrument(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatInstrument };
