import assert from 'node:assert';
import { describe, test } from 'node:test';
import type { TInvestOptions } from '../../application/dto/t-invest-options';
import { runSdkCommand } from './sdk-command-lifecycle';

describe('runSdkCommand', () => {
  test('создаёт SDK из CLI options и закрывает его после успешного вызова', async () => {
    let receivedOptions: TInvestOptions | undefined;
    let closeCalls = 0;

    const result = await runSdkCommand(
      {
        token: 'token',
        endpoint: 'localhost:50051',
        'app-name': 'application',
        insecure: true
      },
      (options) => {
        receivedOptions = options;

        return {
          close() {
            closeCalls += 1;
          }
        };
      },
      async () => 'result'
    );

    assert.equal(result, 'result');
    assert.deepEqual(receivedOptions, {
      token: 'token',
      endpoint: 'localhost:50051',
      appName: 'application',
      useSsl: false
    });
    assert.equal(closeCalls, 1);
  });

  test('закрывает SDK после ошибки handler-а и сохраняет исходную ошибку', async () => {
    const expectedError = new Error('failure');
    let closeCalls = 0;

    await assert.rejects(
      runSdkCommand(
        {
          token: 'token',
          endpoint: 'localhost:50051'
        },
        () => ({
          close() {
            closeCalls += 1;
          }
        }),
        async () => {
          throw expectedError;
        }
      ),
      (error: unknown) => error === expectedError
    );
    assert.equal(closeCalls, 1);
  });
});
