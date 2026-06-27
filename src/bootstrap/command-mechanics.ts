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
