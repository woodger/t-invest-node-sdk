/**
 * Модуль рендеринга простых CSV-строк.
 *
 * Здесь не должно быть знаний о конкретных командах, application reports или
 * provider DTO.
 */

type CsvCell = string | number | boolean;

function renderCsvValue(value: CsvCell): string {
  const text = String(value);

  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

export function renderCsvRow(values: readonly CsvCell[]): string {
  return values.map(renderCsvValue).join(',');
}
