/**
 * Модуль gRPC middleware adapter связывает transport calls с application throttling.
 *
 * Здесь допустимы:
 * - разрешение gRPC path в transport-neutral throttle rule;
 * - применение unary throttling scheduler;
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
import type { UnaryLimitResolver } from './unary-limit-resolver';

export function createSdkMiddleware(
  trackLimits: boolean,
  unaryLimitResolver: UnaryLimitResolver,
  throttle: Throttle
) {
  return async function*<Request, Response>(
    call: ClientMiddlewareCall<Request, Response, CallOptions>,
    options: CallOptions
  ) {
    if (!call.responseStream) {
      if (trackLimits) {
        const rule = unaryLimitResolver.resolve(call.method.path);

        if (rule === undefined) {
          throw new Error(`Unhandled unary limits for ${call.method.path}`);
        }

        await throttle.reduce(rule);
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
