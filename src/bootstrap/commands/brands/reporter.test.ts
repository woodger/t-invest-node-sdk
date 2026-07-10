import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { Brand } from '../../../generated/instruments';
import { createBrandsReport, formatBrandsReport } from './reporter';

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

describe('brands reporter', () => {
  describe('createBrandsReport', () => {
    test('maps generated brands to stable report values', () => {
      const report = createBrandsReport([brand()]);

      assert.deepEqual(report, [
        {
          uid: 'brand-uid',
          name: 'T-Bank',
          description: 'Banking services',
          info: 'Issuer brand',
          company: 'T-Bank PJSC',
          sector: 'Financials',
          countryOfRisk: 'RU',
          countryOfRiskName: 'Russia'
        }
      ]);
    });
  });

  describe('formatBrandsReport', () => {
    test('formats report as table', () => {
      const output = formatBrandsReport(createBrandsReport([brand()]), 'table');

      assert.match(output, /^uid\s+name\s+company\s+sector\s+countryOfRisk\s+countryOfRiskName/m);
      assert.match(output, /brand-uid\s+T-Bank\s+T-Bank PJSC\s+Financials\s+RU\s+Russia/);
      assert.doesNotMatch(output, /Banking services/);
    });

    test('formats report as json', () => {
      const output = formatBrandsReport(createBrandsReport([brand()]), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].uid, 'brand-uid');
      assert.equal(parsed[0].description, 'Banking services');
      assert.equal(parsed[0].info, 'Issuer brand');
    });
  });
});
