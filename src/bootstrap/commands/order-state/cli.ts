import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetOrderStateRequest,
  OrderState
} from '../../../generated/orders';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatOrderState, orderStateFormats, type OrderStateFormat } from './reporter';

type OrderStateSdk = {
  orders: {
    getOrderState(request: GetOrderStateRequest): Promise<OrderState>;
  };
  close(): void;
};

type OrderStateSdkFactory = (options: TinkoffInvestOptions) => OrderStateSdk;

const orderStateCommandName = 'orders get-order-state';
const orderStateCommandPath = ['orders', 'get-order-state'] as const;
const defaultOrderStateSdkFactory: OrderStateSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

const orderStateRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  },
  'order-id': {
    type: 'string',
    required: true
  }
} as const;

const orderStateFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: orderStateFormats,
    default: 'table'
  }
} as const;

const orderStateOptionsSchema = withSdkOptions(
  orderStateRequestOptionsSchema,
  orderStateFormatOptionsSchema
);

function parseOrderStateOptions(argv: CliArgs) {
  return parseCommandOptions(argv, orderStateCommandName, orderStateOptionsSchema);
}

export function parseOrderStateRequest(argv: CliArgs): GetOrderStateRequest {
  return createOrderStateRequest(parseOrderStateOptions(argv));
}

export function parseOrderStateFormat(argv: CliArgs): OrderStateFormat {
  return parseCommandOptions(
    argv,
    orderStateCommandName,
    orderStateFormatOptionsSchema
  ).format;
}

export function createOrderStateCommand(
  createSdk: OrderStateSdkFactory = defaultOrderStateSdkFactory
) {
  return defineCommand({
    path: orderStateCommandPath,
    options: orderStateOptionsSchema,
    handle({ options }) {
      return runOrderStateCommand(options, createSdk);
    }
  });
}

export function orderState(argv: CliArgs): Promise<string> {
  return runOrderStateCommand(
    parseOrderStateOptions(argv),
    defaultOrderStateSdkFactory
  );
}

export const orderStateCommand = createOrderStateCommand();

async function runOrderStateCommand(
  options: ReturnType<typeof parseOrderStateOptions>,
  createSdk: OrderStateSdkFactory
): Promise<string> {
  const request = createOrderStateRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.orders.getOrderState(request);

    return formatOrderState(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatOrderState };

function createOrderStateRequest(
  options: ReturnType<typeof parseOrderStateOptions>
): GetOrderStateRequest {
  return {
    accountId: options['account-id'],
    orderId: options['order-id']
  };
}
