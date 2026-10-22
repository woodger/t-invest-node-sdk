/**
 * Модуль CLI-команды `instrument etf show`.
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
import type { EtfResponse, InstrumentRequest } from '../../../generated/instruments';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema
} from '../../args/instruments-args';
import { etfFormats, formatEtf } from './reporter';

type EtfSdk = {
  instruments: {
    etfBy(request: InstrumentRequest): Promise<EtfResponse>;
  };
  close(): void;
};

type EtfSdkFactory = (options: TInvestOptions) => EtfSdk;

export function createEtfCommand(
  createSdk: EtfSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'etf', 'show'] as const,
    options: withSdkOptions({
      ...instrumentLookupOptionsSchema,
      format: {
        type: 'string',
        choices: etfFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const { format } = options;
      const request = createInstrumentLookupRequestFromOptions(options);

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.etfBy(request);

        return formatEtf(response, format);
      });
    }
  });
}

export const etfCommand = createEtfCommand();
