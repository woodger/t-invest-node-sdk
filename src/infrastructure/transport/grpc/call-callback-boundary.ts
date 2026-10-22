/**
 * Изолирует ошибки callbacks метаданных одного RPC от обработчиков событий
 * транспорта и передаёт их middleware в контексте чтения результата.
 */

import type { CallOptions } from 'nice-grpc';

interface CallCallbackFailure {
  readonly reason: unknown;
}

/**
 * Хранит первую ошибку callbacks одного RPC и отменяет этот вызов при ошибке.
 * Синхронные исключения onHeader/onTrailer из обработчиков событий nice-grpc
 * передаются владельцу Promise или AsyncIterable через throwIfFailed.
 */
export class CallCallbackBoundary {
  readonly options: CallOptions;
  private readonly controller = new AbortController();
  private failure: CallCallbackFailure | undefined;

  constructor(options: CallOptions) {
    this.options = {
      ...options,
      signal: options.signal === undefined
        ? this.controller.signal
        : AbortSignal.any([options.signal, this.controller.signal])
    };

    if (options.onHeader !== undefined) {
      this.options.onHeader = this.protectCallback(options.onHeader);
    }

    if (options.onTrailer !== undefined) {
      this.options.onTrailer = this.protectCallback(options.onTrailer);
    }
  }

  /** Поднимает сохранённую ошибку callback в контексте владельца RPC. */
  throwIfFailed(): void {
    if (this.failure !== undefined) {
      throw this.failure.reason;
    }
  }

  /**
   * Перехватывает исключение в обработчике событий транспорта, чтобы middleware
   * мог передать его владельцу RPC при чтении результата.
   */
  private protectCallback(
    callback: NonNullable<CallOptions['onHeader']>
  ): NonNullable<CallOptions['onHeader']> {
    return (metadata) => {
      try {
        callback(metadata);
      }
      catch (error) {
        if (this.failure === undefined) {
          // Обёртка отличает throw undefined от отсутствия ошибки.
          this.failure = { reason: error };
          this.controller.abort(error);
        }
      }
    };
  }
}
