import assert from 'node:assert';
import { describe, test } from 'node:test';
import { InstrumentType, type MoneyValue, type Quotation } from '../../../generated/common';
import {
  OperationState,
  OperationType,
  type GetOperationsByCursorResponse,
  type OperationItem,
  type OperationItemTrade
} from '../../../generated/operations';
import { createOperationsByCursorReport, formatOperationsByCursorReport } from './reporter';

function money(units: number, nano: number, currency = 'rub'): MoneyValue {
  return {
    units,
    nano,
    currency
  };
}

function quotation(units: number, nano: number): Quotation {
  return {
    units,
    nano
  };
}

function trade(overrides: Partial<OperationItemTrade> = {}): OperationItemTrade {
  return {
    num: 'trade-num',
    date: new Date('2026-06-19T10:01:00.000Z'),
    quantity: 10,
    price: money(10, 500000000),
    yield: money(1, 0),
    yieldRelative: quotation(0, 100000000),
    ...overrides
  } as OperationItemTrade;
}

function operationItem(overrides: Partial<OperationItem> = {}): OperationItem {
  return {
    cursor: 'item-cursor',
    brokerAccountId: 'account-id',
    id: 'operation-id',
    parentOperationId: 'parent-operation-id',
    name: 'Buy',
    date: new Date('2026-06-19T10:00:00.000Z'),
    type: OperationType.OPERATION_TYPE_BUY,
    description: 'Buy shares',
    state: OperationState.OPERATION_STATE_EXECUTED,
    instrumentUid: 'instrument-uid',
    figi: 'BBG00QPYJ5H0',
    instrumentType: 'share',
    instrumentKind: InstrumentType.INSTRUMENT_TYPE_SHARE,
    positionUid: 'position-uid',
    payment: money(100, 0),
    price: money(10, 500000000),
    commission: money(1, 0),
    yield: money(2, 0),
    yieldRelative: quotation(1, 250000000),
    accruedInt: money(3, 0),
    quantity: 10,
    quantityRest: 1,
    quantityDone: 9,
    cancelDateTime: new Date('2026-06-19T11:00:00.000Z'),
    cancelReason: 'cancel reason',
    tradesInfo: {
      trades: [trade()]
    },
    assetUid: 'asset-uid',
    ...overrides
  } as OperationItem;
}

function response(
  overrides: Partial<GetOperationsByCursorResponse> = {}
): GetOperationsByCursorResponse {
  return {
    hasNext: true,
    nextCursor: 'next-cursor',
    items: [operationItem()],
    ...overrides
  } as GetOperationsByCursorResponse;
}

describe('operations-by-cursor reporter', () => {
  describe('createOperationsByCursorReport', () => {
    test('maps cursor response metadata and items to stable report values', () => {
      const report = createOperationsByCursorReport(response());

      assert.deepEqual(report.page, {
        hasNext: true,
        nextCursor: 'next-cursor',
        itemsCount: 1
      });
      assert.deepEqual(report.items[0], {
        cursor: 'item-cursor',
        brokerAccountId: 'account-id',
        id: 'operation-id',
        parentOperationId: 'parent-operation-id',
        name: 'Buy',
        date: '2026-06-19T10:00:00.000Z',
        type: 'OPERATION_TYPE_BUY',
        description: 'Buy shares',
        state: 'OPERATION_STATE_EXECUTED',
        figi: 'BBG00QPYJ5H0',
        instrumentUid: 'instrument-uid',
        instrumentType: 'share',
        instrumentKind: 'INSTRUMENT_TYPE_SHARE',
        positionUid: 'position-uid',
        payment: {
          currency: 'rub',
          amount: '100'
        },
        price: {
          currency: 'rub',
          amount: '10.5'
        },
        commission: {
          currency: 'rub',
          amount: '1'
        },
        yield: {
          currency: 'rub',
          amount: '2'
        },
        yieldRelative: '1.25',
        accruedInt: {
          currency: 'rub',
          amount: '3'
        },
        quantity: 10,
        quantityRest: 1,
        quantityDone: 9,
        cancelDateTime: '2026-06-19T11:00:00.000Z',
        cancelReason: 'cancel reason',
        assetUid: 'asset-uid',
        tradesCount: 1
      });
    });

    test('maps missing optional values to nulls, empty strings and zero trades', () => {
      const report = createOperationsByCursorReport(response({
        items: [
          operationItem({
            date: undefined,
            payment: undefined,
            price: undefined,
            commission: undefined,
            yield: undefined,
            yieldRelative: undefined,
            accruedInt: undefined,
            cancelDateTime: undefined,
            tradesInfo: undefined
          })
        ]
      }));

      assert.equal(report.items.at(0)?.date, '');
      assert.equal(report.items.at(0)?.payment, null);
      assert.equal(report.items.at(0)?.price, null);
      assert.equal(report.items.at(0)?.commission, null);
      assert.equal(report.items.at(0)?.yield, null);
      assert.equal(report.items.at(0)?.yieldRelative, '');
      assert.equal(report.items.at(0)?.accruedInt, null);
      assert.equal(report.items.at(0)?.cancelDateTime, '');
      assert.equal(report.items.at(0)?.tradesCount, 0);
    });
  });

  describe('formatOperationsByCursorReport', () => {
    test('formats report as table with page metadata', () => {
      const output = formatOperationsByCursorReport(
        createOperationsByCursorReport(response()),
        'table'
      );

      assert.match(output, /hasNext: true/);
      assert.match(output, /nextCursor: next-cursor/);
      assert.match(output, /itemsCount: 1/);
      assert.match(output, /^cursor\s+id\s+date\s+name\s+type\s+state/m);
      assert.match(output, /item-cursor\s+operation-id\s+2026-06-19T10:00:00.000Z\s+Buy/);
    });

    test('formats report as json', () => {
      const output = formatOperationsByCursorReport(
        createOperationsByCursorReport(response()),
        'json'
      );
      const parsed = JSON.parse(output);

      assert.equal(parsed.page.hasNext, true);
      assert.equal(parsed.page.nextCursor, 'next-cursor');
      assert.equal(parsed.page.itemsCount, 1);
      assert.equal(parsed.items[0].id, 'operation-id');
      assert.equal(parsed.items[0].tradesCount, 1);
    });
  });
});
