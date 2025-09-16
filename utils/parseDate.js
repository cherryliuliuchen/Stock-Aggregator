export function pickLastMonthCloseDate(keys) {
  // 1) If keys is not a non-empty array, return null
  if (!Array.isArray(keys) || keys.length === 0) return null;

  // 2) Get "now" and compute previous month (UTC)
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0 = Jan, 11 = Dec

  // 3) Handle year wrap-around:
  const prevY = m === 0 ? y - 1 : y;
  const prevM = m === 0 ? 11 : m - 1;

  // 4) From all date keys (YYYY-MM-DD), keep only those that belong to the previous month in UTC
  //    We append "T00:00:00Z" to force UTC parsing and avoid local timezone drift.
  const candidates = keys.filter(k => {
    const d = new Date(`${k}T00:00:00Z`);
    return d.getUTCFullYear() === prevY && d.getUTCMonth() === prevM;
  });

  // 5) If there is no date from the previous month, return null
  if (candidates.length === 0) return null;

  //6) Sort those previous-month dates descending and return the latest one.
  candidates.sort((a, b) => new Date(b) - new Date(a));
  return candidates[0];
}
