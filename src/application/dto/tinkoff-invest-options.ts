/**
 * Модуль application DTO задает options публичного SDK.
 *
 * Здесь допустимы:
 * - форма настроек, передаваемых в bootstrap SDK facade;
 * - optional runtime flags без привязки к CLI parser-у;
 *
 * Здесь не должно быть environment fallback logic или transport creation.
 */

export interface TinkoffInvestTlsOptions {
  /**
   * PEM-encoded root CA bundle for this SDK channel.
   * Overrides the bundled T-Invest root certificate when TLS is enabled.
   */
  rootCertificates?: Buffer;
}

export interface TinkoffInvestOptions {
  token: string;
  endpoint: string;
  appName?: string;
  useSsl?: boolean;
  tls?: TinkoffInvestTlsOptions;
  trackLimits?: boolean;
  unaryLimits?: Record<string, number>;
}
