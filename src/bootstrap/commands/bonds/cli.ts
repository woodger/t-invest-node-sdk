/**
 * Модуль CLI-команды `instruments bonds`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  BondsResponse,
  InstrumentsRequest
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../command';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
  instrumentStatusOptionsSchema,
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
export const createBondsRequest = createInstrumentsRequestFromOptions;

export function parseBondsFormat(rawOptions: CommandRawOptions): BondsFormat {
  return parseCommandOptions(rawOptions, bondsFormatOptionsSchema).format;
}

export function createBondsCommand(
  createSdk: BondsSdkFactory = defaultBondsSdkFactory
) {
  return command.define({
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
