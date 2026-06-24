/** Денежная строка в отчете команды `operations get-withdraw-limits`. */
export interface WithdrawLimitsReportMoney {
  /** Валюта денежной строки. */
  currency: string;
  /** Сумма в строковом формате quotation. */
  amount: string;
}

/** Отчет команды `operations get-withdraw-limits` на application/output boundary. */
export interface WithdrawLimitsReport {
  /** Доступные к выводу денежные позиции. */
  money: WithdrawLimitsReportMoney[];
  /** Заблокированные денежные позиции. */
  blocked: WithdrawLimitsReportMoney[];
  /** Заблокированные гарантийные денежные позиции. */
  blockedGuarantee: WithdrawLimitsReportMoney[];
}
