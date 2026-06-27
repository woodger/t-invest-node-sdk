import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType } from '../../../generated/common';
import type { FindInstrumentRequest, FindInstrumentResponse } from '../../../generated/instruments';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-mechanics';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  findInstrumentFormats,
  formatFindInstrument,
  type FindInstrumentFormat
} from './reporter';

type FindInstrumentSdk = {
  instruments: {
    findInstrument(request: FindInstrumentRequest): Promise<FindInstrumentResponse>;
  };
  close(): void;
};

type FindInstrumentSdkFactory = (options: TinkoffInvestOptions) => FindInstrumentSdk;

const findInstrumentCommandName = 'instruments find-instrument';
const findInstrumentCommandPath = ['instruments', 'find-instrument'] as const;
const defaultFindInstrumentSdkFactory: FindInstrumentSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

export const findInstrumentKindNames = Object.keys(instrumentKinds) as Array<keyof typeof instrumentKinds>;

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

function parseFindInstrumentOptions(rawOptions: CommandRawOptions) {
  return parseCommandOptions(
    rawOptions,
    findInstrumentCommandName,
    findInstrumentOptionsSchema
  );
}

export function parseFindInstrumentKind(rawOptions: CommandRawOptions): InstrumentType {
  const instrumentKind = parseCommandOptions(
    rawOptions,
    findInstrumentCommandName,
    { 'instrument-kind': findInstrumentRequestOptionsSchema['instrument-kind'] } as const
  )['instrument-kind'];

  return instrumentKinds[instrumentKind as InstrumentKindName];
}

export function parseFindInstrumentRequest(rawOptions: CommandRawOptions): FindInstrumentRequest {
  return createFindInstrumentRequest(parseFindInstrumentOptions(rawOptions));
}

export function parseFindInstrumentFormat(rawOptions: CommandRawOptions): FindInstrumentFormat {
  return parseCommandOptions(
    rawOptions,
    findInstrumentCommandName,
    findInstrumentFormatOptionsSchema
  ).format;
}

export function createFindInstrumentCommand(
  createSdk: FindInstrumentSdkFactory = defaultFindInstrumentSdkFactory
) {
  return defineCommand({
    path: findInstrumentCommandPath,
    options: findInstrumentOptionsSchema,
    handle({ options }) {
      return runFindInstrumentCommand(options, createSdk);
    }
  });
}

export const findInstrumentCommand = createFindInstrumentCommand();

async function runFindInstrumentCommand(
  options: ReturnType<typeof parseFindInstrumentOptions>,
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

function createFindInstrumentRequest(
  options: ReturnType<typeof parseFindInstrumentOptions>
): FindInstrumentRequest {
  return {
    query: options.query,
    instrumentKind: instrumentKinds[options['instrument-kind'] as InstrumentKindName],
    apiTradeAvailableFlag: options['api-trade-available']
  };
}
