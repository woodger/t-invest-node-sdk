/**
 * Модуль CLI-команды `sandbox position list`.
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
  PositionsRequest,
  PositionsResponse
} from '../../../generated/operations';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createPositionsRequest } from '../positions/request.mapper';
import { formatPositions, positionsFormats } from '../positions/reporter';

type SandboxPositionsSdk = {
  sandbox: {
    getSandboxPositions(request: PositionsRequest): Promise<PositionsResponse>;
  };
  close(): void;
};

type SandboxPositionsSdkFactory = (
  options: TInvestOptions
) => SandboxPositionsSdk;

export function createSandboxPositionsCommand(
  createSdk: SandboxPositionsSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'position', 'list'] as const,
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
        const response = await sdk.sandbox.getSandboxPositions(request);

        return formatPositions(response, format);
      });
    }
  });
}

export const sandboxPositionsCommand = createSandboxPositionsCommand();
