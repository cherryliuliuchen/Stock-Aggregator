// Helper: pick last month's final trading day from a list of YYYY-MM-DD keys
// Keys come from Alpha Vantage Monthly Time Series
// Example input: ["2025-09-12", "2025-08-29", "2025-07-31", ...]
// Output: "2025-08-29" if today is September 2025

export function pickLastMonthCloseDate(keys) {
  if (!Array.isArray(keys) || keys.length === 0) return null;

  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0 = Jan, 11 = Dec

  const prevY = m === 0 ? y - 1 : y;
  const prevM = m === 0 ? 11 : m - 1;

  const candidates = keys.filter(k => {
    const d = new Date(`${k}T00:00:00Z`);
    return d.getUTCFullYear() === prevY && d.getUTCMonth() === prevM;
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => new Date(b) - new Date(a));
  return candidates[0];
}
