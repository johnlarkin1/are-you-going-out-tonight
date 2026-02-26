export function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

/**
 * Get the current "nightlife date" in Eastern Time.
 * The day flips at midnight ET.
 */
export function getVoteDateET(): string {
  const now = new Date();
  const et = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  return et; // "YYYY-MM-DD"
}

/**
 * Get the next midnight ET as an ISO timestamp.
 */
export function getNextMidnightET(): string {
  const now = new Date();

  // Get current date parts in ET
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);

  const year = parseInt(parts.find((p) => p.type === 'year')!.value);
  const month = parseInt(parts.find((p) => p.type === 'month')!.value);
  const day = parseInt(parts.find((p) => p.type === 'day')!.value);

  // Create a date for tomorrow midnight ET
  // ET is UTC-5 (EST) or UTC-4 (EDT)
  // We use a reliable method: construct the next day in ET, then convert
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));

  // Determine the ET offset for that date
  const etOffset = getETOffsetMinutes(tomorrow);
  tomorrow.setUTCMinutes(tomorrow.getUTCMinutes() + etOffset);

  return tomorrow.toISOString();
}

function getETOffsetMinutes(date: Date): number {
  // Get the UTC offset for America/New_York at the given date
  const utcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
  const etStr = date.toLocaleString('en-US', { timeZone: 'America/New_York' });
  const utcDate = new Date(utcStr);
  const etDate = new Date(etStr);
  return (utcDate.getTime() - etDate.getTime()) / 60000;
}
