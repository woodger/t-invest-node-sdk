import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetStopOrdersRequest,
  GetStopOrdersResponse
} from '../../../generated/stoporders';
import { defineCommand } from 'icore';
import { resolveSdkOptionsFromCommandOptions } from '../../args';
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

const stopOrdersCommandName = 'stoporders get-stop-orders';
const stopOrdersCommandPath = ['stoporders', 'get-stop-orders'] as const;
const defaultStopOrdersSdkFactory: StopOrdersSdkFactory = (options) => new TinkoffInvestNodeSDK(options);

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
  return parseCommandOptions(argv, stopOrdersCommandName, stopOrdersOptionsSchema);
}

export function parseStopOrdersRequest(argv: CliArgs): GetStopOrdersRequest {
  return createStopOrdersRequest(parseStopOrdersOptions(argv));
}

export function parseStopOrdersFormat(argv: CliArgs): StopOrdersFormat {
  return parseCommandOptions(
    argv,
    stopOrdersCommandName,
    stopOrdersFormatOptionsSchema
  ).format;
}

export function createStopOrdersCommand(
  createSdk: StopOrdersSdkFactory = defaultStopOrdersSdkFactory
) {
  return defineCommand({
    path: stopOrdersCommandPath,
    options: stopOrdersOptionsSchema,
    handle({ options }) {
      return runStopOrdersCommand(options, createSdk);
    }
  });
}

export const stopOrdersCommand = createStopOrdersCommand();

async function runStopOrdersCommand(
  options: ReturnType<typeof parseStopOrdersOptions>,
  createSdk: StopOrdersSdkFactory
): Promise<string> {
  const request = createStopOrdersRequest(options);
  const { format } = options;
  const sdk = createSdk(resolveSdkOptionsFromCommandOptions(options));

  try {
    const response = await sdk.stoporders.getStopOrders(request);

    return formatStopOrders(response, format);
  }
  finally {
    sdk.close();
  }
}

export { formatStopOrders };

function createStopOrdersRequest(
  options: ReturnType<typeof parseStopOrdersOptions>
): GetStopOrdersRequest {
  return {
    accountId: options['account-id']
  };
}
