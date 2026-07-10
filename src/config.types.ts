/**
 * Модуль config types описывает форму runtime конфигурации SDK.
 *
 * Здесь допустимы:
 * - type contracts для public config surface;
 * - переиспользование application service types;
 *
 * Здесь не должно быть default values или runtime validation.
 */

import type { UnaryLimits } from './application/services/unary-throttle.service';

export type { UnaryLimits };

export interface TinkoffInvestNodeSDKConfig {
  unaryLimits: UnaryLimits;
  requireSideEffectConfirmation: boolean;
}
