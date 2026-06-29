import type { TextWriter } from './text-writer';

export type BackpressureTextSink = {
  write(chunk: string): unknown;
  once?(event: 'drain', listener: () => void): unknown;
};

export function createBackpressureTextWriter(
  sink: BackpressureTextSink
): TextWriter {
  return {
    async write(chunk: string): Promise<void> {
      if (sink.write(chunk) !== false) {
        return;
      }

      if (typeof sink.once !== 'function') {
        return;
      }

      await waitForDrain(sink.once.bind(sink));
    }
  };
}

function waitForDrain(
  onceDrain: (event: 'drain', listener: () => void) => unknown
): Promise<void> {
  return new Promise((resolve) => {
    onceDrain('drain', resolve);
  });
}
