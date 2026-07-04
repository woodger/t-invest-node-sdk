import assert from 'node:assert';
import { describe, test } from 'node:test';
import { command as commandFacade } from '../command';
import type { TinkoffInvestOptions } from '../../../application/dto/tinkoff-invest-options';
import type {
  GetDividendsForeignIssuerRequest,
  GetDividendsForeignIssuerResponse
} from '../../../generated/operations';
import type { CommandRawOptions } from '../../command-options';
import {
  createDividendsForeignIssuerCommand,
  parseDividendsForeignIssuerFormat,
  createDividendsForeignIssuerRequest
} from './cli';

function rawOptions(args: CommandRawOptions = {}): CommandRawOptions {
  return args;
}

function response(
  overrides: Partial<GetDividendsForeignIssuerResponse> = {}
): GetDividendsForeignIssuerResponse {
  return {
    generateDivForeignIssuerReportResponse: undefined,
    divForeignIssuerReport: undefined,
    ...overrides
  };
}

describe('dividends-foreign-issuer command', () => {
  describe('createDividendsForeignIssuerRequest', () => {
    test('returns generated generateDivForeignIssuerReport request', () => {
      const request = createDividendsForeignIssuerRequest({
        'account-id': '2000000000',
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-12-31T00:00:00.000Z'
      });

      assert.deepEqual(request, {
        generateDivForeignIssuerReport: {
          accountId: '2000000000',
          from: new Date('2026-01-01T00:00:00.000Z'),
          to: new Date('2026-12-31T00:00:00.000Z')
        },
        getDivForeignIssuerReport: undefined
      });
    });

    test('returns generated getDivForeignIssuerReport request', () => {
      const request = createDividendsForeignIssuerRequest({
        'task-id': 'task-id',
        page: '2'
      });

      assert.deepEqual(request, {
        generateDivForeignIssuerReport: undefined,
        getDivForeignIssuerReport: {
          taskId: 'task-id',
          page: 2
        }
      });
    });

    test('uses page zero by default in get mode', () => {
      const request = createDividendsForeignIssuerRequest({
        'task-id': 'task-id'
      });

      assert.deepEqual(request.getDivForeignIssuerReport, {
        taskId: 'task-id',
        page: 0
      });
    });

    test('rejects mixed generate and get modes', () => {
      assert.throws(
        () => createDividendsForeignIssuerRequest({
          'account-id': '2000000000',
          from: '2026-01-01T00:00:00.000Z',
          to: '2026-12-31T00:00:00.000Z',
          'task-id': 'task-id'
        }),
        /Expected either '--task-id' or '--account-id' with '--from' and '--to'/
      );
    });

    test('rejects page without task id', () => {
      assert.throws(
        () => createDividendsForeignIssuerRequest({ page: '1' }),
        /Expected '--page' only with '--task-id'/
      );
    });

    test('rejects invalid page', () => {
      assert.throws(
        () => createDividendsForeignIssuerRequest({
          'task-id': 'task-id',
          page: '-1'
        }),
        /Expected '--page' as integer greater than or equal to 0/
      );
    });

    test('rejects inverted date range', () => {
      assert.throws(
        () => createDividendsForeignIssuerRequest({
          'account-id': '2000000000',
          from: '2026-12-31T00:00:00.000Z',
          to: '2026-01-01T00:00:00.000Z'
        }),
        /Expected '--from' to be earlier than or equal to '--to'/
      );
    });
  });

  describe('parseDividendsForeignIssuerFormat', () => {
    test('returns table by default', () => {
      assert.equal(parseDividendsForeignIssuerFormat(rawOptions()), 'table');
    });

    test('rejects unknown formats', () => {
      assert.throws(
        () => parseDividendsForeignIssuerFormat(rawOptions({ format: 'xml' })),
        /Expected '--format' as one of: json, table/
      );
    });
  });

  describe('createDividendsForeignIssuerCommand', () => {
    test('calls getDividendsForeignIssuer and closes sdk', async () => {
      let receivedOptions: TinkoffInvestOptions | undefined;
      let receivedRequest: GetDividendsForeignIssuerRequest | undefined;
      let closeCalls = 0;
      const command = createDividendsForeignIssuerCommand((options) => {
        receivedOptions = options;

        return {
          operations: {
            async getDividendsForeignIssuer(request) {
              receivedRequest = request;

              return response({
                generateDivForeignIssuerReportResponse: {
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
          'get-dividends-foreign-issuer',
          '--token=token',
          '--endpoint=localhost:50051',
          '--account-id=2000000000',
          '--from=2026-01-01T00:00:00.000Z',
          '--to=2026-12-31T00:00:00.000Z',
          '--format=json'
        ],
        undefined
      );

      assert.deepEqual(receivedOptions, {
        token: 'token',
        endpoint: 'localhost:50051'
      });
      assert.deepEqual(receivedRequest, {
        generateDivForeignIssuerReport: {
          accountId: '2000000000',
          from: new Date('2026-01-01T00:00:00.000Z'),
          to: new Date('2026-12-31T00:00:00.000Z')
        },
        getDivForeignIssuerReport: undefined
      });
      assert.equal(closeCalls, 1);
      assert.equal(JSON.parse(output).taskId, 'task-id');
    });

    test('closes sdk when getDividendsForeignIssuer rejects', async () => {
      let closeCalls = 0;
      const command = createDividendsForeignIssuerCommand(() => ({
        operations: {
          async getDividendsForeignIssuer() {
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
            'get-dividends-foreign-issuer',
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
