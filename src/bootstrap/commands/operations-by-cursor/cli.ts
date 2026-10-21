/**
 * Модуль CLI-команды `operation page`.
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
import {
  type GetOperationsByCursorRequest,
  type GetOperationsByCursorResponse
} from '../../../generated/operations';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  formatOperationsByCursor,
  operationsByCursorFormats
} from './reporter';
import { createOperationsByCursorRequest } from './request.mapper';

type OperationsByCursorSdk = {
  operations: {
    getOperationsByCursor(
      request: GetOperationsByCursorRequest
    ): Promise<GetOperationsByCursorResponse>;
  };
  close(): void;
};

type OperationsByCursorSdkFactory = (
  options: TInvestOptions
) => OperationsByCursorSdk;

const operationStateNames = [
  'unspecified',
  'executed',
  'canceled',
  'progress'
] as const;

export function createOperationsByCursorCommand(
  createSdk: OperationsByCursorSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['operation', 'page'] as const,
    options: withSdkOptions({
      'account-id': {
        type: 'string',
        required: true
      },
      'instrument-id': {
        type: 'string'
      },
      from: {
        type: 'string'
      },
      to: {
        type: 'string'
      },
      cursor: {
        type: 'string'
      },
      limit: {
        type: 'string'
      },
      'operation-type': {
        type: 'string'
      },
      state: {
        type: 'string',
        choices: operationStateNames,
        default: 'unspecified'
      },
      'without-commissions': {
        type: 'boolean',
        default: false
      },
      'without-trades': {
        type: 'boolean',
        default: false
      },
      'without-overnights': {
        type: 'boolean',
        default: false
      },
      format: {
        type: 'string',
        choices: operationsByCursorFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const request = createOperationsByCursorRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.operations.getOperationsByCursor(request);

        return formatOperationsByCursor(response, format);
      });
    }
  });
}

export const operationsByCursorCommand = createOperationsByCursorCommand();
