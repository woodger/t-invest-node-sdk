import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { PositionsRequest, PositionsResponse } from '../../../generated/operations';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatPositions, positionsFormats, type PositionsFormat } from './reporter';

type PositionsSdk = {
  operations: {
    getPositions(request: PositionsRequest): Promise<PositionsResponse>;
  };
  close(): void;
};

type PositionsSdkFactory = (options: TinkoffInvestOptions) => PositionsSdk;

const positionsArgNames = new Set([
  ...sdkOptionArgNames,
  'account-id',
  'format'
]);

export function parsePositionsRequest(argv: CliArgs): PositionsRequest {
  return {
    accountId: ArgGuards.requireStringArg(argv, 'account-id')
  };
}

export function parsePositionsFormat(argv: CliArgs): PositionsFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', positionsFormats) ?? 'table';
}

export function createPositionsCommand(
  createSdk: PositionsSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function positions(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, positionsArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'operations get-positions');

    const request = parsePositionsRequest(argv);
    const format = parsePositionsFormat(argv);
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
