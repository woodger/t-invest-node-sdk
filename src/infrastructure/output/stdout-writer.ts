import {
  createBackpressureTextWriter,
  type BackpressureTextSink
} from './text-writer';
import type { TextWriter } from './text-writer';

export function createStdoutWriter(stdout: BackpressureTextSink = process.stdout): TextWriter {
  return createBackpressureTextWriter(stdout);
}
