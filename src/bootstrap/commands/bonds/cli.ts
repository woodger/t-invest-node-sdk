/**
 * Модуль CLI-команды `instrument bond list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  BondsResponse,
  InstrumentsRequest
} from '../../../generated/instruments';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
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

export function createBondsCommand(
  createSdk: BondsSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'bond', 'list'] as const,
    options: withSdkOptions({
      ...instrumentStatusOptionsSchema,
      format: {
        type: 'string',
        choices: bondsFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const { format } = options;
      const request = createInstrumentsRequestFromOptions(options);

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.bonds(request);

        return formatBonds(response.instruments, format);
      });
    }
  });
}

export const bondsCommand = createBondsCommand();
