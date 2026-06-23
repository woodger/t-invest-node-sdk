/** Один лимит unary-запросов в отчете команды `users get-user-tariff`. */
export interface UserTariffUnaryLimitReport {
  limitPerMinute: number;
  methods: string[];
}

/** Один лимит stream-соединений в отчете команды `users get-user-tariff`. */
export interface UserTariffStreamLimitReport {
  limit: number;
  streams: string[];
  open: number;
}

/** Отчет команды `users get-user-tariff` на application/output boundary. */
export interface UserTariffReport {
  unaryLimits: UserTariffUnaryLimitReport[];
  streamLimits: UserTariffStreamLimitReport[];
}
