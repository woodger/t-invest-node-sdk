import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type { GetOrdersRequest, GetOrdersResponse } from '../../../generated/orders';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CommandRawOptions } from '../../command-mechanics';
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

const ordersCommandName = 'orders get-orders';
const ordersCommandPath = ['orders', 'get-orders'] as const;
const defaultOrdersSdkFactory: OrdersSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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

const ordersOptionsSchema = withSdkOptions(
  ordersRequestOptionsSchema,
  ordersFormatOptionsSchema
);

function parseOrdersOptions(rawOptions: CommandRawOptions) {
  return parseCommandOptions(rawOptions, ordersCommandName, ordersOptionsSchema);
}

export function parseOrdersRequest(rawOptions: CommandRawOptions): GetOrdersRequest {
  return createOrdersRequest(parseOrdersOptions(rawOptions));
}

export function parseOrdersFormat(rawOptions: CommandRawOptions): OrdersFormat {
  return parseCommandOptions(
    rawOptions,
    ordersCommandName,
    ordersFormatOptionsSchema
  ).format;
}

export function createOrdersCommand(
  createSdk: OrdersSdkFactory = defaultOrdersSdkFactory
) {
  return defineCommand({
    path: ordersCommandPath,
    options: ordersOptionsSchema,
    handle({ options }) {
      return runOrdersCommand(options, createSdk);
    }
  });
}

export const ordersCommand = createOrdersCommand();

async function runOrdersCommand(
  options: ReturnType<typeof parseOrdersOptions>,
  createSdk: OrdersSdkFactory
): Promise<string> {
  const request = createOrdersRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.orders.getOrders(request);

    return formatOrders(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatOrders };

function createOrdersRequest(
  options: ReturnType<typeof parseOrdersOptions>
): GetOrdersRequest {
  return {
    accountId: options['account-id']
  };
}
