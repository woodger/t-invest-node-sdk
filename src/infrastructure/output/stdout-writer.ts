import type { TextWriter } from './text-writer';

type StdoutSink = {
  write(chunk: string): unknown;
  once?(event: 'drain', listener: () => void): unknown;
};

export function createStdoutWriter(stdout: StdoutSink = process.stdout): TextWriter {
  return {
    async write(chunk: string): Promise<void> {
      if (stdout.write(chunk) !== false) {
        return;
      }

      if (typeof stdout.once !== 'function') {
        return;
      }

      await waitForDrain(stdout.once.bind(stdout));
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
