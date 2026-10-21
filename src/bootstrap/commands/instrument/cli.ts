/**
 * Модуль CLI-команды `instrument show`.
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
import {
  type InstrumentRequest,
  type InstrumentResponse
} from '../../../generated/instruments';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema
} from '../../args/instruments-args';
import { formatInstrument, instrumentFormats } from './reporter';

type InstrumentSdk = {
  instruments: {
    getInstrumentBy(request: InstrumentRequest): Promise<InstrumentResponse>;
  };
  close(): void;
};

type InstrumentSdkFactory = (options: TInvestOptions) => InstrumentSdk;

export function createInstrumentCommand(
  createSdk: InstrumentSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'show'] as const,
    options: withSdkOptions({
      ...instrumentLookupOptionsSchema,
      format: {
        type: 'string',
        choices: instrumentFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const { format } = options;
      const request = createInstrumentLookupRequestFromOptions(options);

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.getInstrumentBy(request);

        return formatInstrument(response, format);
      });
    }
  });
}

export const instrumentCommand = createInstrumentCommand();
