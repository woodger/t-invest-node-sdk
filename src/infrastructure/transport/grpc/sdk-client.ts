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
  Channel,
  Metadata
} from 'nice-grpc';
import type { Throttle } from '../../../application/services/unary-throttle.service';
import { createClientFactory } from 'nice-grpc';
import { createSdkMiddleware } from './sdk-middleware';
import type { SdkCallLifecycle } from './sdk-middleware';
import type { UnaryLimitResolver } from './unary-limit-resolver';

export function createSdkClient<T>(
  service: unknown,
  channel: Channel,
  metadata: Metadata,
  trackLimits: boolean,
  unaryLimitResolver: UnaryLimitResolver,
  throttle: Throttle,
  lifecycle: SdkCallLifecycle
) {
  return createClientFactory()
    .use(createSdkMiddleware(
      trackLimits,
      unaryLimitResolver,
      throttle,
      lifecycle
    ))
    .create(service as never, channel, {
      '*': {
        metadata
      }
    }) as T;
}
