/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

/** Один счет в отчете команды `users get-accounts`. */
export interface AccountsReportAccount {
  id: string;
  name: string;
  /** Тип счета в формате generated enum JSON name. */
  type: string;
  /** Статус счета в формате generated enum JSON name. */
  status: string;
  /** Уровень доступа к счету в формате generated enum JSON name. */
  accessLevel: string;
  /** Дата открытия счета в ISO-формате или пустая строка, если дата не пришла от provider-а. */
  openedDate: string;
  /** Дата закрытия счета в ISO-формате или пустая строка для открытого счета. */
  closedDate: string;
}

/** Отчет команды `users get-accounts` на application/output boundary. */
export type AccountsReport = AccountsReportAccount[];
