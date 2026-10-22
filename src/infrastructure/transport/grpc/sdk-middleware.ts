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

import type { CallOptions, ClientMiddlewareCall } from 'nice-grpc';
import { SdkError, SdkErrorCode } from '../../../application/errors/sdk-error';
import type { TInvestUnaryLimiter } from '../../../application/services/unary-limiter';
import { CallCallbackBoundary } from './call-callback-boundary';
import { createAbortError, errorMessage, isCallCancellation, mapSdkCallError } from './sdk-call-error';
import type { UnaryLimitResolver } from './unary-limit-resolver';

/** Проверки состояния SDK и отмена ожиданий квоты при его закрытии. */
export interface SdkCallLifecycle {
  readonly signal: AbortSignal;
  assertOpen(): void;
}

/** Настройки канала для распознавания ошибок TLS и превышения лимита ответа. */
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
  const middleware = new SdkMiddleware(
    unaryLimiter,
    unaryLimitResolver,
    lifecycle,
    errorClassification
  );

  return <Request, Response>(
    call: ClientMiddlewareCall<Request, Response, CallOptions>,
    options: CallOptions
  ) => middleware.handle(call, options);
}

// Контракт ограничителя требует сигнал даже для вызовов без отмены.
const passiveUnaryLimitSignal = new AbortController().signal;

/**
 * Хранит зависимости middleware, общие для нескольких одновременных RPC.
 * Состояние callbacks создаётся отдельно внутри каждого вызова handle.
 */
class SdkMiddleware {
  constructor(
    private readonly unaryLimiter: TInvestUnaryLimiter | undefined,
    private readonly unaryLimitResolver: UnaryLimitResolver,
    private readonly lifecycle?: SdkCallLifecycle,
    private readonly errorClassification?: SdkCallErrorClassificationOptions
  ) {}

  async *handle<Request, Response>(
    call: ClientMiddlewareCall<Request, Response, CallOptions>,
    options: CallOptions
  ) {
    this.lifecycle?.assertOpen();

    // Ошибки ограничителя не должны попадать в классификацию ошибок транспорта.
    if (!call.responseStream && this.unaryLimiter !== undefined) {
      await this.acquireUnaryPermit(
        this.unaryLimiter,
        call.method.path,
        options.signal
      );
    }

    const callbackBoundary = options.onHeader === undefined
      && options.onTrailer === undefined
      ? undefined
      : new CallCallbackBoundary(options);

    try {
      // SDK мог закрыться, пока вызов ждал разрешения ограничителя.
      this.lifecycle?.assertOpen();

      if (!call.responseStream) {
        SdkMiddleware.throwIfAborted(options.signal);

        const response = yield* call.next(
          call.request,
          callbackBoundary?.options ?? options
        );

        callbackBoundary?.throwIfFailed();

        return response;
      }

      SdkMiddleware.throwIfAborted(options.signal);

      for await (
        const response of call.next(
          call.request,
          callbackBoundary?.options ?? options
        )
      ) {
        callbackBoundary?.throwIfFailed();
        yield response;
      }

      callbackBoundary?.throwIfFailed();

      return undefined;
    }
    catch (error) {
      // Ошибка callback важнее транспортной ошибки, возникшей при отмене RPC.
      callbackBoundary?.throwIfFailed();

      throw mapSdkCallError(
        error,
        call.method.path,
        options.signal,
        this.errorClassification?.useSsl === true,
        this.errorClassification?.maxReceiveMessageLength
      );
    }
    finally {
      // Учитываем ошибку callback и при досрочном закрытии итератора.
      callbackBoundary?.throwIfFailed();
    }
  }

  /**
   * Ожидает квоту до обращения к транспорту. Отмена вызова получает CANCELLED,
   * закрытие SDK сохраняет причину lifecycle-сигнала, остальные ошибки
   * ограничителя передаются без преобразования.
   */
  private async acquireUnaryPermit(
    limiter: TInvestUnaryLimiter,
    path: string,
    callSignal: AbortSignal | undefined
  ): Promise<void> {
    const lifecycleSignal = this.lifecycle?.signal;
    const quota = this.unaryLimitResolver.resolve(path);

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

    const signal = SdkMiddleware.resolveUnaryLimitSignal(callSignal, lifecycleSignal);

    try {
      SdkMiddleware.throwIfAborted(signal);
      await limiter.acquire({
        path,
        quota,
        signal
      });
      // Ограничитель приложения может не учитывать отмену во время ожидания.
      SdkMiddleware.throwIfAborted(signal);
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
  private static resolveUnaryLimitSignal(
    callSignal: AbortSignal | undefined,
    lifecycleSignal: AbortSignal | undefined
  ): AbortSignal {
    if (callSignal !== undefined && lifecycleSignal !== undefined) {
      return AbortSignal.any([callSignal, lifecycleSignal]);
    }

    return callSignal ?? lifecycleSignal ?? passiveUnaryLimitSignal;
  }

  private static throwIfAborted(signal: AbortSignal | undefined): void {
    if (signal?.aborted) {
      throw signal.reason ?? createAbortError();
    }
  }
}
