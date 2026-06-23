export interface BrokerReportTaskReport {
  type: 'generate';
  taskId: string;
}

export interface BrokerReportPageInfo {
  page: number;
  pagesCount: number;
  itemsCount: number;
}

export interface BrokerReportItemReport {
  tradeId: string;
  orderId: string;
  figi: string;
  executeSign: string;
  tradeDatetime: string;
  exchange: string;
  classCode: string;
  direction: string;
  name: string;
  ticker: string;
  price: string;
  quantity: number;
  orderAmount: string;
  aciValue: string;
  totalOrderAmount: string;
  brokerCommission: string;
  exchangeCommission: string;
  exchangeClearingCommission: string;
  repoRate: string;
  party: string;
  clearValueDate: string;
  secValueDate: string;
  brokerStatus: string;
  separateAgreementType: string;
  separateAgreementNumber: string;
  separateAgreementDate: string;
  deliveryType: string;
}

export interface BrokerReportPageReport {
  type: 'page';
  page: BrokerReportPageInfo;
  items: BrokerReportItemReport[];
}

export interface BrokerReportEmptyReport {
  type: 'empty';
}

/** Отчет команды `operations get-broker-report` на application/output boundary. */
export type BrokerReportReport =
  | BrokerReportTaskReport
  | BrokerReportPageReport
  | BrokerReportEmptyReport;
