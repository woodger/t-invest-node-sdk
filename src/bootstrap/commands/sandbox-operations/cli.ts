/**
 * Модуль CLI-команды `sandbox operation list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - переиспользование общего production/Sandbox request mapper-а;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report
 * contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type {
  OperationsRequest,
  OperationsResponse
} from '../../../generated/operations';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import {
  instrumentIdWithDeprecatedFigiOptionsSchema
} from '../../args/instrument-id-options';
import { createOperationsRequest } from '../operations/request.mapper';
import { formatOperations, operationsFormats } from '../operations/reporter';

type SandboxOperationsSdk = {
  sandbox: {
    getSandboxOperations(
      request: OperationsRequest
    ): Promise<OperationsResponse>;
  };
  close(): void;
};

type SandboxOperationsSdkFactory = (
  options: TInvestOptions
) => SandboxOperationsSdk;

export function createSandboxOperationsCommand(
  createSdk: SandboxOperationsSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'operation', 'list'] as const,
    options: withSdkOptions({
      'account-id': {
        type: 'string',
        required: true
      },
      from: {
        type: 'string',
        required: true
      },
      to: {
        type: 'string',
        required: true
      },
      ...instrumentIdWithDeprecatedFigiOptionsSchema,
      state: {
        type: 'string',
        choices: ['unspecified', 'executed', 'canceled', 'progress'],
        default: 'unspecified'
      },
      format: {
        type: 'string',
        choices: operationsFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const request = createOperationsRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.sandbox.getSandboxOperations(request);

        return formatOperations(response.operations, format);
      });
    }
  });
}

export const sandboxOperationsCommand = createSandboxOperationsCommand();
