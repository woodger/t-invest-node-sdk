import type { ReportMoney } from './money.report';

/** Метаданные страницы в отчете команды `operations get-operations-by-cursor`. */
export interface OperationsByCursorReportPage {
  /** Есть ли следующая страница операций. */
  hasNext: boolean;
  /** Cursor следующей страницы или пустая строка. */
  nextCursor: string;
  /** Количество операций в текущей странице. */
  itemsCount: number;
}

/** Одна операция в отчете команды `operations get-operations-by-cursor`. */
export interface OperationsByCursorReportItem {
  /** Cursor операции. */
  cursor: string;
  /** Идентификатор брокерского счета. */
  brokerAccountId: string;
  /** Идентификатор операции. */
  id: string;
  /** Идентификатор родительской операции. */
  parentOperationId: string;
  /** Название операции. */
  name: string;
  /** Дата операции в ISO-формате или пустая строка. */
  date: string;
  /** Тип операции в формате generated enum JSON name. */
  type: string;
  /** Описание операции. */
  description: string;
  /** Статус операции в формате generated enum JSON name. */
  state: string;
  /** FIGI инструмента. */
  figi: string;
  /** UID инструмента. */
  instrumentUid: string;
  /** Тип инструмента из provider contract. */
  instrumentType: string;
  /** Вид инструмента в формате generated enum JSON name. */
  instrumentKind: string;
  /** UID позиции инструмента. */
  positionUid: string;
  /** Платеж по операции или `null`, если provider не вернул значение. */
  payment: ReportMoney | null;
  /** Цена операции или `null`, если provider не вернул значение. */
  price: ReportMoney | null;
  /** Комиссия или `null`, если provider не вернул значение. */
  commission: ReportMoney | null;
  /** Доходность или `null`, если provider не вернул значение. */
  yield: ReportMoney | null;
  /** Относительная доходность в строковом формате quotation. */
  yieldRelative: string;
  /** НКД или `null`, если provider не вернул значение. */
  accruedInt: ReportMoney | null;
  /** Количество инструментов в операции. */
  quantity: number;
  /** Остаток количества по операции. */
  quantityRest: number;
  /** Исполненное количество по операции. */
  quantityDone: number;
  /** Дата отмены операции в ISO-формате или пустая строка. */
  cancelDateTime: string;
  /** Причина отмены операции. */
  cancelReason: string;
  /** UID актива. */
  assetUid: string;
  /** Количество сделок в операции. */
  tradesCount: number;
}

/** Отчет команды `operations get-operations-by-cursor` на application/output boundary. */
export interface OperationsByCursorReport {
  /** Метаданные текущей cursor-страницы. */
  page: OperationsByCursorReportPage;
  /** Операции текущей cursor-страницы. */
  items: OperationsByCursorReportItem[];
}
