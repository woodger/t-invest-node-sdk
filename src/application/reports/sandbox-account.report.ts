/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

import type { ReportMoney } from './money.report';

/** Идентификатор счёта, полученный после его открытия в песочнице. */
export interface OpenSandboxAccountReport {
  accountId: string;
}

/** Подтверждение закрытия счёта песочницы с его идентификатором. */
export interface CloseSandboxAccountReport {
  accountId: string;
  status: 'closed';
}

/**
 * Результат пополнения счёта песочницы; balance равен null, если баланс не
 * передан.
 */
export interface SandboxPayInReport {
  balance: ReportMoney | null;
}
