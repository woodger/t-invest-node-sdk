import {
  createBackpressureTextWriter,
  type BackpressureTextSink
} from './backpressure-text-writer';
import type { TextWriter } from './text-writer';

export function createStderrWriter(stderr: BackpressureTextSink = process.stderr): TextWriter {
  return createBackpressureTextWriter(stderr);
}
