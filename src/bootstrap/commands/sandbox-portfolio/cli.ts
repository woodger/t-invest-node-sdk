/**
 * Модуль CLI-команды `sandbox portfolio`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { PortfolioRequest, PortfolioResponse } from '../../../generated/operations';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createPortfolioRequest } from '../portfolio/cli';
import { formatPortfolio, portfolioFormats } from '../portfolio/reporter';

type SandboxPortfolioSdk = {
  sandbox: {
    getSandboxPortfolio(request: PortfolioRequest): Promise<PortfolioResponse>;
  };
  close(): void;
};

type SandboxPortfolioSdkFactory = (options: TInvestOptions) => SandboxPortfolioSdk;

const sandboxPortfolioCommandPath = ['sandbox', 'portfolio'] as const;
const defaultSandboxPortfolioSdkFactory: SandboxPortfolioSdkFactory = (options) => new TInvestNodeSDK(options);

const sandboxPortfolioRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  currency: {
    type: 'string',
    choices: ['rub', 'usd', 'eur'],
    default: 'rub'
  }
} as const;

const sandboxPortfolioFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: portfolioFormats,
    default: 'table'
  }
} as const;

const sandboxPortfolioOptionsSchema = withSdkOptions(
  sandboxPortfolioRequestOptionsSchema,
  sandboxPortfolioFormatOptionsSchema
);

type SandboxPortfolioOptions = InferOptions<typeof sandboxPortfolioOptionsSchema>;
type SandboxPortfolioRequestOptions = CommandRequestOptions<
  SandboxPortfolioOptions,
  'account-id' | 'currency'
>;

export function createSandboxPortfolioCommand(
  createSdk: SandboxPortfolioSdkFactory = defaultSandboxPortfolioSdkFactory
) {
  return command.define({
    path: sandboxPortfolioCommandPath,
    options: sandboxPortfolioOptionsSchema,
    handle({ options }) {
      return runSandboxPortfolioCommand(options, createSdk);
    }
  });
}

export const sandboxPortfolioCommand = createSandboxPortfolioCommand();

async function runSandboxPortfolioCommand(
  options: SandboxPortfolioOptions,
  createSdk: SandboxPortfolioSdkFactory
): Promise<string> {
  const request = createSandboxPortfolioRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.getSandboxPortfolio(request);

    return formatPortfolio(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatPortfolio };

export function createSandboxPortfolioRequest(
  options: SandboxPortfolioRequestOptions
): PortfolioRequest {
  return createPortfolioRequest(options);
}
