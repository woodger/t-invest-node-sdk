/**
 * Модуль gRPC middleware adapter связывает transport calls с application throttling.
 *
 * Здесь допустимы:
 * - разрешение gRPC path в transport-neutral throttle rule;
 * - применение unary throttling scheduler;
 * - пропуск response stream calls без unary задержки;
 * - проверка SDK lifecycle и mapping известных call failures в `SdkError`;
 * - делегирование actual call execution в nice-grpc middleware chain;
 *
 * Здесь не должно быть retry policy или stream lifecycle management.
 */

import type {
  CallOptions,
  ClientMiddlewareCall
} from 'nice-grpc';
import {
  ClientError,
  Status
} from 'nice-grpc';
import {
  isSdkError,
  SdkError,
  SdkErrorCode
} from '../../../application/errors/sdk-error';
import type { SdkErrorSource } from '../../../application/errors/sdk-error';
import type { Throttle } from '../../../application/services/unary-throttle.service';
import type { UnaryLimitResolver } from './unary-limit-resolver';

export interface SdkCallRuntime {
  readonly useSsl: boolean;
  readonly maxReceiveMessageLength: number;
  readonly signal: AbortSignal;
  assertOpen(): void;
}

export function createSdkMiddleware(
  trackLimits: boolean,
  unaryLimitResolver: UnaryLimitResolver,
  throttle: Throttle,
  runtime?: SdkCallRuntime
) {
  return async function*<Request, Response>(
    call: ClientMiddlewareCall<Request, Response, CallOptions>,
    options: CallOptions
  ) {
    const callbackBoundary = createCallCallbackBoundary(options);

    try {
      runtime?.assertOpen();

      if (!call.responseStream) {
        if (trackLimits) {
          const rule = unaryLimitResolver.resolve(call.method.path);

          if (rule === undefined) {
            throw new SdkError(
              SdkErrorCode.UnknownUnaryLimit,
              `Unhandled unary limits for ${call.method.path}`,
              {
                source: 'sdk',
                path: call.method.path
              }
            );
          }

          await throttle.reduce(
            rule,
            resolveThrottleSignal(options.signal, runtime?.signal)
          );
        }

        runtime?.assertOpen();
        throwIfAborted(options.signal);

        const response = yield* call.next(
          call.request,
          callbackBoundary?.options ?? options
        );

        throwCallCallbackFailure(callbackBoundary);

        return response;
      }

      throwIfAborted(options.signal);

      for await (const response of call.next(
        call.request,
        callbackBoundary?.options ?? options
      )) {
        throwCallCallbackFailure(callbackBoundary);
        yield response;
      }

      throwCallCallbackFailure(callbackBoundary);

      return undefined;
    }
    catch (error) {
      if (callbackBoundary?.failure !== undefined) {
        throw callbackBoundary.failure.reason;
      }

      throw mapSdkCallError(
        error,
        call.method.path,
        options.signal,
        runtime?.useSsl === true,
        runtime?.maxReceiveMessageLength
      );
    }
    finally {
      throwCallCallbackFailure(callbackBoundary);
    }
  };
}

const grpcErrorCodes: Partial<Record<Status, SdkErrorCode>> = {
  [Status.CANCELLED]: SdkErrorCode.Cancelled,
  [Status.UNKNOWN]: SdkErrorCode.Unknown,
  [Status.INVALID_ARGUMENT]: SdkErrorCode.InvalidArgument,
  [Status.DEADLINE_EXCEEDED]: SdkErrorCode.DeadlineExceeded,
  [Status.NOT_FOUND]: SdkErrorCode.NotFound,
  [Status.ALREADY_EXISTS]: SdkErrorCode.AlreadyExists,
  [Status.PERMISSION_DENIED]: SdkErrorCode.PermissionDenied,
  [Status.RESOURCE_EXHAUSTED]: SdkErrorCode.ResourceExhausted,
  [Status.FAILED_PRECONDITION]: SdkErrorCode.FailedPrecondition,
  [Status.ABORTED]: SdkErrorCode.Aborted,
  [Status.OUT_OF_RANGE]: SdkErrorCode.OutOfRange,
  [Status.UNIMPLEMENTED]: SdkErrorCode.Unimplemented,
  [Status.INTERNAL]: SdkErrorCode.Internal,
  [Status.UNAVAILABLE]: SdkErrorCode.Unavailable,
  [Status.DATA_LOSS]: SdkErrorCode.DataLoss,
  [Status.UNAUTHENTICATED]: SdkErrorCode.Unauthenticated
};

