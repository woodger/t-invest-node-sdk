import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { Brand } from '../../../generated/instruments';
import { createSingleBrandReport, formatBrandReport } from './reporter';

function brand(overrides: Partial<Brand> = {}): Brand {
  return {
    uid: 'brand-uid',
    name: 'T-Bank',
    description: 'Banking services',
    info: 'Issuer brand',
    company: 'T-Bank PJSC',
    sector: 'Financials',
    countryOfRisk: 'RU',
    countryOfRiskName: 'Russia',
    ...overrides
  } as Brand;
}

describe('brand reporter', () => {
  describe('formatBrandReport', () => {
    test('formats report as table', () => {
      const output = formatBrandReport(createSingleBrandReport(brand()), 'table');

      assert.match(output, /^uid\s+name\s+company\s+sector\s+countryOfRisk\s+countryOfRiskName/m);
      assert.match(output, /brand-uid\s+T-Bank\s+T-Bank PJSC\s+Financials\s+RU\s+Russia/);
    });

    test('formats report as json', () => {
      const report = createSingleBrandReport(brand());
      const output = formatBrandReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
