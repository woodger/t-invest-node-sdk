/** Отчет команды `users get-info` на application/output boundary. */
export interface UserInfoReport {
  premStatus: boolean;
  qualStatus: boolean;
  qualifiedForWorkWith: string[];
  tariff: string;
}
