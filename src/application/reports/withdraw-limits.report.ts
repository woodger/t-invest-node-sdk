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

/** Отчет команды `operations get-withdraw-limits` на application/output boundary. */
export interface WithdrawLimitsReport {
  /** Доступные к выводу денежные позиции. */
  money: ReportMoney[];
  /** Заблокированные денежные позиции. */
  blocked: ReportMoney[];
  /** Заблокированные гарантийные денежные позиции. */
  blockedGuarantee: ReportMoney[];
}
