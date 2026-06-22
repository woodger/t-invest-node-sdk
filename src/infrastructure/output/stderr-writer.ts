import type { TextWriter } from './text-writer';

export function createStderrWriter(stderr: TextWriter = process.stderr): TextWriter {
  return {
    write(chunk: string): unknown {
      return stderr.write(chunk);
    }
  };
}
