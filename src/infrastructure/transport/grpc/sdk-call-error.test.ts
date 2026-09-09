import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { ClientError, Status } from 'nice-grpc';
import {
  isSdkError,
  SdkError,
  SdkErrorCode
} from '../../../application/errors/sdk-error';
import { mapSdkCallError } from './sdk-call-error';

const path = '/test.Service/Method';
const maxReceiveMessageLength = 4 * 1024 * 1024;

describe('mapSdkCallError', () => {
  test('преобразует provider gRPC error в публичный контракт', () => {
    const providerError = new ClientError(
      path,
      Status.UNAUTHENTICATED,
      'invalid token'
    );
    const error = mapSdkCallError(
      providerError,
      path,
      undefined,
      true,
      maxReceiveMessageLength
    );

    assert.ok(isSdkError(error, SdkErrorCode.Unauthenticated));
    assert.equal(error.source, 'grpc');
    assert.equal(error.path, path);
    assert.equal(error.details, 'invalid token');
    assert.equal(error.cause, providerError);
  });

  test('отличает локальное превышение receive limit от provider quota', () => {
    const localError = new ClientError(
      path,
      Status.RESOURCE_EXHAUSTED,
      `Received message that decompresses to a size larger than ${maxReceiveMessageLength}`
    );
    const providerError = new ClientError(
      path,
      Status.RESOURCE_EXHAUSTED,
      'provider quota exhausted'
    );
    const mappedLocalError = mapSdkCallError(
      localError,
      path,
      undefined,
      true,
      maxReceiveMessageLength
    );
    const mappedProviderError = mapSdkCallError(
      providerError,
      path,
      undefined,
      true,
      maxReceiveMessageLength
    );

    assert.ok(isSdkError(mappedLocalError, SdkErrorCode.ResourceExhausted));
    assert.equal(mappedLocalError.source, 'sdk');
    assert.equal(mappedLocalError.cause, localError);
    assert.ok(isSdkError(mappedProviderError, SdkErrorCode.ResourceExhausted));
    assert.equal(mappedProviderError.source, 'grpc');
  });

  test('отличает TLS verification failure от сетевого UNAVAILABLE', () => {
    const tlsError = new ClientError(
      path,
      Status.UNAVAILABLE,
      'self-signed certificate in certificate chain'
    );
    const networkError = new ClientError(
      path,
      Status.UNAVAILABLE,
      'No connection established. Last error: connect ECONNREFUSED'
    );
    const mappedTlsError = mapSdkCallError(
      tlsError,
      path,
      undefined,
      true,
      maxReceiveMessageLength
    );
    const mappedNetworkError = mapSdkCallError(
      networkError,
      path,
      undefined,
      true,
      maxReceiveMessageLength
    );

    assert.ok(isSdkError(mappedTlsError, SdkErrorCode.Unavailable));
    assert.equal(mappedTlsError.source, 'tls');
    assert.ok(isSdkError(mappedNetworkError, SdkErrorCode.Unavailable));
    assert.equal(mappedNetworkError.source, 'grpc');
  });

  test('не классифицирует certificate-like сообщение как TLS без SSL', () => {
    const transportError = new ClientError(
      path,
      Status.UNAVAILABLE,
      'self-signed certificate in certificate chain'
    );
    const error = mapSdkCallError(
      transportError,
      path,
      undefined,
      false,
      maxReceiveMessageLength
    );

    assert.ok(isSdkError(error, SdkErrorCode.Unavailable));
    assert.equal(error.source, 'grpc');
  });

  test('преобразует отмену вызова и сохраняет её причину', () => {
    const controller = new AbortController();
    const cause = new Error('cancelled');

    cause.name = 'AbortError';
    controller.abort(cause);

    const error = mapSdkCallError(
      cause,
      path,
      controller.signal,
      true,
      maxReceiveMessageLength
    );

    assert.ok(isSdkError(error, SdkErrorCode.Cancelled));
    assert.equal(error.source, 'abort');
    assert.equal(error.cause, cause);
  });

  test('сохраняет готовые SDK errors и неизвестные исключения', () => {
    const sdkError = new SdkError(
      SdkErrorCode.InvalidArgument,
      'invalid',
      { source: 'sdk' }
    );
    const unknownError = new Error('unknown');

    assert.equal(
      mapSdkCallError(sdkError, path, undefined, true, maxReceiveMessageLength),
      sdkError
    );
    assert.equal(
      mapSdkCallError(unknownError, path, undefined, true, maxReceiveMessageLength),
      unknownError
    );
  });
});