const tlsCertificateErrorCodes = [
  'CERT_CHAIN_TOO_LONG',
  'CERT_HAS_EXPIRED',
  'CERT_NOT_YET_VALID',
  'CERT_REJECTED',
  'CERT_REVOKED',
  'CERT_SIGNATURE_FAILURE',
  'CERT_UNTRUSTED',
  'CRL_HAS_EXPIRED',
  'CRL_NOT_YET_VALID',
  'CRL_SIGNATURE_FAILURE',
  'DEPTH_ZERO_SELF_SIGNED_CERT',
  'ERR_TLS_CERT_ALTNAME_FORMAT',
  'ERR_TLS_CERT_ALTNAME_INVALID',
  'HOSTNAME_MISMATCH',
  'INVALID_CA',
  'INVALID_PURPOSE',
  'PATH_LENGTH_EXCEEDED',
  'SELF_SIGNED_CERT_IN_CHAIN',
  'UNABLE_TO_GET_CRL',
  'UNABLE_TO_GET_ISSUER_CERT',
  'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
  'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
];

const tlsCertificateErrorMessages = [
  'certificate has expired',
  'certificate is not yet valid',
  'certificate is not trusted',
  'certificate rejected',
  'certificate revoked',
  'certificate verification failed',
  'certificate verify failed',
  'hostname does not match certificate',
  'hostname/ip does not match certificate',
  'self signed certificate',
  'self-signed certificate',
  'unable to get issuer certificate',
  'unable to get local issuer certificate',
  'unable to verify the first certificate',
  'unable to verify leaf signature'
];

const standaloneTlsCertificateErrorMessages: ReadonlySet<string> = new Set([
  ...tlsCertificateErrorMessages,
  'self signed certificate in certificate chain',
  'self-signed certificate in certificate chain'
]);

const grpcConnectionErrorMarker = 'no connection established. last error:';

function resolveThrottleSignal(
  callSignal: AbortSignal | undefined,
  lifecycleSignal: AbortSignal | undefined
): AbortSignal | undefined {
  if (callSignal !== undefined && lifecycleSignal !== undefined) {
    return AbortSignal.any([callSignal, lifecycleSignal]);
  }

  return callSignal ?? lifecycleSignal;
}

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (signal?.aborted) {
    throw signal.reason ?? createAbortError();
  }
}

function mapSdkCallError(
  error: unknown,
  path: string,
  signal: AbortSignal | undefined,
  useSsl: boolean,
  maxReceiveMessageLength: number | undefined
): unknown {
  if (isCallCancellation(error, signal)) {
    return new SdkError(
      SdkErrorCode.Cancelled,
      errorMessage(error, `SDK call ${path} was cancelled`),
      {
        source: 'abort',
        path,
        cause: error
      }
    );
  }

  if (isSdkError(error)) {
    return error;
  }

  if (error instanceof ClientError) {
    return new SdkError(
      grpcErrorCodes[error.code] ?? SdkErrorCode.Unknown,
      error.message,
      {
        source: resolveClientErrorSource(
          error,
          useSsl,
          maxReceiveMessageLength
        ),
        path: error.path,
        details: error.details,
        cause: error
      }
    );
  }

  return error;
}

function resolveClientErrorSource(
  error: ClientError,
  useSsl: boolean,
  maxReceiveMessageLength: number | undefined
): SdkErrorSource {
  if (isTlsCertificateError(error, useSsl)) {
    return 'tls';
  }

  if (isLocalReceiveMessageLimitError(error, maxReceiveMessageLength)) {
    return 'sdk';
  }

  if (isLocalRequestSerializationError(error)) {
    return 'sdk';
  }

  if (isLocalResponseParsingError(error)) {
    return 'sdk';
  }

  return 'grpc';
}

const requestSerializationFailurePrefix =
  'Request message serialization failure:';

function isLocalRequestSerializationError(error: ClientError): boolean {
  return error.code === Status.INTERNAL
    && error.details.startsWith(requestSerializationFailurePrefix);
}

const responseParsingFailurePrefix =
  'Response message parsing error:';

