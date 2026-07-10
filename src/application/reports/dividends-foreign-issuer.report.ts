/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

export interface DividendsForeignIssuerTaskReport {
  type: 'generate';
  taskId: string;
}

export interface DividendsForeignIssuerPageInfo {
  page: number;
  pagesCount: number;
  itemsCount: number;
}

export interface DividendsForeignIssuerItemReport {
  /** Дата фиксации реестра в ISO-формате или пустая строка. */
  recordDate: string;
  /** Дата выплаты в ISO-формате или пустая строка. */
  paymentDate: string;
  securityName: string;
  isin: string;
  issuerCountry: string;
  /** Количество ценных бумаг. */
  quantity: number;
  /** Выплата на одну бумагу в строковом формате quotation. */
  dividend: string;
  /** Комиссия внешних платежных агентов в строковом формате quotation. */
  externalCommission: string;
  /** Сумма до удержания налога в строковом формате quotation. */
  dividendGross: string;
  /** Удержанный налог в строковом формате quotation. */
  tax: string;
  /** Итоговая сумма выплаты в строковом формате quotation. */
  dividendAmount: string;
  currency: string;
}

export interface DividendsForeignIssuerPageReport {
  type: 'page';
  page: DividendsForeignIssuerPageInfo;
  items: DividendsForeignIssuerItemReport[];
}

export interface DividendsForeignIssuerEmptyReport {
  /** Тип отчета для пустого provider response. */
  type: 'empty';
}

/** Отчет команды `operations get-dividends-foreign-issuer` на application/output boundary. */
export type DividendsForeignIssuerReport =
  | DividendsForeignIssuerTaskReport
  | DividendsForeignIssuerPageReport
  | DividendsForeignIssuerEmptyReport;
