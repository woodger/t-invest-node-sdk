/**
 * Модуль рендеринга простых plain-text таблиц для CLI presentation layer.
 *
 * Здесь не должно быть знаний о конкретных командах, application reports или
 * provider DTO.
 */

export function renderTextTable(rows: readonly (readonly string[])[]): string {
  const widths = rows[0].map((_, columnIndex) =>
    Math.max(...rows.map((row) => row[columnIndex].length))
  );

  return [
    ...rows.map((row) =>
      row
        .map((value, columnIndex) => value.padEnd(widths[columnIndex]))
        .join('  ')
        .trimEnd()
    ),
    ''
  ].join('\n');
}
