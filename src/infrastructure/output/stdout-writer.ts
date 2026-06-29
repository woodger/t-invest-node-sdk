import {
  createBackpressureTextWriter,
  type BackpressureTextSink
} from './backpressure-text-writer';
import type { TextWriter } from './text-writer';

export function createStdoutWriter(stdout: BackpressureTextSink = process.stdout): TextWriter {
  return createBackpressureTextWriter(stdout);
}
