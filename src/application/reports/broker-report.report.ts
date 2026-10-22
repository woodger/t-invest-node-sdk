/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

import type { ReportMoney } from './money.report';

/** Идентификатор задачи, полученный при запуске формирования брокерского отчёта. */
export interface BrokerReportTaskReport {
  type: 'generate';
  taskId: string;
}

/** Положение страницы брокерского отчёта и общее число страниц и записей. */
export interface BrokerReportPageInfo {
  page: number;
  pagesCount: number;
  itemsCount: number;
}

/**
 * Запись о сделке в брокерском отчёте с нормализованными датами и денежными
 * значениями.
 */
export interface BrokerReportItemReport {
  tradeId: string;
  orderId: string;
  figi: string;
  /** Признак исполнения сделки. */
  executeSign: string;
  /** Дата и время сделки в ISO-формате или пустая строка. */
  tradeDatetime: string;
  exchange: string;
  classCode: string;
  direction: string;
  name: string;
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
  /**
   * Клиринговая комиссия биржи или `null`, если provider не вернул значение.
   */
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
  separateAgreementType: string;
  separateAgreementNumber: string;
  separateAgreementDate: string;
  deliveryType: string;
}

/** Страница готового брокерского отчёта с данными пагинации и записями о сделках. */
export interface BrokerReportPageReport {
  type: 'page';
  page: BrokerReportPageInfo;
  items: BrokerReportItemReport[];
}

/** Результат ответа без задачи формирования и страницы брокерского отчёта. */
export interface BrokerReportEmptyReport {
  /** Тип отчета для пустого provider response. */
  type: 'empty';
}

/**
 * Отчет команды `operations get-broker-report` на application/output boundary.
 */
export type BrokerReportReport =
  | BrokerReportTaskReport
  | BrokerReportPageReport
  | BrokerReportEmptyReport;
