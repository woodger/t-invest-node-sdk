/**
 * Модуль stderr writer адаптирует process stderr к общему text writer contract.
 *
 * Здесь допустимы:
 * - wiring stderr sink;
 * - переиспользование общей backpressure-aware записи;
 *
 * Здесь не должно быть CLI event formatting или stdout output.
 */

import {
  createBackpressureTextWriter,
  type BackpressureTextSink
} from './text-writer';
import type { TextWriter } from './text-writer';

export function createStderrWriter(stderr: BackpressureTextSink = process.stderr): TextWriter {
  return createBackpressureTextWriter(stderr);
}
