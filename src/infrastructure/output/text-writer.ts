export type TextWriter = {
  write(chunk: string): unknown | Promise<unknown>;
};

/**
 * Minimal writable stream surface needed by CLI output sinks.
 *
 * Node writable streams return `false` from `write()` when their internal
 * buffer is full. In that case the CLI must pause output until `drain`, or a
 * long-running stream command can keep reading provider events faster than the
 * consumer reads stdout/stderr.
 */
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

      // Test doubles and simple in-memory writers may not expose `drain`.
      // They are treated as already flushed because they do not have a real
      // OS-level buffer to protect.
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
    // `drain` is emitted once the writable stream is ready for more data.
    onceDrain('drain', resolve);
  });
}
