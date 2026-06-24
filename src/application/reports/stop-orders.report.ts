/** Одна активная стоп-заявка в отчете команды `stoporders get-stop-orders`. */
export interface StopOrdersReportOrder {
  /** Идентификатор стоп-заявки. */
  stopOrderId: string;
  /** Запрошенное количество лотов. */
  lotsRequested: number;
  /** FIGI инструмента. */
  figi: string;
  /** UID инструмента. */
  instrumentUid: string;
  /** Направление стоп-заявки в формате generated enum JSON name. */
  direction: string;
  /** Валюта стоп-заявки. */
  currency: string;
  /** Тип стоп-заявки в формате generated enum JSON name. */
  orderType: string;
  /** Дата создания в ISO-формате или пустая строка. */
  createDate: string;
  /** Дата активации в ISO-формате или пустая строка. */
  activationDateTime: string;
  /** Дата истечения в ISO-формате или пустая строка. */
  expirationTime: string;
  /** Цена заявки в денежном строковом формате отчета. */
  price: string;
  /** Стоп-цена в денежном строковом формате отчета. */
  stopPrice: string;
}

/** Отчет команды `stoporders get-stop-orders` на application/output boundary. */
export type StopOrdersReport = StopOrdersReportOrder[];
