// Minimal CSV helpers for export and import (no external dependency).
export function exportToCsv(filename, columns, rows) {
  const header = columns.map((c) => `"${c.header}"`).join(',');
  const body = rows
    .map((row) =>
      columns
        .map((c) => {
          const raw = c.value ? c.value(row) : row[c.key];
          const val = raw == null ? '' : String(raw).replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(',')
    )
    .join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = splitLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const cells = splitLine(line);
    return headers.reduce((obj, h, i) => ({ ...obj, [h]: (cells[i] || '').trim() }), {});
  });
}

function splitLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      out.push(cur); cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out;
}
