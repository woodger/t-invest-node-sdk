import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  BondsResponse,
  InstrumentsRequest
} from '../../../generated/instruments';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentStatusArgNames,
  parseInstrumentsRequest,
  parseInstrumentStatus
} from '../instruments-args';
import { bondsFormats, formatBonds, type BondsFormat } from './reporter';

type BondsSdk = {
  instruments: {
    bonds(request: InstrumentsRequest): Promise<BondsResponse>;
  };
  close(): void;
};

type BondsSdkFactory = (options: TinkoffInvestOptions) => BondsSdk;

const bondsArgNames = new Set([
  ...sdkOptionArgNames,
  ...instrumentStatusArgNames,
  'format'
]);

export const parseBondsInstrumentStatus = parseInstrumentStatus;
export const parseBondsRequest = parseInstrumentsRequest;

export function parseBondsFormat(argv: CliArgs): BondsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', bondsFormats) ?? 'table';
}

export function createBondsCommand(
  createSdk: BondsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function bonds(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, bondsArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'instruments bonds');

    const request = parseBondsRequest(argv);
    const format = parseBondsFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.instruments.bonds(request);

      return formatBonds(response.instruments, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const bonds = createBondsCommand();

export { formatBonds };
