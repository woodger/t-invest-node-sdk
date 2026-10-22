/**
 * Модуль задаёт публичные параметры создания экземпляра SDK.
 *
 * Здесь допустимы:
 * - параметры подключения, TLS и метаданных;
 * - ограничитель и переопределения квот для экземпляра SDK.
 *
 * Здесь не должно быть чтения переменных окружения или создания транспорта.
 */

import type {
  TInvestUnaryLimiter,
  TInvestUnaryLimits
} from '../services/unary-limiter';

/** Переопределение доверенных корневых сертификатов TLS для канала SDK. */
export interface TInvestTlsOptions {
  /**
   * PEM-содержимое root CA bundle для channel этого SDK instance.
   * При включённом TLS полностью заменяет bundled T-Invest certificate.
   */
  rootCertificates?: Buffer;
}

/** Параметры подключения и необязательные настройки создаваемого экземпляра SDK. */
export interface TInvestOptions {
  /** OAuth token в допустимой для строковых gRPC metadata ASCII-форме. */
  token: string;
  endpoint: string;
  /** Необязательное ASCII-значение gRPC metadata `x-app-name`. */
  appName?: string;
  useSsl?: boolean;
  tls?: TInvestTlsOptions;
  /** Необязательный ограничитель перед unary-вызовами, передаваемый приложением. */
  unaryLimiter?: TInvestUnaryLimiter;
  /** Конечные положительные переопределения unary-квот для экземпляра SDK. */
  unaryLimits?: TInvestUnaryLimits;
}
