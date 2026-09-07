/**
 * Модуль общих CLI-опций собирает схемы bootstrap-команд поверх `icore`.
 *
 * Здесь допустимы общие схемы и преобразования значений, которые нужны
 * нескольким request builders. Разбор argv и проверка schema-level ограничений
 * принадлежат command mechanics `icore`.
 *
 * Здесь не должно быть создания SDK clients, чтения переменных окружения,
 * сборки generated requests или форматирования provider responses.
 */

import {
  CliUsageError,
  mergeOptionsSchema,
  type MergeOptionsSchemas,
  type OptionsSchema
} from 'icore';

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

export const positiveSafeIntegerOption = {
  type: 'number',
  integer: true,
  min: 1,
  max: Number.MAX_SAFE_INTEGER
} as const;

export function withSdkOptions<const TSchemas extends readonly OptionsSchema[]>(
  ...schemas: TSchemas
): MergeOptionsSchemas<readonly [typeof sdkOptionsSchema, ...TSchemas]> {
  return mergeOptionsSchema(sdkOptionsSchema, ...schemas);
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
  const match = rfc3339DateTimePattern.exec(value);

  if (match === null || !hasValidDateTimeParts(match)) {
    throw new CliUsageError(`Expected '--${name}' as date-time with explicit timezone`);
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
    || date.getUTCFullYear() < 1
    || date.getUTCFullYear() > 9999
  ) {
    throw new CliUsageError(`Expected '--${name}' as date-time with explicit timezone`);
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

const rfc3339DateTimePattern =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-](\d{2}):(\d{2}))$/;

function hasValidDateTimeParts(match: RegExpExecArray): boolean {
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const offsetHour = match[7] === undefined ? 0 : Number(match[7]);
  const offsetMinute = match[8] === undefined ? 0 : Number(match[8]);
  const daysInMonth = resolveDaysInMonth(year, month);

  return daysInMonth !== undefined
    && day >= 1
    && day <= daysInMonth
    && hour <= 23
    && minute <= 59
    && second <= 59
    && offsetHour <= 23
    && offsetMinute <= 59;
}

function resolveDaysInMonth(year: number, month: number): number | undefined {
  const days = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
  ];

  return month >= 1 && month <= 12 ? days[month - 1] : undefined;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
