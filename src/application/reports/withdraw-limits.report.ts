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
