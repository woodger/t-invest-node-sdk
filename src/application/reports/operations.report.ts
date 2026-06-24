/** Одна операция в отчете команды `operations get-operations`. */
export interface OperationsReportOperation {
  /** Идентификатор операции. */
  id: string;
  /** Идентификатор родительской операции. */
  parentOperationId: string;
  /** Дата операции в ISO-формате или пустая строка. */
  date: string;
  /** Тип операции из provider contract. */
  type: string;
  /** Тип операции в формате generated enum JSON name. */
  operationType: string;
  /** Статус операции в формате generated enum JSON name. */
  state: string;
  /** Валюта операции. */
  currency: string;
  /** Платеж по операции в денежном строковом формате отчета. */
  payment: string;
  /** Цена операции в денежном строковом формате отчета. */
  price: string;
  /** Количество инструментов в операции. */
  quantity: number;
  /** Остаток количества по операции. */
  quantityRest: number;
  /** FIGI инструмента. */
  figi: string;
  /** UID инструмента. */
  instrumentUid: string;
  /** UID позиции инструмента. */
  positionUid: string;
  /** UID актива. */
  assetUid: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Количество сделок в операции. */
  tradesCount: number;
}

/** Отчет команды `operations get-operations` на application/output boundary. */
export type OperationsReport = OperationsReportOperation[];
