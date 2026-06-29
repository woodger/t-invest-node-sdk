/**
 * Модуль CLI-команды `sandbox get-sandbox-portfolio`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { PortfolioRequest, PortfolioResponse } from '../../../generated/operations';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import {
  createPortfolioRequest,
  parsePortfolioCurrency
} from '../portfolio/cli';
import { formatPortfolio, portfolioFormats, type PortfolioFormat } from '../portfolio/reporter';

type SandboxPortfolioSdk = {
  sandbox: {
    getSandboxPortfolio(request: PortfolioRequest): Promise<PortfolioResponse>;
  };
  close(): void;
};

type SandboxPortfolioSdkFactory = (options: TinkoffInvestOptions) => SandboxPortfolioSdk;

const sandboxPortfolioCommandPath = ['sandbox', 'get-sandbox-portfolio'] as const;
const defaultSandboxPortfolioSdkFactory: SandboxPortfolioSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

export function parseSandboxPortfolioCurrency(rawOptions: CommandRawOptions) {
  return parsePortfolioCurrency(rawOptions);
}

export function parseSandboxPortfolioFormat(rawOptions: CommandRawOptions): PortfolioFormat {
  return parseCommandOptions(rawOptions, sandboxPortfolioFormatOptionsSchema).format;
}

export function createSandboxPortfolioCommand(
  createSdk: SandboxPortfolioSdkFactory = defaultSandboxPortfolioSdkFactory
) {
  return defineCommand({
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
