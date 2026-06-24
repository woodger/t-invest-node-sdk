/** Один день торговой площадки в отчете команды `instruments trading-schedules`. */
export interface TradingSchedulesReportDay {
  /** Код торговой площадки. */
  exchange: string;
  /** Дата торгового дня в ISO-формате или пустая строка. */
  date: string;
  /** Признак торгового дня. */
  isTradingDay: boolean;
  /** Время начала основной торговой сессии в ISO-формате или пустая строка. */
  startTime: string;
  /** Время окончания основной торговой сессии в ISO-формате или пустая строка. */
  endTime: string;
  /** Время начала аукциона открытия в ISO-формате или пустая строка. */
  openingAuctionStartTime: string;
  /** Время окончания аукциона открытия в ISO-формате или пустая строка. */
  openingAuctionEndTime: string;
  /** Время начала аукциона закрытия в ISO-формате или пустая строка. */
  closingAuctionStartTime: string;
  /** Время окончания аукциона закрытия в ISO-формате или пустая строка. */
  closingAuctionEndTime: string;
  /** Время начала вечернего аукциона открытия в ISO-формате или пустая строка. */
  eveningOpeningAuctionStartTime: string;
  /** Время начала вечерней сессии в ISO-формате или пустая строка. */
  eveningStartTime: string;
  /** Время окончания вечерней сессии в ISO-формате или пустая строка. */
  eveningEndTime: string;
  /** Время начала клиринга в ISO-формате или пустая строка. */
  clearingStartTime: string;
  /** Время окончания клиринга в ISO-формате или пустая строка. */
  clearingEndTime: string;
  /** Время начала премаркета в ISO-формате или пустая строка. */
  premarketStartTime: string;
  /** Время окончания премаркета в ISO-формате или пустая строка. */
  premarketEndTime: string;
}

/** Отчет команды `instruments trading-schedules` на application/output boundary. */
export type TradingSchedulesReport = TradingSchedulesReportDay[];
