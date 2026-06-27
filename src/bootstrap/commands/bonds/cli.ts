import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  BondsResponse,
  InstrumentsRequest
} from '../../../generated/instruments';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
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

const bondsCommandName = 'instruments bonds';
const bondsCommandPath = ['instruments', 'bonds'] as const;
const defaultBondsSdkFactory: BondsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

type BondsOptions = InferOptions<typeof bondsOptionsSchema>;

export const parseBondsInstrumentStatus = parseInstrumentStatus;
export const parseBondsRequest = parseInstrumentsRequest;

export function parseBondsFormat(argv: CliArgs): BondsFormat {
  return parseCommandOptions(
    argv,
    bondsCommandName,
    bondsFormatOptionsSchema
  ).format;
}

export function createBondsCommand(
  createSdk: BondsSdkFactory = defaultBondsSdkFactory
) {
  return defineCommand({
    path: bondsCommandPath,
    options: bondsOptionsSchema,
    handle({ options }) {
      return runBondsCommand(options, createSdk);
    }
  });
}

export const bondsCommand = createBondsCommand();

async function runBondsCommand(
  options: BondsOptions,
  createSdk: BondsSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentsRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.bonds(request);

    return formatBonds(response.instruments, format);
  }
  finally {
    sdk.close();
  }
}

export { formatBonds };
