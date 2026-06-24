/** Отчет команды `users get-info` на application/output boundary. */
export interface UserInfoReport {
  /** Признак премиального статуса пользователя. */
  premStatus: boolean;
  /** Признак статуса квалифицированного инвестора. */
  qualStatus: boolean;
  /** Инструменты, доступные пользователю как квалифицированному инвестору. */
  qualifiedForWorkWith: string[];
  /** Тариф пользователя. */
  tariff: string;
}
