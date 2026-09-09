/**
 * Модуль CLI-команды `operation portfolio`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - делегирование request mapping в command-owned mapper;
 * - выполнение короткого SDK lifecycle через общий bootstrap helper;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { PortfolioRequest, PortfolioResponse } from '../../../generated/operations';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { runSdkCommand } from '../sdk-command-lifecycle';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { formatPortfolio, portfolioFormats } from './reporter';
import { createPortfolioRequest } from './request.mapper';

type PortfolioSdk = {
  operations: {
    getPortfolio(request: PortfolioRequest): Promise<PortfolioResponse>;
  };
  close(): void;
};

type PortfolioSdkFactory = (options: TInvestOptions) => PortfolioSdk;

const portfolioCommandPath = ['operation', 'portfolio'] as const;
const defaultPortfolioSdkFactory: PortfolioSdkFactory = (options) => new TInvestNodeSDK(options);

const portfolioCurrencyNames = ['rub', 'usd', 'eur'] as const;

const portfolioRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  currency: {
    type: 'string',
    choices: portfolioCurrencyNames,
    default: 'rub'
  }
} as const;

const portfolioFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: portfolioFormats,
    default: 'table'
  }
} as const;

const portfolioOptionsSchema = withSdkOptions(
  portfolioRequestOptionsSchema,
  portfolioFormatOptionsSchema
);

type PortfolioOptions = InferOptions<typeof portfolioOptionsSchema>;
export function createPortfolioCommand(
  createSdk: PortfolioSdkFactory = defaultPortfolioSdkFactory
) {
  return command.define({
    path: portfolioCommandPath,
    options: portfolioOptionsSchema,
    handle({ options }) {
      return runPortfolioCommand(options, createSdk);
    }
  });
}

export const portfolioCommand = createPortfolioCommand();

async function runPortfolioCommand(
  options: PortfolioOptions,
  createSdk: PortfolioSdkFactory
): Promise<string> {
  const request = createPortfolioRequest(options);
  const { format } = options;
  return runSdkCommand(options, createSdk, async (sdk) => {
    const response = await sdk.operations.getPortfolio(request);

    return formatPortfolio(response, format);
  });
}
