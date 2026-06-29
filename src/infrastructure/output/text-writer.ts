export type TextWriter = {
  write(chunk: string): unknown | Promise<unknown>;
};
