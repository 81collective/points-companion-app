// src/lib/timeUtils.ts
// Centralized UTC-safe time/date helpers to avoid client locale boundary issues

/** Parse an ISO or date-like string into a Date while preserving original instant. */
export function parseDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value)
}

/** Returns true if the UTC day is Saturday (6) or Sunday (0). */
export function isWeekendUTC(value: string | Date): boolean {
  const d = parseDate(value)
  const day = d.getUTCDay()
  return day === 0 || day === 6
}

/** Returns [utcYear, utcMonthIndex] (month 0-11). */
export function getUTCMonthYear(value: string | Date): { year: number; month: number } {
  const d = parseDate(value)
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() }
}

/** Returns true if value is within the same UTC month as now. */
export function isCurrentUTCMonth(value: string | Date, now: Date = new Date()): boolean {
  const { year, month } = getUTCMonthYear(value)
  return year === now.getUTCFullYear() && month === now.getUTCMonth()
}

/** Format a date (UTC) as YYYY-MM-DD for stable logs. */
export function formatUTCDate(value: string | Date): string {
  const d = parseDate(value)
  return d.toISOString().split('T')[0]
}

/** Lightweight diagnostic payload for logging timezone-related discrepancies. */
export function buildTimeDiagnostic(sample: string | Date, now: Date = new Date()) {
  const d = parseDate(sample)
  return {
    sampleOriginal: typeof sample === 'string' ? sample : sample.toISOString(),
    localMonth: d.getMonth(),
    utcMonth: d.getUTCMonth(),
    localDay: d.getDate(),
    utcDay: d.getUTCDate(),
    localOffsetMinutes: d.getTimezoneOffset(),
    nowUTCMonth: now.getUTCMonth(),
    nowLocalMonth: now.getMonth(),
  }
}
