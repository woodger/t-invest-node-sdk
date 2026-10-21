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

/** Проверки состояния SDK и отмена ожиданий квоты при его закрытии. */
export interface SdkCallLifecycle {
  readonly signal: AbortSignal;
  assertOpen(): void;
}

export interface SdkCallErrorClassificationOptions {
  readonly useSsl: boolean;
  readonly maxReceiveMessageLength: number;
}

/**
 * Связывает проверки состояния SDK, unary-квоты и классификацию ошибок RPC.
 * Синхронные исключения callbacks метаданных передаёт без преобразования.
 */
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

    // Ошибки ограничителя не должны попадать в классификацию ошибок транспорта.
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
      // SDK мог закрыться, пока вызов ждал разрешения ограничителя.
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
      // Ошибка callback важнее транспортной ошибки, вызванной его отменой RPC.
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
      // Учитываем ошибку callback и при досрочном закрытии итератора.
      throwCallCallbackFailure(callbackBoundary);
    }
  };
}

// Контракт ограничителя требует сигнал даже для вызовов без отмены.
const passiveUnaryLimitSignal = new AbortController().signal;

/**
 * Ожидает квоту до обращения к транспорту. Отмена вызова получает CANCELLED,
 * закрытие SDK сохраняет причину lifecycle-сигнала, остальные ошибки
 * ограничителя передаются без преобразования.
 */
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
    // Ограничитель приложения может не учитывать отмену во время ожидания.
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

    throw error;
  }
}

/** Объединяет отмену вызова и закрытие SDK только для ожидания квоты. */
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

/**
 * Переносит синхронные исключения onHeader/onTrailer из обработчиков событий
 * nice-grpc в Promise или AsyncIterable вызова, отменяя RPC при ошибке.
 */
function createCallCallbackBoundary(
  options: CallOptions
): CallCallbackBoundary | undefined {
  if (options.onHeader === undefined && options.onTrailer === undefined) {
    return undefined;
  }

  const controller = new AbortController();
  let failure: CallCallbackFailure | undefined;
  const captureFailure = (reason: unknown) => {
    if (failure === undefined) {
      // Обёртка отличает throw undefined от отсутствия ошибки.
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
    // Callbacks срабатывают после создания границы; нужна текущая ошибка.
    get failure() {
      return failure;
    }
  };
}

/**
 * Перехватывает исключение в обработчике событий транспорта, чтобы middleware
 * мог передать его владельцу RPC при чтении результата.
 */
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

/** Поднимает сохранённую ошибку callback в контексте владельца RPC. */
function throwCallCallbackFailure(
  boundary: CallCallbackBoundary | undefined
): void {
  if (boundary?.failure !== undefined) {
    throw boundary.failure.reason;
  }
}
