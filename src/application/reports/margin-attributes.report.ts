/** Отчет команды `users get-margin-attributes` на application/output boundary. */
export interface MarginAttributesReport {
  liquidPortfolio: string;
  startingMargin: string;
  minimalMargin: string;
  fundsSufficiencyLevel: string;
  amountOfMissingFunds: string;
  correctedMargin: string;
}
