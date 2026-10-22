/**
 * Модуль CLI-команды `sandbox portfolio`.
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
import type { PortfolioRequest, PortfolioResponse } from '../../../generated/operations';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createPortfolioRequest } from '../portfolio/request.mapper';
import { formatPortfolio, portfolioFormats } from '../portfolio/reporter';

type SandboxPortfolioSdk = {
  sandbox: {
    getSandboxPortfolio(request: PortfolioRequest): Promise<PortfolioResponse>;
  };
  close(): void;
};

type SandboxPortfolioSdkFactory = (
  options: TInvestOptions
) => SandboxPortfolioSdk;

export function createSandboxPortfolioCommand(
  createSdk: SandboxPortfolioSdkFactory = (options) =>
    new TInvestNodeSDK(options)
) {
  return command.define({
    path: ['sandbox', 'portfolio'] as const,
    options: withSdkOptions({
      'account-id': {
        type: 'string',
        required: true
      },
      currency: {
        type: 'string',
        choices: ['rub', 'usd', 'eur'],
        default: 'rub'
      },
      format: {
        type: 'string',
        choices: portfolioFormats,
        default: 'table'
      }
    }),
    async handle({ options }) {
      const request = createPortfolioRequest(options);
      const { format } = options;

      return runSdkCommand(options, createSdk, async (sdk) => {
        const response = await sdk.sandbox.getSandboxPortfolio(request);

        return formatPortfolio(response, format);
      });
    }
  });
}

export const sandboxPortfolioCommand = createSandboxPortfolioCommand();
