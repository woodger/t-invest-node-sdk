/**
 * Модуль application DTO задает options публичного SDK.
 *
 * Здесь допустимы:
 * - форма настроек, передаваемых в bootstrap SDK facade;
 * - optional runtime flags без привязки к CLI parser-у;
 *
 * Здесь не должно быть environment fallback logic или transport creation.
 */

export interface TInvestTlsOptions {
  /**
   * PEM-содержимое root CA bundle для channel этого SDK instance.
   * При включённом TLS полностью заменяет bundled T-Invest certificate.
   */
  rootCertificates?: Buffer;
}

export interface TInvestOptions {
  /** OAuth token в допустимой для строковых gRPC metadata ASCII-форме. */
  token: string;
  endpoint: string;
  /** Необязательное ASCII-значение gRPC metadata `x-app-name`. */
  appName?: string;
  useSsl?: boolean;
  tls?: TInvestTlsOptions;
  trackLimits?: boolean;
  /** Per-instance конечные положительные лимиты запросов в минуту. */
  unaryLimits?: Record<string, number>;
}
