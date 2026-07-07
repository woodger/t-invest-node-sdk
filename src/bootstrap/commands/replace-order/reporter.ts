/**
 * Модуль CLI-репортинга команды `order replace-order`.
 *
 * `replaceOrder` возвращает тот же generated response, что и `postOrder`, поэтому
 * команда переиспользует общий order mutation report.
 */

import type { PostOrderResponse } from '../../../generated/orders';
import {
  createOrderMutationReport,
  formatOrderMutationReport,
  postOrderFormats,
  type PostOrderFormat
} from '../post-order/reporter';

export const replaceOrderFormats = postOrderFormats;

export type ReplaceOrderFormat = PostOrderFormat;

export const createReplaceOrderReport = createOrderMutationReport;
export const formatReplaceOrderReport = formatOrderMutationReport;

export function formatReplaceOrder(
  response: PostOrderResponse,
  format: ReplaceOrderFormat
): string {
  return formatReplaceOrderReport(createReplaceOrderReport(response), format);
}
