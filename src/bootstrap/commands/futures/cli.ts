/**
 * Модуль CLI-команды `instrument future list`.
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
import type { FuturesResponse, InstrumentsRequest } from '../../../generated/instruments';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createInstrumentsRequestFromOptions, instrumentStatusOptionsSchema } from '../../args/instruments-args';
import { formatFutures, futuresFormats } from './reporter';

type FuturesSdk = {
  instruments: {
    futures(request: InstrumentsRequest): Promise<FuturesResponse>;
  };
  close(): void;
};

type FuturesSdkFactory = (options: TInvestOptions) => FuturesSdk;

export function createFuturesCommand(
  createSdk: FuturesSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'future', 'list'] as const,
    options: withSdkOptions({
      ...instrumentStatusOptionsSchema,
      format: {
        type: 'string',
        choices: futuresFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const { format } = options;
      const request = createInstrumentsRequestFromOptions(options);

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.futures(request);

        return formatFutures(response.instruments, format);
      });
    }
  });
}

export const futuresCommand = createFuturesCommand();
