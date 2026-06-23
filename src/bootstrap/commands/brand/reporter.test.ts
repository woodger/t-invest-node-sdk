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
  };
}

describe('brand reporter', () => {
  describe('createSingleBrandReport', () => {
    test('maps generated brand to stable report values', () => {
      const report = createSingleBrandReport(brand());

      assert.deepEqual(report, {
        uid: 'brand-uid',
        name: 'T-Bank',
        description: 'Banking services',
        info: 'Issuer brand',
        company: 'T-Bank PJSC',
        sector: 'Financials',
        countryOfRisk: 'RU',
        countryOfRiskName: 'Russia'
      });
    });
  });

  describe('formatBrandReport', () => {
    test('formats report as table', () => {
      const output = formatBrandReport(createSingleBrandReport(brand()), 'table');

      assert.match(output, /^uid\s+name\s+company\s+sector\s+countryOfRisk\s+countryOfRiskName/m);
      assert.match(output, /brand-uid\s+T-Bank\s+T-Bank PJSC\s+Financials\s+RU\s+Russia/);
    });

    test('formats report as json', () => {
      const output = formatBrandReport(createSingleBrandReport(brand()), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.uid, 'brand-uid');
      assert.equal(parsed.description, 'Banking services');
    });
  });
});
