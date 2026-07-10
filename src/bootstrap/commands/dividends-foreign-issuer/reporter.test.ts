import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { Quotation } from '../../../generated/common';
import type {
  DividendsForeignIssuerReport as GeneratedDividendsForeignIssuerReport,
  GetDividendsForeignIssuerResponse
} from '../../../generated/operations';
import {
  createDividendsForeignIssuerReport,
  formatDividendsForeignIssuerReport
} from './reporter';

function quotation(units: number, nano: number): Quotation {
  return {
    units,
    nano
  };
}

function item(
  overrides: Partial<GeneratedDividendsForeignIssuerReport> = {}
): GeneratedDividendsForeignIssuerReport {
  return {
    recordDate: new Date('2026-05-01T00:00:00.000Z'),
    paymentDate: new Date('2026-05-15T00:00:00.000Z'),
    securityName: 'US Dividend Stock',
    isin: 'US0000000001',
    issuerCountry: 'US',
    quantity: 10,
    dividend: quotation(1, 500000000),
    externalCommission: quotation(0, 100000000),
    dividendGross: quotation(15, 0),
    tax: quotation(2, 250000000),
    dividendAmount: quotation(12, 750000000),
    currency: 'usd',
    ...overrides
  } as GeneratedDividendsForeignIssuerReport;
}

function response(
  overrides: Partial<GetDividendsForeignIssuerResponse> = {}
): GetDividendsForeignIssuerResponse {
  return {
    generateDivForeignIssuerReportResponse: undefined,
    divForeignIssuerReport: undefined,
    ...overrides
  } as GetDividendsForeignIssuerResponse;
}

describe('dividends-foreign-issuer reporter', () => {
  describe('createDividendsForeignIssuerReport', () => {
    test('maps generate response to stable report values', () => {
      const report = createDividendsForeignIssuerReport(response({
        generateDivForeignIssuerReportResponse: {
          taskId: 'task-id'
        }
      }));

      assert.deepEqual(report, {
        type: 'generate',
        taskId: 'task-id'
      });
    });

    test('maps page response to stable report values', () => {
      const report = createDividendsForeignIssuerReport(response({
        divForeignIssuerReport: {
          dividendsForeignIssuerReport: [item()],
          itemsCount: 1,
          pagesCount: 3,
          page: 2
        }
      }));

      assert.deepEqual(report, {
        type: 'page',
        page: {
          page: 2,
          pagesCount: 3,
          itemsCount: 1
        },
        items: [
          {
            recordDate: '2026-05-01T00:00:00.000Z',
            paymentDate: '2026-05-15T00:00:00.000Z',
            securityName: 'US Dividend Stock',
            isin: 'US0000000001',
            issuerCountry: 'US',
            quantity: 10,
            dividend: '1.5',
            externalCommission: '0.1',
            dividendGross: '15',
            tax: '2.25',
            dividendAmount: '12.75',
            currency: 'usd'
          }
        ]
      });
    });

    test('maps empty response to empty report', () => {
      assert.deepEqual(createDividendsForeignIssuerReport(response()), {
        type: 'empty'
      });
    });
  });

  describe('formatDividendsForeignIssuerReport', () => {
    test('formats generate report as table', () => {
      const output = formatDividendsForeignIssuerReport({
        type: 'generate',
        taskId: 'task-id'
      }, 'table');

      assert.equal(output, 'type: generate\ntaskId: task-id\n');
    });

    test('formats page report as table', () => {
      const report = createDividendsForeignIssuerReport(response({
        divForeignIssuerReport: {
          dividendsForeignIssuerReport: [item()],
          itemsCount: 1,
          pagesCount: 3,
          page: 2
        }
      }));

      const output = formatDividendsForeignIssuerReport(report, 'table');

      assert.match(output, /page: 2/);
      assert.match(output, /pagesCount: 3/);
      assert.match(output, /^recordDate\s+paymentDate\s+securityName\s+isin/m);
      assert.match(output, /2026-05-01T00:00:00.000Z\s+2026-05-15T00:00:00.000Z/);
      assert.match(output, /US Dividend Stock\s+US0000000001\s+US\s+10\s+1.5\s+15\s+2.25\s+12.75\s+usd/);
      assert.doesNotMatch(output, /externalCommission/);
    });

    test('formats page report as json', () => {
      const report = createDividendsForeignIssuerReport(response({
        divForeignIssuerReport: {
          dividendsForeignIssuerReport: [item()],
          itemsCount: 1,
          pagesCount: 3,
          page: 2
        }
      }));

      const output = formatDividendsForeignIssuerReport(report, 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.type, 'page');
      assert.equal(parsed.items[0].isin, 'US0000000001');
      assert.equal(parsed.items[0].externalCommission, '0.1');
    });

    test('formats empty report as table', () => {
      assert.equal(
        formatDividendsForeignIssuerReport({ type: 'empty' }, 'table'),
        'type: empty\n'
      );
    });
  });
});
