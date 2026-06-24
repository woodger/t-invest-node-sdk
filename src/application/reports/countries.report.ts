/** Одна страна в отчете команды `instruments get-countries`. */
export interface CountriesReportCountry {
  /** Двухбуквенный код страны. */
  alfaTwo: string;
  /** Трехбуквенный код страны. */
  alfaThree: string;
  /** Полное название страны. */
  name: string;
  /** Краткое название страны. */
  nameBrief: string;
}

/** Отчет команды `instruments get-countries` на application/output boundary. */
export type CountriesReport = CountriesReportCountry[];
