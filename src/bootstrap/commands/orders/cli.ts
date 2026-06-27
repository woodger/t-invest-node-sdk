import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetOrdersRequest, GetOrdersResponse } from '../../../generated/orders';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatOrders, ordersFormats, type OrdersFormat } from './reporter';

type OrdersSdk = {
  orders: {
    getOrders(request: GetOrdersRequest): Promise<GetOrdersResponse>;
  };
  close(): void;
};

type OrdersSdkFactory = (options: TinkoffInvestOptions) => OrdersSdk;

const ordersRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  }
} as const;

const ordersFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: ordersFormats,
    default: 'table'
  }
} as const;

const ordersOptionsSchema = withSdkOptions({
  ...ordersRequestOptionsSchema,
  ...ordersFormatOptionsSchema
} as const);

function parseOrdersOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'orders get-orders', ordersOptionsSchema);
}

export function parseOrdersRequest(argv: CliArgs): GetOrdersRequest {
  return createOrdersRequest(parseOrdersOptions(argv));
}

export function parseOrdersFormat(argv: CliArgs): OrdersFormat {
  return parseCommandOptions(
    argv,
    'orders get-orders',
    ordersFormatOptionsSchema
  ).format;
}

export function createOrdersCommand(
  createSdk: OrdersSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function orders(argv: CliArgs): Promise<string> {
    const options = parseOrdersOptions(argv);
    const request = createOrdersRequest(options);
    const { format } = options;
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

function createOrdersRequest(
  options: ReturnType<typeof parseOrdersOptions>
): GetOrdersRequest {
  return {
    accountId: options['account-id']
  };
}
