/** Один счет в отчете команды `accounts`. */
export interface AccountsReportAccount {
  id: string;
  name: string;
  type: string;
  status: string;
  accessLevel: string;
  openedDate: string;
  closedDate: string;
}

/** Отчет команды `accounts` на application/output boundary. */
export type AccountsReport = AccountsReportAccount[];
