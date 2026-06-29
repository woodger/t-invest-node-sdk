/**
 * Модуль stdout writer адаптирует process stdout к общему text writer contract.
 *
 * Здесь допустимы:
 * - wiring stdout sink;
 * - переиспользование общей backpressure-aware записи;
 *
 * Здесь не должно быть CLI event formatting или stderr diagnostics.
 */

import {
  createBackpressureTextWriter,
  type BackpressureTextSink
} from './text-writer';
import type { TextWriter } from './text-writer';

export function createStdoutWriter(stdout: BackpressureTextSink = process.stdout): TextWriter {
  return createBackpressureTextWriter(stdout);
}
