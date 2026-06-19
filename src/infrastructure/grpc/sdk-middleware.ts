import type {
  CallOptions,
  ClientMiddlewareCall
} from 'nice-grpc';
import type { Throttle } from '../../application/services/unary-throttle.service';

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
