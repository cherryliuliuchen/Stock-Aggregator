// Controller: orchestrate service calls and shape final response

import {
  fetchTopGainersLosers,
  fetchOverview,
  fetchMonthly
} from '../services/alphaService.js';

// Simple fallback messages
const FALLBACK_DESC = "Please check description in the official website";
const FALLBACK_LMCP = "Please check Last Months Closing Price in the official website";

// Raw endpoint: /api/stocks/market-movers
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
export async function getTopMoversAggregated(_req, res) {
  try {
    // Step1: get the top mover tickers and today % and current price
    const movers = await fetchTopGainersLosers();
    const g = movers.top_gainers?.[0];
    const l = movers.top_losers?.[0];

    if (!g || !l) {
      return res.status(404).json({ error: 'No movers found' });
    }

    // Step2: fetch Overview (may fail for tickers not covered), use fallback on error
    const gOv = await fetchOverview(g.ticker).catch(() => ({}));
    const lOv = await fetchOverview(l.ticker).catch(() => ({}));

    // Step3: fetch Monthly last-month close (may fail), use fallback on error
    const gMonthly = await fetchMonthly(g.ticker).catch(() => ({ lastMonth: null, lastClose: null }));
    const lMonthly = await fetchMonthly(l.ticker).catch(() => ({ lastMonth: null, lastClose: null }));

    // Step4:  build final payload with safe defaults
    const payload = {
      topGainer: {
        label: 'Top Gainer of the Day',
        symbol: g.ticker,
        description: (gOv?.Description && gOv.Description.trim()) ? gOv.Description : FALLBACK_DESC,
        percentageToday: g.change_percentage,           // e.g. "208.75%"
        currentPrice: parseFloat(g.price),              // from TOP_GAINERS_LOSERS
        lastMonthClosingPrice: (gMonthly.lastClose && String(gMonthly.lastClose).trim())
          ? parseFloat(gMonthly.lastClose)
          : FALLBACK_LMCP,
        lastMonthClosingDate: gMonthly.lastMonth || null
      },
      topLoser: {
        label: 'Top Loser of the Day',
        symbol: l.ticker,
        description: (lOv?.Description && lOv.Description.trim()) ? lOv.Description : FALLBACK_DESC,
        percentageToday: l.change_percentage,           // negative percent like "-57.40%"
        currentPrice: parseFloat(l.price),
        lastMonthClosingPrice: (lMonthly.lastClose && String(lMonthly.lastClose).trim())
          ? parseFloat(lMonthly.lastClose)
          : FALLBACK_LMCP,
        lastMonthClosingDate: lMonthly.lastMonth || null
      },
      last_updated: movers.last_updated,
      source: 'Alpha Vantage (TOP_GAINERS_LOSERS, OVERVIEW, TIME_SERIES_MONTHLY)'
    };

    return res.json(payload);
  } catch (err) {
    console.error(err?.message || err);
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || 'Internal error' });
  }
}
