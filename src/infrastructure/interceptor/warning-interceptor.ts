/**
 * Модуль warning interceptor подавляет известные шумные process warning.
 *
 * Здесь допустимы:
 * - установка и восстановление `process.emitWarning`;
 * - фильтрация warning-сообщений по локальным правилам;
 * - возврат restore hook без знания application-сценариев;
 *
 * Здесь не должно быть работы со stdout, SDK, transport orchestration
 * или application use-case-ами.
 */

export type WarningFilterRule = {
  messageIncludes?: string;
};

type InstallOptions = {
  rules: WarningFilterRule[];
  enabled?: boolean;
};

/**
 * Устанавливает временный `process.emitWarning` hook и возвращает restore-функцию.
 */
export function warningInterceptor(options: InstallOptions) {
  const {
    rules,
    enabled = process.env['NODE_ENV'] !== 'production'
  } = options;

  if (!enabled) {
    // No hook is installed when the interceptor is disabled.
    // oxlint-disable-next-line no-empty-function
    return () => {};
  }

  const originalEmitWarning = process.emitWarning;

  process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
    const message =
      typeof warning === 'string' ? warning : warning.message;

    const shouldSuppress = rules.some((rule) =>
      rule.messageIncludes != null &&
      message.includes(rule.messageIncludes)
    );

    if (shouldSuppress) {
      return;
    }

    Reflect.apply(originalEmitWarning, process, [warning, ...args]);
  }) as typeof process.emitWarning;

  return () => {
    process.emitWarning = originalEmitWarning;
  };
}
