/**
 * Модуль gRPC middleware adapter связывает transport calls с application throttling.
 *
 * Здесь допустимы:
 * - разрешение gRPC path в transport-neutral throttle rule;
 * - применение unary throttling scheduler;
 * - пропуск response stream calls без unary задержки;
 * - проверка SDK lifecycle и mapping известных call failures в `SdkError`;
 * - делегирование actual call execution в nice-grpc middleware chain;
 *
 * Здесь не должно быть retry policy или stream lifecycle management.
 */

import type {
  CallOptions,
  ClientMiddlewareCall
} from 'nice-grpc';
import {
  ClientError,
  Status
} from 'nice-grpc';
import {
  isSdkError,
  SdkError,
  SdkErrorCode
} from '../../../application/errors/sdk-error';
import type { Throttle } from '../../../application/services/unary-throttle.service';
import type { UnaryLimitResolver } from './unary-limit-resolver';

export interface SdkCallLifecycle {
  readonly signal: AbortSignal;
  assertOpen(): void;
}

export function createSdkMiddleware(
  trackLimits: boolean,
  unaryLimitResolver: UnaryLimitResolver,
  throttle: Throttle,
  lifecycle?: SdkCallLifecycle
) {
  return async function*<Request, Response>(
    call: ClientMiddlewareCall<Request, Response, CallOptions>,
    options: CallOptions
  ) {
    try {
      lifecycle?.assertOpen();

      if (!call.responseStream) {
        if (trackLimits) {
          const rule = unaryLimitResolver.resolve(call.method.path);

          if (rule === undefined) {
            throw new SdkError(
              SdkErrorCode.UnknownUnaryLimit,
              `Unhandled unary limits for ${call.method.path}`,
              {
                source: 'sdk',
                path: call.method.path
              }
            );
          }

          await throttle.reduce(
            rule,
            resolveThrottleSignal(options.signal, lifecycle?.signal)
          );
        }

        lifecycle?.assertOpen();
        throwIfAborted(options.signal);

        const response = yield* call.next(call.request, options);

        return response;
      }

      throwIfAborted(options.signal);

      for await (const response of call.next(call.request, options)) {
        yield response;
      }

      return undefined;
    }
    catch (error) {
      throw mapSdkCallError(error, call.method.path, options.signal);
    }
  };
}

const grpcErrorCodes: Partial<Record<Status, SdkErrorCode>> = {
  [Status.CANCELLED]: SdkErrorCode.Cancelled,
  [Status.UNKNOWN]: SdkErrorCode.Unknown,
  [Status.INVALID_ARGUMENT]: SdkErrorCode.InvalidArgument,
  [Status.DEADLINE_EXCEEDED]: SdkErrorCode.DeadlineExceeded,
  [Status.NOT_FOUND]: SdkErrorCode.NotFound,
  [Status.ALREADY_EXISTS]: SdkErrorCode.AlreadyExists,
  [Status.PERMISSION_DENIED]: SdkErrorCode.PermissionDenied,
  [Status.RESOURCE_EXHAUSTED]: SdkErrorCode.ResourceExhausted,
  [Status.FAILED_PRECONDITION]: SdkErrorCode.FailedPrecondition,
  [Status.ABORTED]: SdkErrorCode.Aborted,
  [Status.OUT_OF_RANGE]: SdkErrorCode.OutOfRange,
  [Status.UNIMPLEMENTED]: SdkErrorCode.Unimplemented,
  [Status.INTERNAL]: SdkErrorCode.Internal,
  [Status.UNAVAILABLE]: SdkErrorCode.Unavailable,
  [Status.DATA_LOSS]: SdkErrorCode.DataLoss,
  [Status.UNAUTHENTICATED]: SdkErrorCode.Unauthenticated
};

function resolveThrottleSignal(
  callSignal: AbortSignal | undefined,
  lifecycleSignal: AbortSignal | undefined
): AbortSignal | undefined {
  if (callSignal !== undefined && lifecycleSignal !== undefined) {
    return AbortSignal.any([callSignal, lifecycleSignal]);
  }

  return callSignal ?? lifecycleSignal;
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw signal.reason ?? createAbortError();
  }
}

function mapSdkCallError(
  error: unknown,
  path: string,
  signal: AbortSignal | undefined
): unknown {
  if (isCallCancellation(error, signal)) {
    return new SdkError(
      SdkErrorCode.Cancelled,
      errorMessage(error, `SDK call ${path} was cancelled`),
      {
        source: 'abort',
        path,
        cause: error
      }
    );
  }

  if (isSdkError(error)) {
    return error;
  }

  if (error instanceof ClientError) {
    return new SdkError(
      grpcErrorCodes[error.code] ?? SdkErrorCode.Unknown,
      error.message,
      {
        source: 'grpc',
        path: error.path,
        details: error.details,
        cause: error
      }
    );
  }

  return error;
}

function isCallCancellation(
  error: unknown,
  signal: AbortSignal | undefined
): boolean {
  return signal?.aborted === true
    && (error === signal.reason || errorName(error) === 'AbortError');
}

function errorName(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const name = (error as Record<PropertyKey, unknown>)['name'];

  return typeof name === 'string' ? name : undefined;
}

function errorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  const message = (error as Record<PropertyKey, unknown>)['message'];

  return typeof message === 'string' ? message : fallback;
}

function createAbortError(): Error {
  const error = new Error('The operation was aborted');

  error.name = 'AbortError';

  return error;
}
