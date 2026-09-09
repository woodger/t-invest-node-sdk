/**
 * Модуль CLI-команды `instrument bond show`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  BondResponse,
  InstrumentRequest
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema
} from '../../args/instruments-args';
import { bondFormats, formatBond } from './reporter';

type BondSdk = {
  instruments: {
    bondBy(request: InstrumentRequest): Promise<BondResponse>;
  };
  close(): void;
};

type BondSdkFactory = (options: TInvestOptions) => BondSdk;

const bondCommandPath = ['instrument', 'bond', 'show'] as const;
const defaultBondSdkFactory: BondSdkFactory = (options) => new TInvestNodeSDK(options);

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
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.instruments.bondBy(request);

    return formatBond(response, format);
  });
}
