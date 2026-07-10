import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { MoneyValue } from '../../../generated/common';
import {
  OperationState,
  OperationType,
  type Operation,
  type OperationTrade
} from '../../../generated/operations';
import { createOperationsReport, formatOperationsReport } from './reporter';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function trade(overrides: Partial<OperationTrade> = {}): OperationTrade {
  return {
    tradeId: 'trade-id',
    dateTime: new Date('2026-06-19T10:01:00.000Z'),
    quantity: 10,
    price: money(10, 500000000),
    ...overrides
  } as OperationTrade;
}

function operation(overrides: Partial<Operation> = {}): Operation {
  return {
    id: 'operation-id',
    parentOperationId: 'parent-operation-id',
    currency: 'rub',
    payment: money(100, 0),
    price: money(10, 500000000),
    state: OperationState.OPERATION_STATE_EXECUTED,
    quantity: 10,
    quantityRest: 2,
    figi: 'BBG00QPYJ5H0',
    instrumentType: 'share',
    date: new Date('2026-06-19T10:00:00.000Z'),
    type: 'Buy',
    operationType: OperationType.OPERATION_TYPE_BUY,
    trades: [trade()],
    assetUid: 'asset-uid',
    positionUid: 'position-uid',
    instrumentUid: 'instrument-uid',
    ...overrides
  } as Operation;
}

describe('operations reporter', () => {
  describe('createOperationsReport', () => {
    test('maps generated operation fields to stable report values', () => {
      const report = createOperationsReport([operation()]);

      assert.deepEqual(report[0], {
        id: 'operation-id',
        parentOperationId: 'parent-operation-id',
        date: '2026-06-19T10:00:00.000Z',
        type: 'Buy',
        operationType: 'OPERATION_TYPE_BUY',
        state: 'OPERATION_STATE_EXECUTED',
        currency: 'rub',
        payment: {
          currency: 'rub',
          amount: '100'
        },
        price: {
          currency: 'rub',
          amount: '10.5'
        },
        quantity: 10,
        quantityRest: 2,
        figi: 'BBG00QPYJ5H0',
        instrumentUid: 'instrument-uid',
        positionUid: 'position-uid',
        assetUid: 'asset-uid',
        instrumentType: 'share',
        tradesCount: 1
      });
    });

    test('maps missing optional values to nulls and empty strings', () => {
      const report = createOperationsReport([
        operation({
          payment: undefined,
          price: undefined,
          date: undefined
        })
      ]);

      assert.equal(report.at(0)?.payment, null);
      assert.equal(report.at(0)?.price, null);
      assert.equal(report.at(0)?.date, '');
    });
  });

  describe('formatOperationsReport', () => {
    test('formats report as table', () => {
      const output = formatOperationsReport(createOperationsReport([operation()]), 'table');

      assert.match(output, /^id\s+date\s+type\s+operationType\s+state/m);
      assert.match(
        output,
        /operation-id\s+2026-06-19T10:00:00.000Z\s+Buy\s+OPERATION_TYPE_BUY\s+OPERATION_STATE_EXECUTED/
      );
    });

    test('formats report as json', () => {
      const output = formatOperationsReport(createOperationsReport([operation()]), 'json');
      const parsed = JSON.parse(output);

      assert.equal(parsed[0].id, 'operation-id');
      assert.equal(parsed[0].operationType, 'OPERATION_TYPE_BUY');
      assert.equal(parsed[0].state, 'OPERATION_STATE_EXECUTED');
      assert.deepEqual(parsed[0].payment, {
        currency: 'rub',
        amount: '100'
      });
      assert.equal(parsed[0].tradesCount, 1);
    });
  });
});
