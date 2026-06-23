/** Один счет в отчете команды `users get-accounts`. */
export interface AccountsReportAccount {
  id: string;
  name: string;
  type: string;
  status: string;
  accessLevel: string;
  openedDate: string;
  closedDate: string;
}

/** Отчет команды `users get-accounts` на application/output boundary. */
export type AccountsReport = AccountsReportAccount[];
