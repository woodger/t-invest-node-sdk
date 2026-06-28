import type { ReportMoney } from './money.report';

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
  /** Цена сделки или `null`, если provider не вернул значение. */
  price: ReportMoney | null;
  /** Количество инструментов в сделке. */
  quantity: number;
  /** Сумма заявки или `null`, если provider не вернул значение. */
  orderAmount: ReportMoney | null;
  /** НКД в строковом формате quotation. */
  aciValue: string;
  /** Полная сумма заявки или `null`, если provider не вернул значение. */
  totalOrderAmount: ReportMoney | null;
  /** Комиссия брокера или `null`, если provider не вернул значение. */
  brokerCommission: ReportMoney | null;
  /** Комиссия биржи или `null`, если provider не вернул значение. */
  exchangeCommission: ReportMoney | null;
  /** Клиринговая комиссия биржи или `null`, если provider не вернул значение. */
  exchangeClearingCommission: ReportMoney | null;
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
