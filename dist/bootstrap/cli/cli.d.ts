#!/usr/bin/env node
import type { CliArgs } from '../cli-contract';
type CliWritable = {
    write(chunk: string): unknown;
};
type CliIO = {
    stdout: CliWritable;
    stderr: CliWritable;
};
export declare function parseCliArgs(argv: string[]): CliArgs;
export declare function runCli(argv?: string[], io?: CliIO): number;
export {};
