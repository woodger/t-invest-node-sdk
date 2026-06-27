import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  BondResponse,
  InstrumentRequest
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
import { bondFormats, formatBond, type BondFormat } from './reporter';

type BondSdk = {
  instruments: {
    bondBy(request: InstrumentRequest): Promise<BondResponse>;
  };
  close(): void;
};

type BondSdkFactory = (options: TinkoffInvestOptions) => BondSdk;

const bondFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: bondFormats,
    default: 'table'
  }
} as const;

const bondOptionsSchema = withSdkOptions(
  instrumentLookupOptionsSchema,
  bondFormatOptionsSchema
);

function parseBondOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments bond-by', bondOptionsSchema);
}

export const parseBondIdType = parseInstrumentLookupIdType;
export const parseBondRequest = parseInstrumentLookupRequest;

export function parseBondFormat(argv: CliArgs): BondFormat {
  return parseCommandOptions(
    argv,
    'instruments bond-by',
    bondFormatOptionsSchema
  ).format;
}

export function createBondCommand(
  createSdk: BondSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function bond(argv: CliArgs): Promise<string> {
    const { format } = parseBondOptions(argv);
    const request = parseBondRequest(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.bondBy(request);

      return formatBond(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const bond = createBondCommand();

export { formatBond };
