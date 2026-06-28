import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { PositionsRequest, PositionsResponse } from '../../../generated/operations';
import { defineCommand, type InferOptions } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions, CommandRequestOptions } from '../../command-options';
import { parseCommandOptions, withSdkOptions } from '../../command-options';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatPositions, positionsFormats, type PositionsFormat } from './reporter';

type PositionsSdk = {
  operations: {
    getPositions(request: PositionsRequest): Promise<PositionsResponse>;
  };
  close(): void;
};

type PositionsSdkFactory = (options: TinkoffInvestOptions) => PositionsSdk;

const positionsCommandPath = ['operations', 'get-positions'] as const;
const defaultPositionsSdkFactory: PositionsSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const positionsRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  }
} as const;

const positionsFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: positionsFormats,
    default: 'table'
  }
} as const;

const positionsOptionsSchema = withSdkOptions(
  positionsRequestOptionsSchema,
  positionsFormatOptionsSchema
);

type PositionsOptions = InferOptions<typeof positionsOptionsSchema>;
type PositionsRequestOptions = CommandRequestOptions<PositionsOptions, 'account-id'>;



export function parsePositionsFormat(rawOptions: CommandRawOptions): PositionsFormat {
  return parseCommandOptions(rawOptions, positionsFormatOptionsSchema).format;
}

export function createPositionsCommand(
  createSdk: PositionsSdkFactory = defaultPositionsSdkFactory
) {
  return defineCommand({
    path: positionsCommandPath,
    options: positionsOptionsSchema,
    handle({ options }) {
      return runPositionsCommand(options, createSdk);
    }
  });
}

export const positionsCommand = createPositionsCommand();

async function runPositionsCommand(
  options: PositionsOptions,
  createSdk: PositionsSdkFactory
): Promise<string> {
  const request = createPositionsRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.operations.getPositions(request);

    return formatPositions(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatPositions };

export function createPositionsRequest(
  options: PositionsRequestOptions
): PositionsRequest {
  return {
    accountId: options['account-id']
  };
}
