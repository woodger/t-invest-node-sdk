import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { CountryResponse } from '../../../generated/instruments';
import { createCountriesReport, formatCountriesReport } from './reporter';

function country(overrides: Partial<CountryResponse> = {}): CountryResponse {
  return {
    alfaTwo: 'RU',
    alfaThree: 'RUS',
    name: 'Russian Federation',
    nameBrief: 'Russia',
    ...overrides
  } as CountryResponse;
}

describe('countries reporter', () => {
  describe('createCountriesReport', () => {
    test('maps generated countries to stable report values', () => {
      const report = createCountriesReport([country()]);

      assert.deepEqual(report, [
        {
          alfaTwo: 'RU',
          alfaThree: 'RUS',
          name: 'Russian Federation',
          nameBrief: 'Russia'
        }
      ]);
    });
  });

  describe('formatCountriesReport', () => {
    test('formats report as table', () => {
      const output = formatCountriesReport(createCountriesReport([country()]), 'table');

      assert.match(output, /^alfaTwo\s+alfaThree\s+name\s+nameBrief/m);
      assert.match(output, /RU\s+RUS\s+Russian Federation\s+Russia/);
    });

    test('formats report as json', () => {
      const report = createCountriesReport([country()]);
      const output = formatCountriesReport(report, 'json');

      assert.equal(output, `${JSON.stringify(report, null, 2)}\n`);
    });
  });
});
