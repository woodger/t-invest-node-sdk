/** Один бренд в отчете команд `instruments get-brands` и `instruments get-brand-by`. */
export interface BrandsReportBrand {
  uid: string;
  name: string;
  description: string;
  info: string;
  company: string;
  sector: string;
  countryOfRisk: string;
  countryOfRiskName: string;
}

/** Отчет команды `instruments get-brands` на application/output boundary. */
export type BrandsReport = BrandsReportBrand[];

/** Отчет команды `instruments get-brand-by` на application/output boundary. */
export type BrandReport = BrandsReportBrand;
