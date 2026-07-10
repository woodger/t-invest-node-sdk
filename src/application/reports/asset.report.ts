/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

export interface AssetReportInstrumentLink {
  /** Тип связи инструмента с активом. */
  type: string;
  instrumentUid: string;
}

export interface AssetReportInstrument {
  uid: string;
  figi: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Вид инструмента в формате generated enum JSON name. */
  instrumentKind: string;
  ticker: string;
  classCode: string;
  positionUid: string;
  links: AssetReportInstrumentLink[];
}

export interface AssetReportBrand {
  uid: string;
  name: string;
  description: string;
  info: string;
  company: string;
  sector: string;
  countryOfRisk: string;
  countryOfRiskName: string;
}

export interface AssetReportSummary {
  uid: string;
  /** Тип актива в формате generated enum JSON name. */
  type: string;
  name: string;
  instruments: AssetReportInstrument[];
}

/** Отчет команды `instruments get-asset-by` на application/output boundary. */
export interface AssetReportFull extends AssetReportSummary {
  nameBrief: string;
  description: string;
  /** Дата удаления актива в ISO-формате или пустая строка. */
  deletedAt: string;
  requiredTests: string[];
  currencyBaseCurrency: string;
  securityIsin: string;
  securityType: string;
  /** Вид инструмента ценной бумаги в формате generated enum JSON name. */
  securityInstrumentKind: string;
  /** Государственный регистрационный код. */
  gosRegCode: string;
  /** CFI-код ценной бумаги. */
  cfi: string;
  /** Код НРД. */
  codeNsd: string;
  status: string;
  /** Бренд актива или `null`, если provider его не вернул. */
  brand: AssetReportBrand | null;
  /** Дата последнего обновления в ISO-формате или пустая строка. */
  updatedAt: string;
  brCode: string;
  brCodeName: string;
}

export type AssetReport = AssetReportFull | null;

/** Отчет команды `instruments get-assets` на application/output boundary. */
export type AssetsReport = AssetReportSummary[];
