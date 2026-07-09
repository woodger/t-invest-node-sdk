/**
 * Модуль side-effect command args хранит общую защиту mutating CLI-команд.
 *
 * Здесь допустимы:
 * - общий `--confirm` contract;
 * - применение package config policy для side-effect confirmation;
 * - parsing денежных decimal values для generated quotation;
 * - ошибки, останавливающие side-effect command до SDK call;
 *
 * Здесь не должно быть конкретных order/sandbox request mappings.
 */

import type { Quotation } from '../../generated/t_tech/invest/grpc/common';
import { defaultConfig } from '../../config';

export const sideEffectConfirmationOptionsSchema = {
  confirm: {
    type: 'boolean'
  }
} as const;

export function assertSideEffectConfirmed(
  confirm: boolean | undefined,
  requireConfirmation: boolean = defaultConfig.requireSideEffectConfirmation
): void {
  if (requireConfirmation && confirm !== true) {
    throw new Error("Expected '--confirm' to execute side-effect command");
  }
}

export function parsePositiveQuotationOption(value: string, name: string): Quotation {
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,9})?$/.test(value)) {
    throw new Error(decimalErrorMessage(name));
  }

  const [unitsText, fractionText = ''] = value.split('.');
  const units = Number(unitsText);
  const nano = Number(fractionText.padEnd(9, '0'));

  if (!Number.isSafeInteger(units) || units === 0 && nano === 0) {
    throw new Error(decimalErrorMessage(name));
  }

  return {
    units,
    nano
  };
}

export function parseOptionalPositiveQuotationOption(
  value: string | undefined,
  name: string
): Quotation | undefined {
  return value === undefined ? undefined : parsePositiveQuotationOption(value, name);
}

function decimalErrorMessage(name: string): string {
  return `Expected '--${name}' as decimal greater than 0 with up to 9 fractional digits`;
}
