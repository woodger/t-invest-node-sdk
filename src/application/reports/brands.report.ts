/** Один бренд в отчете команд `instruments get-brands` и `instruments get-brand-by`. */
export interface BrandsReportBrand {
  /** UID бренда. */
  uid: string;
  /** Название бренда. */
  name: string;
  /** Описание бренда. */
  description: string;
  /** Дополнительная информация о бренде. */
  info: string;
  /** Компания бренда. */
  company: string;
  /** Сектор экономики бренда. */
  sector: string;
  /** Код страны риска. */
  countryOfRisk: string;
  /** Название страны риска. */
  countryOfRiskName: string;
}

/** Отчет команды `instruments get-brands` на application/output boundary. */
export type BrandsReport = BrandsReportBrand[];

/** Отчет команды `instruments get-brand-by` на application/output boundary. */
export type BrandReport = BrandsReportBrand;
