/**
 * The command options module contains reusable helpers for SDK bootstrap
 * commands on top of the generic `icore` option schema runtime.
 *
 * Allowed here:
 * - composing common SDK option schemas with command-specific schemas;
 * - validating raw command option maps in command parser tests;
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
  CliUsageError,
  mergeOptionsSchema,
  parseOptions,
  type InferOptions,
  type MergeOptionsSchemas,
  type OptionsSchema,
  type RawOptionValue
} from 'icore';

/**
 * Raw option maps are used by exported parser helpers and focused tests.
 * Runtime command execution receives typed options directly from `icore`.
 */
export type CommandRawOptions = Record<string, unknown>;

type OptionalCommandOptionKeys<TOptions> = {
  [TKey in keyof TOptions]: undefined extends TOptions[TKey] ? TKey : never;
}[keyof TOptions];

type RequiredCommandOptionKeys<TOptions> = Exclude<
  keyof TOptions,
  OptionalCommandOptionKeys<TOptions>
>;

export type CommandRequestOptions<
  TOptions,
  TKeys extends keyof TOptions
> = Pick<TOptions, Extract<TKeys, RequiredCommandOptionKeys<TOptions>>>
  & Partial<Pick<TOptions, Extract<TKeys, OptionalCommandOptionKeys<TOptions>>>>;

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

export function withSdkOptions<const TSchemas extends readonly OptionsSchema[]>(
  ...schemas: TSchemas
): MergeOptionsSchemas<readonly [typeof sdkOptionsSchema, ...TSchemas]> {
  return mergeOptionsSchema(sdkOptionsSchema, ...schemas);
}

export function parseCommandOptions<const TSchema extends OptionsSchema>(
  options: CommandRawOptions,
  schema: TSchema
): InferOptions<TSchema> {
  // Command path and extra positional validation belong to `icore.runCommand`;
  // this helper validates only named options for parser helpers and tests.
  return parseOptions(schema, toRawOptions(options));
}

export function parseCommaSeparatedStringListOption(
  value: string,
  name: string
): string[] {
  const values = value.split(',').map((item) => item.trim());

  if (values.some((item) => item === '')) {
    throw new CliUsageError(`Expected '--${name}' as comma-separated list`);
  }

  return values;
}

export function parseDateTimeOption(value: string, name: string): Date {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new CliUsageError(`Expected '--${name}' as date-time`);
  }

  return date;
}

export function requireStringOption(value: string | undefined, name: string): string {
  if (value === undefined) {
    throw new CliUsageError(`Expected required argument '--${name}'`);
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
    throw new CliUsageError(`Expected '--${name}' as integer greater than or equal to 0`);
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed)) {
    throw new CliUsageError(`Expected '--${name}' as integer greater than or equal to 0`);
  }

  return parsed;
}

function toRawOptions(values: CommandRawOptions): Record<string, RawOptionValue> {
  const options: Record<string, RawOptionValue> = {};

  for (const name of Object.keys(values)) {
    const value = values[name];

    if (value === undefined) {
      continue;
    }

    if (typeof value !== 'string' && typeof value !== 'boolean') {
      throw new CliUsageError(`Expected '--${name}' as scalar option`);
    }

    // `icore.parseOptions` owns schema-level parsing; this adapter only rejects
    // values that cannot come from raw CLI option parsing.
    options[name] = value;
  }

  return options;
}
