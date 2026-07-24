/**
 * Модуль CLI error policy нормализует terminal errors и process-style exit code.
 *
 * Здесь допустимы:
 * - narrowing `IcoreError` по стабильному code/details contract;
 * - преобразование Error и неизвестных thrown values в строку;
 * - сохранение стабильного newline-контракта CLI errors;
 * - выбор exit code без записи в stdout/stderr.
 *
 * Здесь не должно быть command execution, stdout/stderr writes или SDK wiring.
 */

import {
  isIcoreError,
  isUsageError,
  type TerminalErrorPolicy
} from 'icore';
import { renderCliHelp } from './help';

export function renderCommandError(error: unknown): string {
  if (isIcoreError(error, 'UNKNOWN_COMMAND')) {
    const command = error.details.reason === 'unresolved'
      ? error.details.command
      : formatCommandPositionals(error.details.positionals);

    return `Unknown command: ${command}\n\n${renderCliHelp()}`;
  }

  if (error instanceof Error) {
    return `${error.message}\n`;
  }

  return `${String(error)}\n`;
}

export function resolveCommandExitCode(error: unknown): number {
  return isUsageError(error) ? 2 : 1;
}

export const terminalErrorPolicy: TerminalErrorPolicy<unknown> = {
  renderError: renderCommandError,
  resolveExitCode: resolveCommandExitCode
};

function formatCommandPositionals(positionals: readonly string[]): string {
  return positionals.length === 0 ? '<empty>' : positionals.join(' ');
}
