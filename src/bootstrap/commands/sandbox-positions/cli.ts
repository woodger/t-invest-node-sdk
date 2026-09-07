/**
 * Модуль CLI-команды `sandbox position list`.
 *
 * Здесь допустимы:
 * - объявление command path и option schema;
 * - преобразование CLI options в generated request;
 * - создание SDK через bootstrap factory и закрытие SDK resource;
 *
 * Здесь не должно быть ручного table/json rendering или application report contracts.
 */

import type { TInvestOptions } from '../../../application/dto/t-invest-options';
import type { PositionsRequest, PositionsResponse } from '../../../generated/operations';
import type { InferOptions } from 'icore';
import { command } from '../../cli/contract';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRequestOptions } from '../../args/command-options';
import { withSdkOptions } from '../../args/command-options';
import { TInvestNodeSDK } from '../../t-invest-node-sdk';
import { createPositionsRequest } from '../positions/cli';
import { formatPositions, positionsFormats } from '../positions/reporter';

type SandboxPositionsSdk = {
  sandbox: {
    getSandboxPositions(request: PositionsRequest): Promise<PositionsResponse>;
  };
  close(): void;
};

type SandboxPositionsSdkFactory = (options: TInvestOptions) => SandboxPositionsSdk;

const sandboxPositionsCommandPath = ['sandbox', 'position', 'list'] as const;
const defaultSandboxPositionsSdkFactory: SandboxPositionsSdkFactory = (options) => new TInvestNodeSDK(options);

const sandboxPositionsRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  }
} as const;

const sandboxPositionsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: positionsFormats,
    default: 'table'
  }
} as const;

const sandboxPositionsOptionsSchema = withSdkOptions(
  sandboxPositionsRequestOptionsSchema,
  sandboxPositionsFormatOptionsSchema
);

type SandboxPositionsOptions = InferOptions<typeof sandboxPositionsOptionsSchema>;
type SandboxPositionsRequestOptions = CommandRequestOptions<SandboxPositionsOptions, 'account-id'>;

export function createSandboxPositionsCommand(
  createSdk: SandboxPositionsSdkFactory = defaultSandboxPositionsSdkFactory
) {
  return command.define({
    path: sandboxPositionsCommandPath,
    options: sandboxPositionsOptionsSchema,
    handle({ options }) {
      return runSandboxPositionsCommand(options, createSdk);
    }
  });
}

export const sandboxPositionsCommand = createSandboxPositionsCommand();

async function runSandboxPositionsCommand(
  options: SandboxPositionsOptions,
  createSdk: SandboxPositionsSdkFactory
): Promise<string> {
  const request = createSandboxPositionsRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.sandbox.getSandboxPositions(request);

    return formatPositions(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatPositions };

export function createSandboxPositionsRequest(
  options: SandboxPositionsRequestOptions
): PositionsRequest {
  return createPositionsRequest(options);
}
