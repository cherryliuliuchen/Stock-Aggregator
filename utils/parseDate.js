// Helper: pick last month's final trading day from a list of YYYY-MM-DD keys
// keys should be sorted DESC before passing, but we also handle unsorted sets

export function pickLastMonthCloseDate(keys) {
  // If no keys, return null
  if (!Array.isArray(keys) || keys.length === 0) return null;

  // Get "now" in UTC, then compute previous month (0-11)
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0-11
  const prevY = m === 0 ? y - 1 : y;
  const prevM = m === 0 ? 11 : m - 1;

  // Filter keys to only last month in UTC
  const candidates = keys.filter(k => {
    const d = new Date(`${k}T00:00:00Z`);
    return d.getUTCFullYear() === prevY && d.getUTCMonth() === prevM;
  });

  if (candidates.length === 0) return null;

  // Sort descending to get the last trading day
  candidates.sort((a, b) => new Date(b) - new Date(a));
  return candidates[0];
}
