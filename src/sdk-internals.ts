import {
  CallOptions,
  Channel,
  ChannelCredentials,
  ClientMiddlewareCall,
  Metadata,
  createChannel,
  createClientFactory
} from 'nice-grpc';
import { Throttle } from './throttle';
import type { TinkoffInvestOptions } from './tinkoff-invest-node-sdk';

// Создает канал с TLS или insecure credentials в зависимости от настроек SDK.
export function createSdkChannel(options: TinkoffInvestOptions) {
  const credentials = options.useSsl
    ? ChannelCredentials.createSsl()
    : ChannelCredentials.createInsecure();

  return createChannel(options.endpoint, credentials);
}

// Подготавливает metadata, которая будет отправляться со всеми unary-вызовами.
export function createSdkMetadata(options: TinkoffInvestOptions) {
  const init = {
    Authorization: `Bearer ${options.token}`
  };

  if (options.appName) {
    init['x-app-name'] = options.appName;
  }

  return new Metadata(init);
}

// Middleware применяет локальный throttling только к unary-вызовам.
export function createSdkMiddleware(trackLimits: boolean, throttle: Throttle) {
  return async function*<Request, Response>(
    call: ClientMiddlewareCall<Request, Response, CallOptions>,
    options: CallOptions
  ) {
    if (!call.responseStream) {
      if (trackLimits) {
        await throttle.reduce(call.method.path);
      }

      const response = yield* call.next(call.request, options);

      return response;
    }

    for await (const response of call.next(call.request, options)) {
      yield response;
    }
  };
}

// Собирает gRPC-клиент сервиса с общими middleware и metadata SDK.
export function createSdkClient<T>(
  service: unknown,
  channel: Channel,
  metadata: Metadata,
  trackLimits: boolean,
  throttle: Throttle
) {
  return createClientFactory()
    .use(createSdkMiddleware(trackLimits, throttle))
    .create(service as never, channel, {
      '*': {
        metadata
      }
    }) as T;
}
