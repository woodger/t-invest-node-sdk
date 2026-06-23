/** Одна страна в отчете команды `instruments get-countries`. */
export interface CountriesReportCountry {
  alfaTwo: string;
  alfaThree: string;
  name: string;
  nameBrief: string;
}

/** Отчет команды `instruments get-countries` на application/output boundary. */
export type CountriesReport = CountriesReportCountry[];
