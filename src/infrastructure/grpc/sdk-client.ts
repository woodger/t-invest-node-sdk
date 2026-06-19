import type {
  Channel,
  Metadata
} from 'nice-grpc';
import type { Throttle } from '../../application/services/unary-throttle.service';
import { createClientFactory } from 'nice-grpc';
import { createSdkMiddleware } from './sdk-middleware';

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
