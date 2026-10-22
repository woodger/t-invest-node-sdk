/**
 * Модуль CLI-команды `instrument option show`.
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
import type { InstrumentRequest, OptionResponse } from '../../../generated/instruments';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createInstrumentLookupRequestFromOptions, instrumentLookupOptionsSchema } from '../../args/instruments-args';
import { formatOption, optionFormats } from './reporter';

type OptionSdk = {
  instruments: {
    optionBy(request: InstrumentRequest): Promise<OptionResponse>;
  };
  close(): void;
};

type OptionSdkFactory = (options: TInvestOptions) => OptionSdk;

export function createOptionCommand(
  createSdk: OptionSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'option', 'show'] as const,
    options: withSdkOptions({
      ...instrumentLookupOptionsSchema,
      format: {
        type: 'string',
        choices: optionFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const { format } = options;
      const request = createInstrumentLookupRequestFromOptions(options);

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.optionBy(request);

        return formatOption(response, format);
      });
    }
  });
}

export const optionCommand = createOptionCommand();
