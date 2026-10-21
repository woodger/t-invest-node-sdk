/**
 * Модуль CLI-команды `instrument currency show`.
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
  type CurrencyResponse,
  type InstrumentRequest
} from '../../../generated/instruments';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createInstrumentLookupRequestFromOptions,
  instrumentLookupOptionsSchema
} from '../../args/instruments-args';
import { currencyFormats, formatCurrency } from './reporter';

type CurrencySdk = {
  instruments: {
    currencyBy(request: InstrumentRequest): Promise<CurrencyResponse>;
  };
  close(): void;
};

type CurrencySdkFactory = (options: TInvestOptions) => CurrencySdk;

export function createCurrencyCommand(
  createSdk: CurrencySdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'currency', 'show'] as const,
    options: withSdkOptions({
      ...instrumentLookupOptionsSchema,
      format: {
        type: 'string',
        choices: currencyFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const { format } = options;
      const request = createInstrumentLookupRequestFromOptions(options);

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.currencyBy(request);

        return formatCurrency(response, format);
      });
    }
  });
}

export const currencyCommand = createCurrencyCommand();
