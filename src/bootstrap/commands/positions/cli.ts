import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { PositionsRequest, PositionsResponse } from '../../../generated/operations';
import { resolveSdkOptions } from '../../args';
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
  return parseCommandOptions(argv, 'operations get-positions', positionsOptionsSchema);
}

export function parsePositionsRequest(argv: CliArgs): PositionsRequest {
  return createPositionsRequest(parsePositionsOptions(argv));
}

export function parsePositionsFormat(argv: CliArgs): PositionsFormat {
  return parseCommandOptions(
    argv,
    'operations get-positions',
    positionsFormatOptionsSchema
  ).format;
}

export function createPositionsCommand(
  createSdk: PositionsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function positions(argv: CliArgs): Promise<string> {
    const options = parsePositionsOptions(argv);
    const request = createPositionsRequest(options);
    const { format } = options;
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.operations.getPositions(request);

      return formatPositions(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const positions = createPositionsCommand();

export { formatPositions };

function createPositionsRequest(
  options: ReturnType<typeof parsePositionsOptions>
): PositionsRequest {
  return {
    accountId: options['account-id']
  };
}
