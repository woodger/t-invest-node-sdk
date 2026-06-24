export interface DividendsForeignIssuerTaskReport {
  /** Тип отчета для ответа запуска формирования. */
  type: 'generate';
  /** Идентификатор задачи формирования отчета. */
  taskId: string;
}

export interface DividendsForeignIssuerPageInfo {
  /** Номер текущей страницы отчета. */
  page: number;
  /** Общее количество страниц отчета. */
  pagesCount: number;
  /** Количество записей в отчете. */
  itemsCount: number;
}

export interface DividendsForeignIssuerItemReport {
  /** Дата фиксации реестра в ISO-формате или пустая строка. */
  recordDate: string;
  /** Дата выплаты в ISO-формате или пустая строка. */
  paymentDate: string;
  /** Название ценной бумаги. */
  securityName: string;
  /** ISIN ценной бумаги. */
  isin: string;
  /** Страна эмитента. */
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
  /** Валюта выплаты. */
  currency: string;
}

export interface DividendsForeignIssuerPageReport {
  /** Тип отчета для страницы отчета. */
  type: 'page';
  /** Метаданные страницы. */
  page: DividendsForeignIssuerPageInfo;
  /** Записи страницы отчета. */
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
