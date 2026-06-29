/**
 * Модуль application report contracts описывает стабильный output shape.
 *
 * Здесь допустимы:
 * - DTO отчетов на границе application/output;
 * - scalar values без зависимости от generated transport DTO;
 *
 * Здесь не должно быть CLI parsing, SDK calls или presentation formatting.
 */

import type { ReportMoney } from './money.report';

export interface OpenSandboxAccountReport {
  accountId: string;
}

export interface CloseSandboxAccountReport {
  accountId: string;
  status: 'closed';
}

export interface SandboxPayInReport {
  balance: ReportMoney | null;
}
