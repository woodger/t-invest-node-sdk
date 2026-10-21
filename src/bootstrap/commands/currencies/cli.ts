/**
 * Модуль CLI-команды `instrument currency list`.
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
  type CurrenciesResponse,
  type InstrumentsRequest
} from '../../../generated/instruments';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
  instrumentStatusOptionsSchema
} from '../../args/instruments-args';
import { currenciesFormats, formatCurrencies } from './reporter';

type CurrenciesSdk = {
  instruments: {
    currencies(request: InstrumentsRequest): Promise<CurrenciesResponse>;
  };
  close(): void;
};

type CurrenciesSdkFactory = (options: TInvestOptions) => CurrenciesSdk;

export function createCurrenciesCommand(
  createSdk: CurrenciesSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'currency', 'list'] as const,
    options: withSdkOptions({
      ...instrumentStatusOptionsSchema,
      format: {
        type: 'string',
        choices: currenciesFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const { format } = options;
      const request = createInstrumentsRequestFromOptions(options);

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.currencies(request);

        return formatCurrencies(response.instruments, format);
      });
    }
  });
}

export const currenciesCommand = createCurrenciesCommand();
