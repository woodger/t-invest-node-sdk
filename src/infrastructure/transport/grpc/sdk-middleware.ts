/**
 * Модуль gRPC middleware adapter связывает transport calls с application throttling.
 *
 * Здесь допустимы:
 * - применение unary throttling policy;
 * - пропуск response stream calls без unary задержки;
 * - делегирование actual call execution в nice-grpc middleware chain;
 *
 * Здесь не должно быть retry policy или stream lifecycle management.
 */

import type {
  CallOptions,
  ClientMiddlewareCall
} from 'nice-grpc';
import type { Throttle } from '../../../application/services/unary-throttle.service';

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

    return undefined;
  };
}
