import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  isSdkError,
  SdkError,
  SdkErrorCode
} from './sdk-error';

describe('SdkError', () => {
  test('exposes stable runtime diagnostics', () => {
    const cause = new Error('provider failure');
    const error = new SdkError(
      SdkErrorCode.ResourceExhausted,
      'request failed',
      {
        source: 'grpc',
        path: '/test.Service/Method',
        details: 'quota exceeded',
        cause
      }
    );

    assert.equal(error.name, 'SdkError');
    assert.equal(error.code, SdkErrorCode.ResourceExhausted);
    assert.equal(error.source, 'grpc');
    assert.equal(error.path, '/test.Service/Method');
    assert.equal(error.details, 'quota exceeded');
    assert.equal(error.cause, cause);
    assert.equal(error instanceof Error, true);
    assert.equal(error instanceof SdkError, true);
  });

  test('narrows an error by code', () => {
    const error: unknown = new SdkError(
      SdkErrorCode.Unauthenticated,
      'authentication failed',
      {
        source: 'grpc'
      }
    );

    assert.equal(isSdkError(error), true);
    assert.equal(isSdkError(error, SdkErrorCode.ResourceExhausted), false);

    if (!isSdkError(error, SdkErrorCode.Unauthenticated)) {
      assert.fail('Expected an unauthenticated SDK error');
    }

    const code: SdkErrorCode.Unauthenticated = error.code;

    assert.equal(code, SdkErrorCode.Unauthenticated);
  });

  test('recognizes a branded error from another package copy', () => {
    const foreignError = {
      [Symbol.for('t-invest-node-sdk/SdkError')]: true,
      name: 'SdkError',
      message: 'service unavailable',
      code: SdkErrorCode.Unavailable,
      source: 'grpc',
      path: '/test.Service/Method',
      details: 'unavailable'
    };

    assert.equal(isSdkError(foreignError), true);
    assert.equal(foreignError instanceof SdkError, true);
  });

  test('does not recognize the former package brand', () => {
    const formerPackageError = {
      [Symbol.for('tinkoff-invest-node-sdk/SdkError')]: true,
      name: 'SdkError',
      message: 'service unavailable',
      code: SdkErrorCode.Unavailable,
      source: 'grpc'
    };

    assert.equal(isSdkError(formerPackageError), false);
    assert.equal(formerPackageError instanceof SdkError, false);
  });

  test('rejects malformed branded errors', () => {
    const malformedError = {
      [Symbol.for('t-invest-node-sdk/SdkError')]: true,
      name: 'SdkError',
      message: 'invalid',
      code: 'NOT_AN_SDK_CODE',
      source: 'grpc'
    };

    assert.equal(isSdkError(malformedError), false);
    assert.equal(malformedError instanceof SdkError, false);
  });
});
