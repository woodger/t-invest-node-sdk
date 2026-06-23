import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetOrdersRequest, GetOrdersResponse } from '../../../generated/orders';
import { resolveSdkOptions, sdkOptionArgNames, ArgGuards } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatOrders, ordersFormats, type OrdersFormat } from './reporter';

type OrdersSdk = {
  orders: {
    getOrders(request: GetOrdersRequest): Promise<GetOrdersResponse>;
  };
  close(): void;
};

type OrdersSdkFactory = (options: TinkoffInvestOptions) => OrdersSdk;

const ordersArgNames = new Set([
  ...sdkOptionArgNames,
  'account-id',
  'format'
]);

export function parseOrdersRequest(argv: CliArgs): GetOrdersRequest {
  return {
    accountId: ArgGuards.requireStringArg(argv, 'account-id')
  };
}

export function parseOrdersFormat(argv: CliArgs): OrdersFormat {
  return ArgGuards.optionalEnumArgValue(argv, 'format', ordersFormats) ?? 'table';
}

export function createOrdersCommand(
  createSdk: OrdersSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function orders(argv: CliArgs): Promise<string> {
    ArgGuards.assertKnownArgs(argv, ordersArgNames);
    ArgGuards.assertNoExtraPositionals(argv, 'orders');

    const request = parseOrdersRequest(argv);
    const format = parseOrdersFormat(argv);
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.orders.getOrders(request);

      return formatOrders(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const orders = createOrdersCommand();

export { formatOrders };
