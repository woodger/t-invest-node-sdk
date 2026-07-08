/**
 * Модуль CLI-команды `instrument bond show`.
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
  BondResponse,
  InstrumentRequest
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
import { bondFormats, formatBond, type BondFormat } from './reporter';

type BondSdk = {
  instruments: {
    bondBy(request: InstrumentRequest): Promise<BondResponse>;
  };
  close(): void;
};

type BondSdkFactory = (options: TinkoffInvestOptions) => BondSdk;

const bondCommandPath = ['instrument', 'bond', 'show'] as const;
const defaultBondSdkFactory: BondSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

type BondOptions = InferOptions<typeof bondOptionsSchema>;

export const parseBondIdType = parseInstrumentLookupIdType;
export const createBondRequest = createInstrumentLookupRequestFromOptions;

export function parseBondFormat(rawOptions: CommandRawOptions): BondFormat {
  return parseCommandOptions(rawOptions, bondFormatOptionsSchema).format;
}

export function createBondCommand(
  createSdk: BondSdkFactory = defaultBondSdkFactory
) {
  return command.define({
    path: bondCommandPath,
    options: bondOptionsSchema,
    handle({ options }) {
      return runBondCommand(options, createSdk);
    }
  });
}

export const bondCommand = createBondCommand();

async function runBondCommand(
  options: BondOptions,
  createSdk: BondSdkFactory
): Promise<string> {
  const { format } = options;
  const request = createInstrumentLookupRequestFromOptions(options);
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.instruments.bondBy(request);

    return formatBond(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatBond };
