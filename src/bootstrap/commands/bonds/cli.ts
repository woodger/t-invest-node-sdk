/**
 * Модуль CLI-команды `instrument bond list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  BondsResponse,
  InstrumentsRequest
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
  instrumentStatusOptionsSchema
} from '../../args/instruments-args';
import { bondsFormats, formatBonds } from './reporter';

type BondsSdk = {
  instruments: {
    bonds(request: InstrumentsRequest): Promise<BondsResponse>;
  };
  close(): void;
};

type BondsSdkFactory = (options: TInvestOptions) => BondsSdk;

const bondsCommandPath = ['instrument', 'bond', 'list'] as const;
const defaultBondsSdkFactory: BondsSdkFactory = (options) => new TInvestNodeSDK(options);

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
