import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { PositionsRequest, PositionsResponse } from '../../../generated/operations';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatPositions, positionsFormats, type PositionsFormat } from './reporter';

type PositionsSdk = {
  operations: {
    getPositions(request: PositionsRequest): Promise<PositionsResponse>;
  };
  close(): void;
};

type PositionsSdkFactory = (options: TinkoffInvestOptions) => PositionsSdk;

const positionsCommandName = 'operations get-positions';
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

function parsePositionsOptions(argv: CliArgs) {
  return parseCommandOptions(argv, positionsCommandName, positionsOptionsSchema);
}

export function parsePositionsRequest(argv: CliArgs): PositionsRequest {
  return createPositionsRequest(parsePositionsOptions(argv));
}

export function parsePositionsFormat(argv: CliArgs): PositionsFormat {
  return parseCommandOptions(
    argv,
    positionsCommandName,
    positionsFormatOptionsSchema
  ).format;
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

export function positions(argv: CliArgs): Promise<string> {
  return runPositionsCommand(
    parsePositionsOptions(argv),
    defaultPositionsSdkFactory
  );
}

export const positionsCommand = createPositionsCommand();

async function runPositionsCommand(
  options: ReturnType<typeof parsePositionsOptions>,
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

function createPositionsRequest(
  options: ReturnType<typeof parsePositionsOptions>
): PositionsRequest {
  return {
    accountId: options['account-id']
  };
}
