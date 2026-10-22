/**
 * Модуль CLI-команды `instrument share list`.
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
import { type InstrumentsRequest, type SharesResponse } from '../../../generated/instruments';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  createInstrumentsRequestFromOptions,
  instrumentStatusOptionsSchema
} from '../../args/instruments-args';
import { formatShares, sharesFormats } from './reporter';

type SharesSdk = {
  instruments: {
    shares(request: InstrumentsRequest): Promise<SharesResponse>;
  };
  close(): void;
};

type SharesSdkFactory = (options: TInvestOptions) => SharesSdk;

export function createSharesCommand(
  createSdk: SharesSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['instrument', 'share', 'list'] as const,
    options: withSdkOptions({
      ...instrumentStatusOptionsSchema,
      format: {
        type: 'string',
        choices: sharesFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const { format } = options;
      const request = createInstrumentsRequestFromOptions(options);

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.instruments.shares(request);

        return formatShares(response.instruments, format);
      });
    }
  });
}

export const sharesCommand = createSharesCommand();
