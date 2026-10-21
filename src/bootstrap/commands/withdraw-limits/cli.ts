/**
 * Модуль CLI-команды `operation withdraw-limits`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - делегирование request mapping в command-owned mapper;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  WithdrawLimitsRequest,
  WithdrawLimitsResponse
} from '../../../generated/operations';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatWithdrawLimits, withdrawLimitsFormats } from './reporter';
import { createWithdrawLimitsRequest } from './request.mapper';

type WithdrawLimitsSdk = {
  operations: {
    getWithdrawLimits(
      request: WithdrawLimitsRequest
    ): Promise<WithdrawLimitsResponse>;
  };
  close(): void;
};

type WithdrawLimitsSdkFactory = (options: TInvestOptions) => WithdrawLimitsSdk;

/**
 * Описывает команду без открытия соединения; SDK создаётся при выполнении.
 * Фабрику SDK можно подменить в тестах.
 */
export function createWithdrawLimitsCommand(
  createSdk: WithdrawLimitsSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['operation', 'withdraw-limits'] as const,
    // icore проверяет опции команды вместе с общими настройками SDK.
    options: withSdkOptions({
      'account-id': {
        type: 'string',
        required: true
      },
      format: {
        type: 'string',
        choices: withdrawLimitsFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      // Общий с песочницей запрос готовим до создания SDK.
      const request = createWithdrawLimitsRequest(options);
      const { format } = options;

      // SDK закрывается после запроса и форматирования, включая ошибки.
      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.operations.getWithdrawLimits(request);

        return formatWithdrawLimits(response, format);
      });
    }
  });
}

export const withdrawLimitsCommand = createWithdrawLimitsCommand();
