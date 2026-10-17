/**
 * Модуль gRPC middleware связывает вызовы транспорта с ограничителем
 * unary-запросов.
 *
 * Здесь допустимы:
 * - выбор квоты по пути gRPC-метода;
 * - вызов ограничителя, переданного приложением, перед unary-вызовом;
 * - пропуск потоковых ответов без ограничения;
 * - проверка закрытия SDK и классификация ошибок вызова;
 * - передача вызова в цепочку middleware `nice-grpc`.
 *
 * Здесь не должно быть правил повторных запросов или управления потоками.
 */

import type {
  CallOptions,
  ClientMiddlewareCall
} from 'nice-grpc';
import {
  isSdkError,
  SdkError,
  SdkErrorCode
} from '../../../application/errors/sdk-error';
import type {
  TInvestUnaryLimiter
} from '../../../application/services/unary-limiter';
import {
  createAbortError,
  errorMessage,
  isCallCancellation,
  mapSdkCallError
} from './sdk-call-error';
import type { UnaryLimitResolver } from './unary-limit-resolver';

export interface SdkCallLifecycle {
  readonly signal: AbortSignal;
  assertOpen(): void;
}

export interface SdkCallErrorClassificationOptions {
  readonly useSsl: boolean;
  readonly maxReceiveMessageLength: number;
}

export function createSdkMiddleware(
  unaryLimiter: TInvestUnaryLimiter | undefined,
  unaryLimitResolver: UnaryLimitResolver,
  lifecycle?: SdkCallLifecycle,
  errorClassification?: SdkCallErrorClassificationOptions
) {
  return async function* <Request, Response>(
    call: ClientMiddlewareCall<Request, Response, CallOptions>,
    options: CallOptions
  ) {
    lifecycle?.assertOpen();

    if (!call.responseStream && unaryLimiter !== undefined) {
      await acquireUnaryPermit(
        unaryLimiter,
        unaryLimitResolver,
        call.method.path,
        options.signal,
        lifecycle?.signal
      );
    }

    const callbackBoundary = createCallCallbackBoundary(options);

    try {
      lifecycle?.assertOpen();

      if (!call.responseStream) {
        throwIfAborted(options.signal);

        const response = yield* call.next(
          call.request,
          callbackBoundary?.options ?? options
        );

        throwCallCallbackFailure(callbackBoundary);

        return response;
      }

      throwIfAborted(options.signal);

      for await (
        const response of call.next(
          call.request,
          callbackBoundary?.options ?? options
        )
      ) {
        throwCallCallbackFailure(callbackBoundary);
        yield response;
      }

      throwCallCallbackFailure(callbackBoundary);

      return undefined;
    }
    catch (error) {
      if (callbackBoundary?.failure !== undefined) {
        throw callbackBoundary.failure.reason;
      }

      throw mapSdkCallError(
        error,
        call.method.path,
        options.signal,
        errorClassification?.useSsl === true,
        errorClassification?.maxReceiveMessageLength
      );
    }
    finally {
      throwCallCallbackFailure(callbackBoundary);
    }
  };
}

const passiveUnaryLimitSignal = new AbortController().signal;

async function acquireUnaryPermit(
  limiter: TInvestUnaryLimiter,
  resolver: UnaryLimitResolver,
  path: string,
  callSignal: AbortSignal | undefined,
  lifecycleSignal: AbortSignal | undefined
): Promise<void> {
  const quota = resolver.resolve(path);

  if (quota === undefined) {
    throw new SdkError(
      SdkErrorCode.UnknownUnaryLimit,
      `Unhandled unary limits for ${path}`,
      {
        source: 'sdk',
        path
      }
    );
  }

  const signal = resolveUnaryLimitSignal(callSignal, lifecycleSignal);

  try {
    throwIfAborted(signal);
    await limiter.acquire({
      path,
      quota,
      signal
    });
    throwIfAborted(signal);
  }
  catch (error) {
    if (isCallCancellation(error, callSignal)) {
      throw new SdkError(
        SdkErrorCode.Cancelled,
        errorMessage(error, `SDK call ${path} was cancelled`),
        {
          source: 'abort',
          path,
          cause: error
        }
      );
    }

    if (isCallCancellation(error, lifecycleSignal)) {
      throw lifecycleSignal?.reason ?? error;
    }

    if (isSdkError(error)) {
      throw error;
    }

    throw error;
  }
}

function resolveUnaryLimitSignal(
  callSignal: AbortSignal | undefined,
  lifecycleSignal: AbortSignal | undefined
): AbortSignal {
  if (callSignal !== undefined && lifecycleSignal !== undefined) {
    return AbortSignal.any([callSignal, lifecycleSignal]);
  }

  return callSignal ?? lifecycleSignal ?? passiveUnaryLimitSignal;
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw signal.reason ?? createAbortError();
  }
}

interface CallCallbackFailure {
  readonly reason: unknown;
}

interface CallCallbackBoundary {
  readonly options: CallOptions;
  readonly failure: CallCallbackFailure | undefined;
}

function createCallCallbackBoundary(
  options: CallOptions
): CallCallbackBoundary | undefined {
  if (options.onHeader === undefined && options.onTrailer === undefined) {
    return undefined;
  }

  // nice-grpc вызывает эти callbacks из EventEmitter handlers. Исключение
  // нужно вернуть владельцу RPC, иначе оно обходит Promise/AsyncIterable.
  const controller = new AbortController();
  let failure: CallCallbackFailure | undefined;
  const captureFailure = (reason: unknown) => {
    if (failure === undefined) {
      failure = { reason };
      controller.abort(reason);
    }
  };
  const protectedOptions: CallOptions = {
    ...options,
    signal: options.signal === undefined
      ? controller.signal
      : AbortSignal.any([options.signal, controller.signal])
  };

  if (options.onHeader !== undefined) {
    protectedOptions.onHeader = protectCallCallback(
      options.onHeader,
      captureFailure
    );
  }

  if (options.onTrailer !== undefined) {
    protectedOptions.onTrailer = protectCallCallback(
      options.onTrailer,
      captureFailure
    );
  }

  return {
    options: protectedOptions,
    get failure() {
      return failure;
    }
  };
}

function protectCallCallback(
  callback: NonNullable<CallOptions['onHeader']>,
  captureFailure: (reason: unknown) => void
): NonNullable<CallOptions['onHeader']> {
  return (metadata) => {
    try {
      callback(metadata);
    }
    catch (error) {
      captureFailure(error);
    }
  };
}

function throwCallCallbackFailure(
  boundary: CallCallbackBoundary | undefined
): void {
  if (boundary?.failure !== undefined) {
    throw boundary.failure.reason;
  }
}
