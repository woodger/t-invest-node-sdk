export interface AssetReportInstrumentLink {
  type: string;
  instrumentUid: string;
}

export interface AssetReportInstrument {
  uid: string;
  figi: string;
  instrumentType: string;
  instrumentKind: string;
  ticker: string;
  classCode: string;
  positionUid: string;
  links: AssetReportInstrumentLink[];
}

export interface AssetReportBrand {
  uid: string;
  name: string;
  description: string;
  info: string;
  company: string;
  sector: string;
  countryOfRisk: string;
  countryOfRiskName: string;
}

export interface AssetReportSummary {
  uid: string;
  type: string;
  name: string;
  instruments: AssetReportInstrument[];
}

/** Отчет команды `instruments get-asset-by` на application/output boundary. */
export interface AssetReportFull extends AssetReportSummary {
  nameBrief: string;
  description: string;
  deletedAt: string;
  requiredTests: string[];
  currencyBaseCurrency: string;
  securityIsin: string;
  securityType: string;
  securityInstrumentKind: string;
  gosRegCode: string;
  cfi: string;
  codeNsd: string;
  status: string;
  brand: AssetReportBrand | null;
  updatedAt: string;
  brCode: string;
  brCodeName: string;
}

export type AssetReport = AssetReportFull | null;

/** Отчет команды `instruments get-assets` на application/output boundary. */
export type AssetsReport = AssetReportSummary[];
