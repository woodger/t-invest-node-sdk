import type { Quotation } from '../../generated/common';

export const sideEffectConfirmationOptionsSchema = {
  confirm: {
    type: 'boolean'
  }
} as const;

export function assertSideEffectConfirmed(confirm: boolean | undefined): void {
  if (confirm !== true) {
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
