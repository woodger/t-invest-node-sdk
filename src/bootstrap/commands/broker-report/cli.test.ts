import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  BrokerReportRequest,
  BrokerReportResponse
} from '../../../generated/operations';
import type { CliArgs } from '../../cli-contract';
import {
  createBrokerReportCommand,
  parseBrokerReportFormat,
  parseBrokerReportRequest
} from './cli';

function argv(args: Partial<CliArgs> = {}): CliArgs {
  return {
    _: ['operations get-broker-report'],
    ...args
  };
}

function response(overrides: Partial<BrokerReportResponse> = {}): BrokerReportResponse {
  return {
    generateBrokerReportResponse: undefined,
    getBrokerReportResponse: undefined,
    ...overrides
  };
}

describe('broker-report command', () => {
  describe('parseBrokerReportRequest', () => {
    test('returns generated generateBrokerReport request', () => {
      const request = parseBrokerReportRequest(argv({
        'account-id': '2000000000',
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-19T00:00:00.000Z'
      }));

      assert.deepEqual(request, {
        generateBrokerReportRequest: {
          accountId: '2000000000',
          from: new Date('2026-06-01T00:00:00.000Z'),
          to: new Date('2026-06-19T00:00:00.000Z')
        },
        getBrokerReportRequest: undefined
      });
    });

    test('returns generated getBrokerReport request', () => {
      const request = parseBrokerReportRequest(argv({
        'task-id': 'task-id',
        page: '2'
      }));

      assert.deepEqual(request, {
        generateBrokerReportRequest: undefined,
        getBrokerReportRequest: {
          taskId: 'task-id',
          page: 2
        }
      });
    });

    test('uses page zero by default in get mode', () => {
      const request = parseBrokerReportRequest(argv({
        'task-id': 'task-id'
      }));

      assert.deepEqual(request.getBrokerReportRequest, {
        taskId: 'task-id',
        page: 0
      });
    });

    test('rejects mixed generate and get modes', () => {
      assert.throws(
        () => parseBrokerReportRequest(argv({
          'account-id': '2000000000',
          from: '2026-06-01T00:00:00.000Z',
          to: '2026-06-19T00:00:00.000Z',
          'task-id': 'task-id'
        })),
        /Expected either '--task-id' or '--account-id' with '--from' and '--to'/
      );
    });

    test('rejects page without task id', () => {
      assert.throws(
        () => parseBrokerReportRequest(argv({ page: '1' })),
        /Expected '--page' only with '--task-id'/
      );
    });

    test('rejects invalid page', () => {
      assert.throws(
        () => parseBrokerReportRequest(argv({
          'task-id': 'task-id',
          page: '-1'
        })),
        /Expected '--page' as integer greater than or equal to 0/
      );
    });

    test('rejects inverted date range', () => {
      assert.throws(
        () => parseBrokerReportRequest(argv({
          'account-id': '2000000000',
          from: '2026-06-19T00:00:00.000Z',
          to: '2026-06-01T00:00:00.000Z'
        })),
        /Expected '--from' to be earlier than or equal to '--to'/
      );
    });
  });

  describe('parseBrokerReportFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseBrokerReportFormat(argv()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseBrokerReportFormat(argv({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createBrokerReportCommand', () => {
    test('calls getBrokerReport and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: BrokerReportRequest | undefined;
      let closeCalls = 0;
      const command = createBrokerReportCommand((options) => {
        receivedOptions = options;

        return {
          operations: {
            async getBrokerReport(request) {
              receivedRequest = request;

              return response({
                generateBrokerReportResponse: {
                  taskId: 'task-id'
                }
              });
            }
          },
          close() {
            closeCalls += 1;
          }
        };
      });

      const output = await command(argv({
        token: 'token',
        endpoint: 'localhost:50051',
        'account-id': '2000000000',
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-19T00:00:00.000Z',
        format: 'json'
      }));

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        generateBrokerReportRequest: {
          accountId: '2000000000',
          from: new Date('2026-06-01T00:00:00.000Z'),
          to: new Date('2026-06-19T00:00:00.000Z')
        },
        getBrokerReportRequest: undefined
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).taskId, 'task-id');
    });

    test('closes sdk when getBrokerReport rejects', async () => {
      let closeCalls = 0;
      const command = createBrokerReportCommand(() => ({
        operations: {
          async getBrokerReport() {
            throw new Error('api failed');
          }
        },
        close() {
          closeCalls += 1;
        }
      }));

      await assert.rejects(
        () => command(argv({
          token: 'token',
          endpoint: 'localhost:50051',
          'task-id': 'task-id'
        })),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
