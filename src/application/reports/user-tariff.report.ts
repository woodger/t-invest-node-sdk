/** Один лимит unary-запросов в отчете команды `users get-user-tariff`. */
export interface UserTariffUnaryLimitReport {
  /** Лимит запросов в минуту. */
  limitPerMinute: number;
  /** Методы, на которые распространяется лимит. */
  methods: string[];
}

/** Один лимит stream-соединений в отчете команды `users get-user-tariff`. */
export interface UserTariffStreamLimitReport {
  /** Лимит одновременных stream-соединений. */
  limit: number;
  /** Stream-методы, на которые распространяется лимит. */
  streams: string[];
  /** Количество открытых stream-соединений. */
  open: number;
}

/** Отчет команды `users get-user-tariff` на application/output boundary. */
export interface UserTariffReport {
  /** Лимиты unary-запросов. */
  unaryLimits: UserTariffUnaryLimitReport[];
  /** Лимиты stream-соединений. */
  streamLimits: UserTariffStreamLimitReport[];
}
