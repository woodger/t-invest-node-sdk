/** Отчет команды `users get-margin-attributes` на application/output boundary. */
export interface MarginAttributesReport {
  /** Ликвидная стоимость портфеля в денежном строковом формате отчета. */
  liquidPortfolio: string;
  /** Начальная маржа в денежном строковом формате отчета. */
  startingMargin: string;
  /** Минимальная маржа в денежном строковом формате отчета. */
  minimalMargin: string;
  /** Уровень достаточности средств в строковом формате quotation. */
  fundsSufficiencyLevel: string;
  /** Недостающие средства в денежном строковом формате отчета. */
  amountOfMissingFunds: string;
  /** Скорректированная маржа в денежном строковом формате отчета. */
  correctedMargin: string;
}
