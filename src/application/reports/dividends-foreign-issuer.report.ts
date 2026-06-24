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
  recordDate: string;
  paymentDate: string;
  securityName: string;
  isin: string;
  issuerCountry: string;
  quantity: number;
  dividend: string;
  externalCommission: string;
  dividendGross: string;
  tax: string;
  dividendAmount: string;
  currency: string;
}

export interface DividendsForeignIssuerPageReport {
  type: 'page';
  page: DividendsForeignIssuerPageInfo;
  items: DividendsForeignIssuerItemReport[];
}

export interface DividendsForeignIssuerEmptyReport {
  type: 'empty';
}

/** Отчет команды `operations get-dividends-foreign-issuer` на application/output boundary. */
export type DividendsForeignIssuerReport =
  | DividendsForeignIssuerTaskReport
  | DividendsForeignIssuerPageReport
  | DividendsForeignIssuerEmptyReport;
