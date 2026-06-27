import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  BondsResponse,
  InstrumentsRequest
} from '../../../generated/instruments';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  instrumentStatusOptionsSchema,
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

const bondsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: bondsFormats,
    default: 'table'
  }
} as const;

const bondsOptionsSchema = withSdkOptions(
  instrumentStatusOptionsSchema,
  bondsFormatOptionsSchema
);

function parseBondsOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'instruments bonds', bondsOptionsSchema);
}

export const parseBondsInstrumentStatus = parseInstrumentStatus;
export const parseBondsRequest = parseInstrumentsRequest;

export function parseBondsFormat(argv: CliArgs): BondsFormat {
  return parseCommandOptions(
    argv,
    'instruments bonds',
    bondsFormatOptionsSchema
  ).format;
}

export function createBondsCommand(
  createSdk: BondsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function bonds(argv: CliArgs): Promise<string> {
    const { format } = parseBondsOptions(argv);
    const request = parseBondsRequest(argv);
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
