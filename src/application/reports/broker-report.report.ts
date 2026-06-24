export interface BrokerReportTaskReport {
  /** Тип отчета для ответа запуска формирования. */
  type: 'generate';
  /** Идентификатор задачи формирования брокерского отчета. */
  taskId: string;
}

export interface BrokerReportPageInfo {
  /** Номер текущей страницы отчета. */
  page: number;
  /** Общее количество страниц отчета. */
  pagesCount: number;
  /** Количество записей в отчете. */
  itemsCount: number;
}

export interface BrokerReportItemReport {
  /** Идентификатор сделки. */
  tradeId: string;
  /** Идентификатор заявки. */
  orderId: string;
  /** FIGI инструмента. */
  figi: string;
  /** Признак исполнения сделки. */
  executeSign: string;
  /** Дата и время сделки в ISO-формате или пустая строка. */
  tradeDatetime: string;
  /** Торговая площадка. */
  exchange: string;
  /** Class code инструмента. */
  classCode: string;
  /** Направление сделки. */
  direction: string;
  /** Название инструмента. */
  name: string;
  /** Тикер инструмента. */
  ticker: string;
  /** Цена сделки в денежном строковом формате отчета. */
  price: string;
  /** Количество инструментов в сделке. */
  quantity: number;
  /** Сумма заявки в денежном строковом формате отчета. */
  orderAmount: string;
  /** НКД в строковом формате quotation. */
  aciValue: string;
  /** Полная сумма заявки в денежном строковом формате отчета. */
  totalOrderAmount: string;
  /** Комиссия брокера в денежном строковом формате отчета. */
  brokerCommission: string;
  /** Комиссия биржи в денежном строковом формате отчета. */
  exchangeCommission: string;
  /** Клиринговая комиссия биржи в денежном строковом формате отчета. */
  exchangeClearingCommission: string;
  /** Ставка РЕПО в строковом формате quotation. */
  repoRate: string;
  /** Сторона сделки. */
  party: string;
  /** Дата расчетов по деньгам в ISO-формате или пустая строка. */
  clearValueDate: string;
  /** Дата расчетов по ценным бумагам в ISO-формате или пустая строка. */
  secValueDate: string;
  /** Статус брокера по сделке. */
  brokerStatus: string;
  /** Тип отдельного соглашения. */
  separateAgreementType: string;
  /** Номер отдельного соглашения. */
  separateAgreementNumber: string;
  /** Дата отдельного соглашения. */
  separateAgreementDate: string;
  /** Тип расчета по сделке. */
  deliveryType: string;
}

export interface BrokerReportPageReport {
  /** Тип отчета для страницы брокерского отчета. */
  type: 'page';
  /** Метаданные страницы. */
  page: BrokerReportPageInfo;
  /** Записи страницы брокерского отчета. */
  items: BrokerReportItemReport[];
}

export interface BrokerReportEmptyReport {
  /** Тип отчета для пустого provider response. */
  type: 'empty';
}

/** Отчет команды `operations get-broker-report` на application/output boundary. */
export type BrokerReportReport =
  | BrokerReportTaskReport
  | BrokerReportPageReport
  | BrokerReportEmptyReport;
