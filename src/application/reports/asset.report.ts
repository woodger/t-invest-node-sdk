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
  /** UID связанного инструмента. */
  instrumentUid: string;
}

export interface AssetReportInstrument {
  /** UID инструмента. */
  uid: string;
  /** FIGI инструмента. */
  figi: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Вид инструмента в формате generated enum JSON name. */
  instrumentKind: string;
  /** Тикер инструмента. */
  ticker: string;
  /** Class code инструмента. */
  classCode: string;
  /** UID позиции инструмента. */
  positionUid: string;
  /** Связи инструмента с другими инструментами актива. */
  links: AssetReportInstrumentLink[];
}

export interface AssetReportBrand {
  /** UID бренда. */
  uid: string;
  /** Название бренда. */
  name: string;
  /** Описание бренда. */
  description: string;
  /** Дополнительная информация о бренде. */
  info: string;
  /** Компания бренда. */
  company: string;
  /** Сектор экономики бренда. */
  sector: string;
  /** Код страны риска. */
  countryOfRisk: string;
  /** Название страны риска. */
  countryOfRiskName: string;
}

export interface AssetReportSummary {
  /** UID актива. */
  uid: string;
  /** Тип актива в формате generated enum JSON name. */
  type: string;
  /** Название актива. */
  name: string;
  /** Инструменты, связанные с активом. */
  instruments: AssetReportInstrument[];
}

/** Отчет команды `instruments get-asset-by` на application/output boundary. */
export interface AssetReportFull extends AssetReportSummary {
  /** Краткое название актива. */
  nameBrief: string;
  /** Описание актива. */
  description: string;
  /** Дата удаления актива в ISO-формате или пустая строка. */
  deletedAt: string;
  /** Тесты, требуемые для доступа к активу. */
  requiredTests: string[];
  /** Базовая валюта валютного актива. */
  currencyBaseCurrency: string;
  /** ISIN ценной бумаги актива. */
  securityIsin: string;
  /** Тип ценной бумаги актива. */
  securityType: string;
  /** Вид инструмента ценной бумаги в формате generated enum JSON name. */
  securityInstrumentKind: string;
  /** Государственный регистрационный код. */
  gosRegCode: string;
  /** CFI-код ценной бумаги. */
  cfi: string;
  /** Код НРД. */
  codeNsd: string;
  /** Статус актива. */
  status: string;
  /** Бренд актива или `null`, если provider его не вернул. */
  brand: AssetReportBrand | null;
  /** Дата последнего обновления в ISO-формате или пустая строка. */
  updatedAt: string;
  /** BR-код актива. */
  brCode: string;
  /** Название BR-кода актива. */
  brCodeName: string;
}

export type AssetReport = AssetReportFull | null;

/** Отчет команды `instruments get-assets` на application/output boundary. */
export type AssetsReport = AssetReportSummary[];
