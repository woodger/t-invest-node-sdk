/** Денежная строка в отчете команды `operations get-withdraw-limits`. */
export interface WithdrawLimitsReportMoney {
  currency: string;
  amount: string;
}

/** Отчет команды `operations get-withdraw-limits` на application/output boundary. */
export interface WithdrawLimitsReport {
  money: WithdrawLimitsReportMoney[];
  blocked: WithdrawLimitsReportMoney[];
  blockedGuarantee: WithdrawLimitsReportMoney[];
}
