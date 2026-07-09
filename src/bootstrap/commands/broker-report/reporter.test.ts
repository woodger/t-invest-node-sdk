import assert from 'node:assert';
import { describe, test } from 'node:test';
import type {
  MoneyValue,
  Quotation
} from '../../../generated/t_tech/invest/grpc/common';
import type {
  BrokerReport,
  BrokerReportResponse
} from '../../../generated/t_tech/invest/grpc/operations';
import { createBrokerReportReport, formatBrokerReportReport } from './reporter';

function money(currency: string, units: number, nano: number): MoneyValue {
  return { currency, units, nano };
}

function quotation(units: number, nano: number): Quotation {
  return { units, nano };
}

function item(overrides: Partial<BrokerReport> = {}): BrokerReport {
  return {
    tradeId: 'trade-id',
    orderId: 'order-id',
    figi: 'BBG00QPYJ5H0',
    executeSign: 'executed',
    tradeDatetime: new Date('2026-06-10T10:00:00.000Z'),
    exchange: 'MOEX',
    classCode: 'TQBR',
    direction: 'Buy',
    name: 'T-Bank',
    ticker: 'TCSG',
    price: money('rub', 100, 500000000),
    quantity: 2,
    orderAmount: money('rub', 201, 0),
    aciValue: quotation(0, 100000000),
    totalOrderAmount: money('rub', 201, 100000000),
    brokerCommission: money('rub', 1, 0),
    exchangeCommission: money('rub', 0, 500000000),
    exchangeClearingCommission: money('rub', 0, 100000000),
    repoRate: quotation(0, 250000000),
    party: 'Broker',
    clearValueDate: new Date('2026-06-11T00:00:00.000Z'),
    secValueDate: new Date('2026-06-12T00:00:00.000Z'),
    brokerStatus: 'done',
    separateAgreementType: 'type',
    separateAgreementNumber: 'number',
    separateAgreementDate: '2026-06-01',
    deliveryType: 'delivery',
    ...overrides
  } as BrokerReport;
}

function response(overrides: Partial<BrokerReportResponse> = {}): BrokerReportResponse {
  return {
    generateBrokerReportResponse: undefined,
    getBrokerReportResponse: undefined,
    ...overrides
  } as BrokerReportResponse;
}

describe('broker-report reporter', () => {
  describe('createBrokerReportReport', () => {
    test('maps generate response to stable report values', () => {
      const report = createBrokerReportReport(response({
        generateBrokerReportResponse: {
          taskId: 'task-id'
        }
      }));

      assert.deepEqual(report, {
        type: 'generate',
        taskId: 'task-id'
      });
    });

    test('maps page response to stable report values', () => {
      const report = createBrokerReportReport(response({
        getBrokerReportResponse: {
          brokerReport: [item()],
          itemsCount: 1,
          pagesCount: 3,
          page: 2,
          taskId: ''
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
            tradeId: 'trade-id',
            orderId: 'order-id',
            figi: 'BBG00QPYJ5H0',
            executeSign: 'executed',
            tradeDatetime: '2026-06-10T10:00:00.000Z',
            exchange: 'MOEX',
            classCode: 'TQBR',
            direction: 'Buy',
            name: 'T-Bank',
            ticker: 'TCSG',
            price: {
              currency: 'rub',
              amount: '100.5'
            },
            quantity: 2,
            orderAmount: {
              currency: 'rub',
              amount: '201'
            },
            aciValue: '0.1',
            totalOrderAmount: {
              currency: 'rub',
              amount: '201.1'
            },
            brokerCommission: {
              currency: 'rub',
              amount: '1'
            },
            exchangeCommission: {
              currency: 'rub',
              amount: '0.5'
            },
            exchangeClearingCommission: {
              currency: 'rub',
              amount: '0.1'
            },
            repoRate: '0.25',
            party: 'Broker',
            clearValueDate: '2026-06-11T00:00:00.000Z',
            secValueDate: '2026-06-12T00:00:00.000Z',
            brokerStatus: 'done',
            separateAgreementType: 'type',
            separateAgreementNumber: 'number',
            separateAgreementDate: '2026-06-01',
            deliveryType: 'delivery'
          }
        ]
      });
    });

    test('maps empty response to empty report', () => {
      assert.deepEqual(createBrokerReportReport(response()), {
        type: 'empty'
      });
    });
  });

  describe('formatBrokerReportReport', () => {
    test('formats generate report as table', () => {
      const output = formatBrokerReportReport({
        type: 'generate',
        taskId: 'task-id'
      }, 'table');

      assert.equal(output, 'type: generate\ntaskId: task-id\n');
    });

    test('formats page report as table', () => {
      const report = createBrokerReportReport(response({
        getBrokerReportResponse: {
          brokerReport: [item()],
          itemsCount: 1,
          pagesCount: 3,
          page: 2,
          taskId: ''
        }
      }));

      const output = formatBrokerReportReport(report, 'table');

      assert.match(output, /page: 2/);
      assert.match(output, /pagesCount: 3/);
      assert.match(output, /^tradeId\s+orderId\s+tradeDatetime\s+figi/m);
      assert.match(output, /trade-id\s+order-id\s+2026-06-10T10:00:00.000Z/);
      assert.match(output, /TCSG\s+Buy\s+100.5 rub\s+2\s+201 rub\s+201.1 rub\s+1 rub/);
      assert.doesNotMatch(output, /exchangeClearingCommission/);
    });

    test('formats page report as json', () => {
      const report = createBrokerReportReport(response({
        getBrokerReportResponse: {
          brokerReport: [item()],
          itemsCount: 1,
          pagesCount: 3,
          page: 2,
          taskId: ''
        }
      }));

      const output = formatBrokerReportReport(report, 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed.type, 'page');
      assert.equal(parsed.items[0].tradeId, 'trade-id');
      assert.deepEqual(parsed.items[0].exchangeClearingCommission, {
        currency: 'rub',
        amount: '0.1'
      });
    });

    test('formats empty report as table', () => {
      assert.equal(formatBrokerReportReport({ type: 'empty' }, 'table'), 'type: empty\n');
    });
  });
});
