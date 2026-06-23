import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  BondResponse,
  InstrumentRequest
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentLookupArgNames,
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

const bondArgNames = new Set([
  ...sdkOptionArgNames,
  ...instrumentLookupArgNames,
  'format'
]);

export const parseBondIdType = parseInstrumentLookupIdType;
export const parseBondRequest = parseInstrumentLookupRequest;

export function parseBondFormat(argv: CliArgs): BondFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', bondFormats) ?? 'table';
}

export function createBondCommand(
  createSdk: BondSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function bond(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, bondArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments bond-by');

    const request = parseBondRequest(argv);
    const format = parseBondFormat(argv);
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
