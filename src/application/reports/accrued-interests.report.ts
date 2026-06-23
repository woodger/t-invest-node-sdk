/** Одна запись НКД в отчете команды `instruments get-accrued-interests`. */
export interface AccruedInterestsReportItem {
  date: string;
  value: string;
  valuePercent: string;
  nominal: string;
}

/** Отчет команды `instruments get-accrued-interests` на application/output boundary. */
export type AccruedInterestsReport = AccruedInterestsReportItem[];
