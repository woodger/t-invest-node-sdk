import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import { InstrumentType } from '../../../generated/common';
import type { FindInstrumentRequest, FindInstrumentResponse } from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
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

function parseFindInstrumentOptions(argv: CliArgs) {
  return parseCommandOptions(
    argv,
    'instruments find-instrument',
    findInstrumentOptionsSchema
  );
}

export function parseFindInstrumentKind(argv: CliArgs): InstrumentType {
  const instrumentKind = parseCommandOptions(
    argv,
    'instruments find-instrument',
    { 'instrument-kind': findInstrumentRequestOptionsSchema['instrument-kind'] } as const
  )['instrument-kind'];

  return instrumentKinds[instrumentKind as InstrumentKindName];
}

export function parseFindInstrumentRequest(argv: CliArgs): FindInstrumentRequest {
  return createFindInstrumentRequest(parseFindInstrumentOptions(argv));
}

export function parseFindInstrumentFormat(argv: CliArgs): FindInstrumentFormat {
  return parseCommandOptions(
    argv,
    'instruments find-instrument',
    findInstrumentFormatOptionsSchema
  ).format;
}

export function createFindInstrumentCommand(
  createSdk: FindInstrumentSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function findInstrument(argv: CliArgs): Promise<string> {
    const options = parseFindInstrumentOptions(argv);
    const request = createFindInstrumentRequest(options);
    const { format } = options;
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.findInstrument(request);

      return formatFindInstrument(response.instruments, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const findInstrument = createFindInstrumentCommand();

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
