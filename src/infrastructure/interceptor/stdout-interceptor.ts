/**
 * Модуль stdout interceptor подавляет и при необходимости сохраняет stdout-сообщения.
 *
 * Здесь допустимы:
 * - установка и восстановление `process.stdout.write`;
 * - фильтрация stdout-сообщений по локальным правилам;
 * - накопление перехваченного stdout для test/runtime diagnostics;
 *
 * Здесь не должно быть работы с process warning, SDK, transport orchestration
 * или application use-case-ами.
 */

export type StdoutFilterRule = {
  messageIncludes?: string;
};

type InstallOptions = {
  rules: StdoutFilterRule[];
  enabled?: boolean;
  capture?: boolean;
};

export interface StdoutInterceptorHandle {
  getOutput(): string;
  restore(): void;
}

/**
 * Устанавливает временный `process.stdout.write` hook и возвращает restore handle.
 */
export function stdoutInterceptor(options: InstallOptions): StdoutInterceptorHandle {
  const {
    rules,
    enabled = true,
    capture = true
  } = options;

  if (!enabled) {
    return {
      getOutput: () => '',
      // No hook is installed when the interceptor is disabled.
      // oxlint-disable-next-line no-empty-function
      restore: () => {}
    };
  }

  const originalWrite = process.stdout.write;
  let output = '';

  const patchedWrite = ((chunk: string | Uint8Array, ...args: unknown[]) => {
    const message = chunk.toString();

    if (capture) {
      output += message;
    }

    const shouldSuppress = rules.some((rule) =>
      rule.messageIncludes != null &&
      message.includes(rule.messageIncludes)
    );

    if (shouldSuppress) {
      return true;
    }

    return Reflect.apply(originalWrite, process.stdout, [ chunk, ...args ]) as boolean;
  }) as typeof process.stdout.write;

  process.stdout.write = patchedWrite;

  return {
    getOutput: () => output,
    restore() {
      process.stdout.write = originalWrite;
    }
  };
}
