// Controller: orchestrate service calls and shape final response

import {
  fetchTopGainersLosers,
  fetchOverview,
  fetchMonthlySeries
} from '../services/alphaService.js';
import { pickLastMonthCloseDate } from '../utils/parseDate.js';

// Fallback messages required by spec
const FALLBACK_DESC = "Please check description in the official website";
const FALLBACK_LMCP = "Please check Last Months Closing Price in the official website";

// Raw endpoint: /api/stocks/market-movers (kept for debugging)
export async function getTopMovers(_req, res) {
  try {
    const data = await fetchTopGainersLosers();
    const topGainer = data.top_gainers?.[0] || null;
    const topLoser  = data.top_losers?.[0]  || null;

    return res.json({
      last_updated: data.last_updated,
      top_gainer: topGainer,
      top_loser: topLoser,
      top_gainers: data.top_gainers,
      top_losers: data.top_losers,
      source: 'Alpha Vantage TOP_GAINERS_LOSERS'
    });
  } catch (err) {
    console.error(err?.message || err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Internal error' });
  }
}

// Aggregated endpoint: /api/stocks/market-movers/aggregate
// Returns nested dailyReport with only the required fields.
export async function getTopMoversAggregated(_req, res) {
  try {
    // 1) Get today's top gainers/losers
    const movers = await fetchTopGainersLosers();
    const g = movers.top_gainers?.[0];
    const l = movers.top_losers?.[0];

    if (!g || !l) {
      return res.status(404).json({ error: 'No movers found' });
    }

    // Helper to build one side (gainer or loser)
    async function buildSide(stock, isGainer) {
      const symbol = stock.ticker;
      const currentPrice = Number.isFinite(parseFloat(stock.price)) ? parseFloat(stock.price) : stock.price;
      const percentage = stock.change_percentage;

      // 2) Overview for Description 
      const ov = await fetchOverview(symbol).catch(() => ({}));
      const description = (ov?.Description && ov.Description.trim()) ? ov.Description : FALLBACK_DESC;

      // 3) Monthly series -> last month's final trading day's close 
      const monthly = await fetchMonthlySeries(symbol).catch(() => null);
      let lastMonthClose = null;

      if (monthly) {
        const keys = Object.keys(monthly);
        const lmKey = pickLastMonthCloseDate(keys);
        if (lmKey && monthly[lmKey]?.['4. close'] != null) {
          const val = monthly[lmKey]['4. close'];
          lastMonthClose = Number.isFinite(parseFloat(val)) ? parseFloat(val) : val;
        }
      }
      if (lastMonthClose == null) lastMonthClose = FALLBACK_LMCP;

      // 4) Shape exactly as required
      if (isGainer) {
        return {
          "Top Gainer of the Day": symbol,
          "Description": description,
          "Percentage Gain Today": percentage,
          "Current Price": currentPrice,
          "Last Months Closing Price": lastMonthClose
        };
      } else {
        return {
          "Top Looser of the Day": symbol,
          "Description": description,
          "Percentage Loss Today": percentage,
          "Current Price": currentPrice,
          "Last Months Closing Price": lastMonthClose
        };
      }
    }

    const gainerObj = await buildSide(g, true);
    const loserObj  = await buildSide(l, false);

    // 5) Final nested payload
    return res.json({
      dailyReport: {
        "Top Gainer of the Day": gainerObj,
        "Top Looser of the Day": loserObj
      }
    });
  } catch (err) {
    console.error(err?.message || err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Internal error' });
  }
}
