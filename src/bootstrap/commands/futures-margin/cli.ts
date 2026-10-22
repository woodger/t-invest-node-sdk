/**
 * Модуль CLI-команды `instrument future margin`.
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
  GetFuturesMarginRequest,
  type GetFuturesMarginResponse
} from '../../../generated/instruments';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  instrumentIdWithDeprecatedFigiOptionsSchema,
  resolveInstrumentIdOption
} from '../../args/instrument-id-options';
import { formatFuturesMargin, futuresMarginFormats } from './reporter';

type FuturesMarginSdk = {
  instruments: {
    getFuturesMargin(
      request: GetFuturesMarginRequest
    ): Promise<GetFuturesMarginResponse>;
  };
  close(): void;
};

type FuturesMarginSdkFactory = (options: TInvestOptions) => FuturesMarginSdk;

type FuturesMarginOptions = InferOptions<typeof futuresMarginOptionsSchema>;
type FuturesMarginRequestOptions = CommandRequestOptions<
  FuturesMarginOptions,
  'instrument-id' | 'figi'
>;

const futuresMarginOptionsSchema = withSdkOptions({
  ...instrumentIdWithDeprecatedFigiOptionsSchema,
  format: {
    type: 'string',
    choices: futuresMarginFormats,
    default: 'table'
  }
});

export function createFuturesMarginCommand(
  createSdk: FuturesMarginSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'future', 'margin'] as const,
    options: futuresMarginOptionsSchema,
    async handle({ options }) {
      const request = createFuturesMarginRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.getFuturesMargin(request);

        return formatFuturesMargin(response, format);
      });
    }
  });
}

export const futuresMarginCommand = createFuturesMarginCommand();

export function createFuturesMarginRequest(
  options: FuturesMarginRequestOptions
): GetFuturesMarginRequest {
  const instrumentId = resolveInstrumentIdOption(options);

  return GetFuturesMarginRequest.create({
    instrumentId
  });
}
