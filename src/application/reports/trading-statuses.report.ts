/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

import type { TradingStatusReport } from './trading-status.report';

/** Отчет команды `marketdata get-trading-statuses` на application/output boundary. */
export type TradingStatusesReport = TradingStatusReport[];
