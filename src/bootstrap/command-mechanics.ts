/**
 * The command mechanics module adapts SDK bootstrap `CliArgs` to the generic
 * `icore` option schema runtime.
 *
 * Allowed here:
 * - composing common SDK option schemas with command-specific schemas;
 * - converting current bootstrap `CliArgs` into raw option values;
 * - validating known options and extra positionals through `icore`;
 * - preserving command handlers as the place for API-specific request logic.
 *
 * Not allowed here:
 * - creating SDK clients;
 * - reading environment fallback values;
 * - building generated API requests;
 * - formatting provider responses.
 */

import {
  parseOptions,
  type InferOptions,
  type OptionsSchema,
  type RawOptionValue
} from 'icore';
import type { CliArgs } from './cli-contract';

export const sdkOptionsSchema = {
  token: {
    type: 'string'
  },
  endpoint: {
    type: 'string'
  },
  'app-name': {
    type: 'string'
  },
  insecure: {
    type: 'boolean'
  }
} as const satisfies OptionsSchema;

export function withSdkOptions<const TSchema extends OptionsSchema>(
  schema: TSchema
): typeof sdkOptionsSchema & TSchema {
  return {
    ...sdkOptionsSchema,
    ...schema
  };
}

export function parseCommandOptions<const TSchema extends OptionsSchema>(
  argv: CliArgs,
  commandName: string,
  schema: TSchema
): InferOptions<TSchema> {
  assertNoExtraPositionals(argv, commandName);

  return parseOptions(schema, toRawOptions(argv));
}

export function parseCommaSeparatedStringListOption(
  value: string,
  name: string
): string[] {
  const values = value.split(',').map((item) => item.trim());

  if (values.some((item) => item === '')) {
    throw new Error(`Expected '--${name}' as comma-separated list`);
  }

  return values;
}

export function parseDateTimeOption(value: string, name: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Expected '--${name}' as date-time`);
  }

  return date;
}

export function requireStringOption(value: string | undefined, name: string): string {
  if (value === undefined) {
    throw new Error(`Expected required argument '--${name}'`);
  }

  return value;
}

export function parseRequiredDateTimeOption(
  value: string | undefined,
  name: string
): Date {
  return parseDateTimeOption(requireStringOption(value, name), name);
}

export function parseOptionalNonNegativeIntegerOption(
  value: string | undefined,
  name: string
): number {
  if (value === undefined) {
    return 0;
  }

  if (!/^\d+$/.test(value)) {
    throw new Error(`Expected '--${name}' as integer greater than or equal to 0`);
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`Expected '--${name}' as integer greater than or equal to 0`);
  }

  return parsed;
}

function toRawOptions(argv: CliArgs): Record<string, RawOptionValue> {
  const options: Record<string, RawOptionValue> = {};

  for (const name of Object.keys(argv)) {
    if (name === '_') {
      continue;
    }

    const value = argv[name];

    if (value === undefined) {
      continue;
    }

    if (typeof value !== 'string' && typeof value !== 'boolean') {
      throw new Error(`Expected '--${name}' as scalar option`);
    }

    options[name] = value;
  }

  return options;
}

function assertNoExtraPositionals(argv: CliArgs, commandName: string): void {
  const [, ...extra] = argv._;

  if (extra.length > 0) {
    throw new Error(`Unexpected positional argument for '${commandName}': ${extra[0]}`);
  }
}
