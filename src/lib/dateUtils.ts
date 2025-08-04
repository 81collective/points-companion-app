// Date utilities to replace date-fns temporarily
// Points Companion - Simple date manipulation functions

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function differenceInDays(dateLeft: Date, dateRight: Date): number {
  const diffTime = dateLeft.getTime() - dateRight.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function format(date: Date, formatStr: string): string {
  if (formatStr === 'yyyy-MM-dd') {
    return date.toISOString().split('T')[0];
  }
  if (formatStr === 'MMM dd, yyyy') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  }
  if (formatStr === 'MMM dd') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit'
    });
  }
  // Default fallback
  return date.toLocaleDateString();
}

export function parseISO(dateString: string): Date {
  return new Date(dateString);
}
