import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  BrokerReportRequest,
  BrokerReportResponse
} from '../../../generated/operations';
import type { CommandRawOptions } from '../../args/command-options';
import {
  createBrokerReportCommand,
  parseBrokerReportFormat,
  createBrokerReportRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(overrides: Partial<BrokerReportResponse> = {}): BrokerReportResponse {
  return {
    generateBrokerReportResponse: undefined,
    getBrokerReportResponse: undefined,
    ...overrides
  };
}

describe('broker-report command', () => {
  describe('createBrokerReportRequest', () => {
    test('returns generated generateBrokerReport request', () => {
      const request = createBrokerReportRequest({
        'account-id': '2000000000',
        from: '2026-06-01T00:00:00.000Z',
        to: '2026-06-19T00:00:00.000Z'
      });

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
      const request = createBrokerReportRequest({
        'task-id': 'task-id',
        page: '2'
      });

      assert.deepEqual(request, {
        generateBrokerReportRequest: undefined,
        getBrokerReportRequest: {
          taskId: 'task-id',
          page: 2
        }
      });
    });

    test('uses page zero by default in get mode', () => {
      const request = createBrokerReportRequest({
        'task-id': 'task-id'
      });

      assert.deepEqual(request.getBrokerReportRequest, {
        taskId: 'task-id',
        page: 0
      });
    });

    test('rejects mixed generate and get modes', () => {
      assert.throws(
        () => createBrokerReportRequest({
          'account-id': '2000000000',
          from: '2026-06-01T00:00:00.000Z',
          to: '2026-06-19T00:00:00.000Z',
          'task-id': 'task-id'
        }),
        /Expected either '--task-id' or '--account-id' with '--from' and '--to'/
      );
    });

    test('rejects page without task id', () => {
      assert.throws(
        () => createBrokerReportRequest({ page: '1' }),
        /Expected '--page' only with '--task-id'/
      );
    });

    test('rejects invalid page', () => {
      assert.throws(
        () => createBrokerReportRequest({
          'task-id': 'task-id',
          page: '-1'
        }),
        /Expected '--page' as integer greater than or equal to 0/
      );
    });

    test('rejects inverted date range', () => {
      assert.throws(
        () => createBrokerReportRequest({
          'account-id': '2000000000',
          from: '2026-06-19T00:00:00.000Z',
          to: '2026-06-01T00:00:00.000Z'
        }),
        /Expected '--from' to be earlier than or equal to '--to'/
      );
    });
  });

  describe('parseBrokerReportFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseBrokerReportFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseBrokerReportFormat(rawOptions({ format: 'xml' })),
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

      const output = await commandFacade.run(
        command,
        [
          'operations',
          'get-broker-report',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=2000000000',
          '--from=2026-06-01T00:00:00.000Z',
          '--to=2026-06-19T00:00:00.000Z',
          '--format=json'
        ],
        undefined
      );

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
        () => commandFacade.run(
          command,
          [
            'operations',
            'get-broker-report',
            '--token=token',
            '--endpoint=localhost:50051',
            '--task-id=task-id'
          ],
          undefined
        ),
        /api failed/
      );

      assert.equal(closeCalls, 1);
    });
  });
});
