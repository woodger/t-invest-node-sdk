/**
 * Модуль задает transport-neutral публичный контракт ошибок SDK.
 *
 * Здесь допустимы:
 * - стабильные machine-readable коды;
 * - источник ошибки и безопасные диагностические поля;
 * - cross-copy runtime narrowing.
 *
 * Здесь не должно быть imports из transport libraries или retry policy.
 */

export enum SdkErrorCode {
  Cancelled = 'CANCELLED',
  Unknown = 'UNKNOWN',
  InvalidArgument = 'INVALID_ARGUMENT',
  DeadlineExceeded = 'DEADLINE_EXCEEDED',
  NotFound = 'NOT_FOUND',
  AlreadyExists = 'ALREADY_EXISTS',
  PermissionDenied = 'PERMISSION_DENIED',
  ResourceExhausted = 'RESOURCE_EXHAUSTED',
  FailedPrecondition = 'FAILED_PRECONDITION',
  Aborted = 'ABORTED',
  OutOfRange = 'OUT_OF_RANGE',
  Unimplemented = 'UNIMPLEMENTED',
  Internal = 'INTERNAL',
  Unavailable = 'UNAVAILABLE',
  DataLoss = 'DATA_LOSS',
  Unauthenticated = 'UNAUTHENTICATED',
  SdkClosed = 'SDK_CLOSED',
  UnknownUnaryLimit = 'UNKNOWN_UNARY_LIMIT'
}

export type SdkErrorSource =
  | 'grpc'
  | 'abort'
  | 'lifecycle'
  | 'sdk';

export interface SdkErrorOptions {
  source: SdkErrorSource;
  path?: string;
  details?: string;
  cause?: unknown;
}

const sdkErrorBrand = Symbol.for('tinkoff-invest-node-sdk/SdkError');
const sdkErrorCodes: ReadonlySet<string> = new Set(Object.values(SdkErrorCode));
const sdkErrorSources: ReadonlySet<string> = new Set<SdkErrorSource>([
  'grpc',
  'abort',
  'lifecycle',
  'sdk'
]);

export class SdkError<Code extends SdkErrorCode = SdkErrorCode> extends Error {
  readonly code: Code;
  readonly source: SdkErrorSource;
  readonly path: string | undefined;
  readonly details: string | undefined;

  constructor(
    code: Code,
    message: string,
    options: SdkErrorOptions
  ) {
    super(message, { cause: options.cause });

    this.name = 'SdkError';
    this.code = code;
    this.source = options.source;
    this.path = options.path;
    this.details = options.details;

    Object.defineProperty(this, sdkErrorBrand, {
      value: true
    });
  }

  static override [Symbol.hasInstance](value: unknown): boolean {
    return hasSdkErrorContract(value);
  }
}

export function isSdkError(error: unknown): error is SdkError;
export function isSdkError<Code extends SdkErrorCode>(
  error: unknown,
  code: Code
): error is SdkError<Code>;
export function isSdkError(
  error: unknown,
  code?: SdkErrorCode
): error is SdkError {
  return hasSdkErrorContract(error)
    && (code === undefined || error.code === code);
}

function hasSdkErrorContract(value: unknown): value is SdkError {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<PropertyKey, unknown>;

  return candidate[sdkErrorBrand] === true
    && candidate['name'] === 'SdkError'
    && typeof candidate['message'] === 'string'
    && typeof candidate['code'] === 'string'
    && sdkErrorCodes.has(candidate['code'])
    && typeof candidate['source'] === 'string'
    && sdkErrorSources.has(candidate['source'])
    && (candidate['path'] === undefined || typeof candidate['path'] === 'string')
    && (candidate['details'] === undefined || typeof candidate['details'] === 'string');
}
