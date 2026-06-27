import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetOrderStateRequest,
  OrderState
} from '../../../generated/orders';
import { resolveSdkOptions } from '../../args';
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

const orderStateOptionsSchema = withSdkOptions({
  ...orderStateRequestOptionsSchema,
  ...orderStateFormatOptionsSchema
} as const);

function parseOrderStateOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'orders get-order-state', orderStateOptionsSchema);
}

export function parseOrderStateRequest(argv: CliArgs): GetOrderStateRequest {
  return createOrderStateRequest(parseOrderStateOptions(argv));
}

export function parseOrderStateFormat(argv: CliArgs): OrderStateFormat {
  return parseCommandOptions(
    argv,
    'orders get-order-state',
    orderStateFormatOptionsSchema
  ).format;
}

export function createOrderStateCommand(
  createSdk: OrderStateSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function orderState(argv: CliArgs): Promise<string> {
    const options = parseOrderStateOptions(argv);
    const request = createOrderStateRequest(options);
    const { format } = options;
    const sdk = createSdk(resolveSdkOptions(argv));

    try {
      const response = await sdk.orders.getOrderState(request);

      return formatOrderState(response, format);
    }
    finally {
      sdk.close();
    }
  };
}

export const orderState = createOrderStateCommand();

export { formatOrderState };

function createOrderStateRequest(
  options: ReturnType<typeof parseOrderStateOptions>
): GetOrderStateRequest {
  return {
    accountId: options['account-id'],
    orderId: options['order-id']
  };
}
