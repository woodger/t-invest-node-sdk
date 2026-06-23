import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetStopOrdersRequest,
  GetStopOrdersResponse
} from '../../../generated/stoporders';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatStopOrders, stopOrdersFormats, type StopOrdersFormat } from './reporter';

type StopOrdersSdk = {
  stoporders: {
    getStopOrders(request: GetStopOrdersRequest): Promise<GetStopOrdersResponse>;
  };
  close(): void;
};

type StopOrdersSdkFactory = (options: TinkoffInvestOptions) => StopOrdersSdk;

const stopOrdersArgNames = new Set([
  ...sdkOptionArgNames,
  'account-id',
  'format'
]);

export function parseStopOrdersRequest(argv: CliArgs): GetStopOrdersRequest {
  return {
    accountId: ArgGuards.requireStringArg(argv, 'account-id')
  };
}

export function parseStopOrdersFormat(argv: CliArgs): StopOrdersFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', stopOrdersFormats) ?? 'table';
}

export function createStopOrdersCommand(
  createSdk: StopOrdersSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function stopOrders(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, stopOrdersArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'stoporders get-stop-orders');

    const request = parseStopOrdersRequest(argv);
    const format = parseStopOrdersFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.stoporders.getStopOrders(request);

      return formatStopOrders(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const stopOrders = createStopOrdersCommand();

export { formatStopOrders };
