import type { TextWriter } from './text-writer';

export function createStdoutWriter(stdout: TextWriter = process.stdout): TextWriter {
  return {
    write(chunk: string): unknown {
      return stdout.write(chunk);
    }
  };
}
