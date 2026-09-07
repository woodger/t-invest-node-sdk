/**
 * Модуль CLI-команды `instrument search`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import {
  InstrumentType } from '../../../generated/common';
import type { FindInstrumentRequest,
  FindInstrumentResponse
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { findInstrumentFormats, formatFindInstrument } from './reporter';

type FindInstrumentSdk = {
  instruments: {
    findInstrument(request: FindInstrumentRequest): Promise<FindInstrumentResponse>;
  };
  close(): void;
};

type FindInstrumentSdkFactory = (options: TInvestOptions) => FindInstrumentSdk;

const findInstrumentCommandPath = ['instrument', 'search'] as const;
const defaultFindInstrumentSdkFactory: FindInstrumentSdkFactory = (options) => new TInvestNodeSDK(options);

const instrumentKinds = {
  unspecified: InstrumentType.INSTRUMENT_TYPE_UNSPECIFIED,
  bond: InstrumentType.INSTRUMENT_TYPE_BOND,
  share: InstrumentType.INSTRUMENT_TYPE_SHARE,
  currency: InstrumentType.INSTRUMENT_TYPE_CURRENCY,
  etf: InstrumentType.INSTRUMENT_TYPE_ETF,
  futures: InstrumentType.INSTRUMENT_TYPE_FUTURES,
  sp: InstrumentType.INSTRUMENT_TYPE_SP,
  option: InstrumentType.INSTRUMENT_TYPE_OPTION,
  'clearing-certificate': InstrumentType.INSTRUMENT_TYPE_CLEARING_CERTIFICATE
} as const;

const findInstrumentKindNames = Object.keys(instrumentKinds) as Array<keyof typeof instrumentKinds>;

type InstrumentKindName = typeof findInstrumentKindNames[number];

const findInstrumentRequestOptionsSchema = {
  query: {
    type: 'string',
    required: true
  },
  'instrument-kind': {
    type: 'string',
    choices: findInstrumentKindNames,
    default: 'unspecified'
  },
  'api-trade-available': {
    type: 'boolean',
    default: false
  }
} as const;

const findInstrumentFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: findInstrumentFormats,
    default: 'table'
  }
} as const;

const findInstrumentOptionsSchema = withSdkOptions(
  findInstrumentRequestOptionsSchema,
  findInstrumentFormatOptionsSchema
);

type FindInstrumentOptions = InferOptions<typeof findInstrumentOptionsSchema>;
type FindInstrumentRequestOptions = CommandRequestOptions<FindInstrumentOptions, 'instrument-kind' | 'api-trade-available' | 'query'>;

export function createFindInstrumentCommand(
  createSdk: FindInstrumentSdkFactory = defaultFindInstrumentSdkFactory
) {
  return command.define({
    path: findInstrumentCommandPath,
    options: findInstrumentOptionsSchema,
    handle({ options }) {
      return runFindInstrumentCommand(options, createSdk);
    }
  });
}

export const findInstrumentCommand = createFindInstrumentCommand();

async function runFindInstrumentCommand(
  options: FindInstrumentOptions,
  createSdk: FindInstrumentSdkFactory
): Promise<string> {
  const request = createFindInstrumentRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.findInstrument(request);

    return formatFindInstrument(response.instruments, format);
  }
  finally {
    sdk.close();
  }
}

export { formatFindInstrument };

export function createFindInstrumentRequest(
  options: FindInstrumentRequestOptions
): FindInstrumentRequest {
  return {
    query: options.query,
    instrumentKind: instrumentKinds[options['instrument-kind'] as InstrumentKindName],
    apiTradeAvailableFlag: options['api-trade-available']
  };
}
