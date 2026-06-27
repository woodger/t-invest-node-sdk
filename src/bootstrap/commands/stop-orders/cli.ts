import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetStopOrdersRequest,
  GetStopOrdersResponse
} from '../../../generated/stoporders';
import { resolveSdkOptions } from '../../args';
import type { CliArgs } from '../../cli-contract';
import { parseCommandOptions, withSdkOptions } from '../../command-mechanics';
import { TinkoffInvestNodeSDK } from '../../tinkoff-invest-node-sdk';
import { formatStopOrders, stopOrdersFormats, type StopOrdersFormat } from './reporter';

type StopOrdersSdk = {
  stoporders: {
    getStopOrders(request: GetStopOrdersRequest): Promise<GetStopOrdersResponse>;
  };
  close(): void;
};

type StopOrdersSdkFactory = (options: TinkoffInvestOptions) => StopOrdersSdk;

const stopOrdersRequestOptionsSchema = {
  'account-id': {
    type: 'string',
    required: true
  }
} as const;

const stopOrdersFormatOptionsSchema = {
  format: {
    type: 'string',
    choices: stopOrdersFormats,
    default: 'table'
  }
} as const;

const stopOrdersOptionsSchema = withSdkOptions(
  stopOrdersRequestOptionsSchema,
  stopOrdersFormatOptionsSchema
);

function parseStopOrdersOptions(argv: CliArgs) {
  return parseCommandOptions(argv, 'stoporders get-stop-orders', stopOrdersOptionsSchema);
}

export function parseStopOrdersRequest(argv: CliArgs): GetStopOrdersRequest {
  return createStopOrdersRequest(parseStopOrdersOptions(argv));
}

export function parseStopOrdersFormat(argv: CliArgs): StopOrdersFormat {
  return parseCommandOptions(
    argv,
    'stoporders get-stop-orders',
    stopOrdersFormatOptionsSchema
  ).format;
}

export function createStopOrdersCommand(
  createSdk: StopOrdersSdkFactory = (options) => new TinkoffInvestNodeSDK(options)
) {
  return async function stopOrders(argv: CliArgs): Promise<string> {
    const options = parseStopOrdersOptions(argv);
    const request = createStopOrdersRequest(options);
    const { format } = options;
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

function createStopOrdersRequest(
  options: ReturnType<typeof parseStopOrdersOptions>
): GetStopOrdersRequest {
  return {
    accountId: options['account-id']
  };
}
