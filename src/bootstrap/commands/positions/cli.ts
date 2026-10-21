/**
 * Модуль CLI-команды `operation positions`.
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
  PositionsRequest,
  PositionsResponse
} from '../../../generated/operations';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatPositions, positionsFormats } from './reporter';
import { createPositionsRequest } from './request.mapper';

type PositionsSdk = {
  operations: {
    getPositions(request: PositionsRequest): Promise<PositionsResponse>;
  };
  close(): void;
};

type PositionsSdkFactory = (options: TInvestOptions) => PositionsSdk;

export function createPositionsCommand(
  createSdk: PositionsSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['operation', 'positions'] as const,
    options: withSdkOptions({
      'account-id': {
        type: 'string',
        required: true
      },
      format: {
        type: 'string',
        choices: positionsFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const request = createPositionsRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.operations.getPositions(request);

        return formatPositions(response, format);
      });
    }
  });
}

export const positionsCommand = createPositionsCommand();