function isLocalResponseParsingError(error: ClientError): boolean {
  return error.code === Status.INTERNAL
    && error.details.startsWith(responseParsingFailurePrefix);
}

const receivedMessageLargerThanMaxPattern =
  /^Received message larger than max \((\d+) vs (\d+)\)$/;

function isLocalReceiveMessageLimitError(
  error: ClientError,
  maxReceiveMessageLength: number | undefined
): boolean {
  if (
    maxReceiveMessageLength === undefined
    || error.code !== Status.RESOURCE_EXHAUSTED
  ) {
    return false;
  }

  const rawMessageMatch = receivedMessageLargerThanMaxPattern.exec(
    error.details
  );

  if (rawMessageMatch !== null) {
    const receivedMessageLength = rawMessageMatch[1];
    const configuredMessageLength = rawMessageMatch[2];

    return receivedMessageLength !== undefined
      && configuredMessageLength === String(maxReceiveMessageLength)
      && Number(receivedMessageLength) > maxReceiveMessageLength;
  }

  return error.details ===
    `Received message that decompresses to a size larger than ${maxReceiveMessageLength}`;
}

function isTlsCertificateError(
  error: ClientError,
  useSsl: boolean
): boolean {
  if (!useSsl || error.code !== Status.UNAVAILABLE) {
    return false;
  }

  const normalizedDetails = error.details.toLowerCase();

  if (tlsCertificateErrorCodes.some((code) => error.details.includes(code))) {
    return true;
  }

  const hasCertificateErrorMessage = tlsCertificateErrorMessages.some(
    (message) => normalizedDetails.includes(message)
  );

  return hasCertificateErrorMessage
    && (
      normalizedDetails.includes(grpcConnectionErrorMarker)
      || standaloneTlsCertificateErrorMessages.has(normalizedDetails.trim())
    );
}

function isCallCancellation(
  error: unknown,
  signal: AbortSignal | undefined
): boolean {
  return signal?.aborted === true
    && (error === signal.reason || errorName(error) === 'AbortError');
}

interface CallCallbackFailure {
  readonly reason: unknown;
}

interface CallCallbackBoundary {
  readonly options: CallOptions;
  readonly failure: CallCallbackFailure | undefined;
}

function createCallCallbackBoundary(
  options: CallOptions
): CallCallbackBoundary | undefined {
  if (options.onHeader === undefined && options.onTrailer === undefined) {
    return undefined;
  }

  // nice-grpc вызывает эти callbacks из EventEmitter handlers. Исключение
  // нужно вернуть владельцу RPC, иначе оно обходит Promise/AsyncIterable.
  const controller = new AbortController();
  let failure: CallCallbackFailure | undefined;
  const captureFailure = (reason: unknown) => {
    if (failure === undefined) {
      failure = { reason };
      controller.abort(reason);
    }
  };
  const protectedOptions: CallOptions = {
    ...options,
    signal: options.signal === undefined
      ? controller.signal
      : AbortSignal.any([options.signal, controller.signal])
  };

  if (options.onHeader !== undefined) {
    protectedOptions.onHeader = protectCallCallback(
      options.onHeader,
      captureFailure
    );
  }

  if (options.onTrailer !== undefined) {
    protectedOptions.onTrailer = protectCallCallback(
      options.onTrailer,
      captureFailure
    );
  }

  return {
    options: protectedOptions,
    get failure() {
      return failure;
    }
  };
}

function protectCallCallback(
  callback: NonNullable<CallOptions['onHeader']>,
  captureFailure: (reason: unknown) => void
): NonNullable<CallOptions['onHeader']> {
  return (metadata) => {
    try {
      callback(metadata);
    }
    catch (error) {
      captureFailure(error);
    }
  };
}

function throwCallCallbackFailure(
  boundary: CallCallbackBoundary | undefined
): void {
  if (boundary?.failure !== undefined) {
    throw boundary.failure.reason;
  }
}

function errorName(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const name = (error as Record<PropertyKey, unknown>)['name'];

  return typeof name === 'string' ? name : undefined;
}

function errorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  const message = (error as Record<PropertyKey, unknown>)['message'];

  return typeof message === 'string' ? message : fallback;
}

function createAbortError(): Error {
  const error = new Error('The operation was aborted');

  error.name = 'AbortError';

  return error;
}
