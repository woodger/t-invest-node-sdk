/**
 * Модуль gRPC client adapter создает generated service client.
 *
 * Здесь допустимы:
 * - подключение shared metadata;
 * - wiring middleware к nice-grpc client factory;
 * - возврат typed generated client facade;
 *
 * Здесь не должно быть SDK lifecycle ownership или API request mapping.
 */

import type {
  CallOptions,
  Channel,
  ClientMiddlewareCall
} from 'nice-grpc';
import type { Throttle } from '../../../application/services/unary-throttle.service';
import {
  createClientFactory,
  Metadata
} from 'nice-grpc';
import { createSdkMiddleware } from './sdk-middleware';
import type { SdkCallRuntime } from './sdk-middleware';
import type { UnaryLimitResolver } from './unary-limit-resolver';

export function createSdkClient<T>(
  service: unknown,
  channel: Channel,
  metadata: Metadata,
  trackLimits: boolean,
  unaryLimitResolver: UnaryLimitResolver,
  throttle: Throttle,
  runtime: SdkCallRuntime
) {
  return createClientFactory()
    .use(createSdkMiddleware(
      trackLimits,
      unaryLimitResolver,
      throttle,
      runtime
    ))
    .use(createSdkMetadataMiddleware(metadata))
    .create(service as never, channel) as T;
}

function createSdkMetadataMiddleware(metadata: Metadata) {
  return async function*<Request, Response>(
    call: ClientMiddlewareCall<Request, Response>,
    options: CallOptions
  ) {
    const callMetadata = new Metadata(options.metadata);

    for (const [key, values] of metadata) {
      callMetadata.set(key, values);
    }

    return yield* call.next(call.request, {
      ...options,
      metadata: callMetadata
    });
  };
}
