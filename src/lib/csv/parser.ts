// CSV parsing utilities extracted from CSVUpload component for isolated testing
export interface ParsedCSVData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  previewRows: string[][];
}

export interface ParseOptions {
  previewLimit?: number;
}

export function parseCSV(text: string, options: ParseOptions = {}): ParsedCSVData {
  const { previewLimit = 25 } = options;
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length === 0) throw new Error('CSV file is empty');

  const headers = parseCSVLine(lines[0]);
  if (headers.length === 0) throw new Error('CSV file has no headers');

  const rows = lines.slice(1).map(line => parseCSVLine(line));
  const validRows = rows.filter(r => r.length > 0);

  return {
    headers,
    rows: validRows,
    totalRows: validRows.length,
    previewRows: validRows.slice(0, previewLimit)
  };
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim()); current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
