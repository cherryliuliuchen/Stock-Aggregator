// Service: talk to Alpha Vantage
import axios from 'axios';

const BASE = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_KEY;

// Detect rate limit or missing info
function hasLimitNote(data) {
  return data?.Note || data?.Information;
}

// Step1: TOP_GAINERS_LOSERS
export async function fetchTopGainersLosers() {
  const params = new URLSearchParams({
    function: 'TOP_GAINERS_LOSERS',
    apikey: API_KEY
  });

  const url = `${BASE}?${params.toString()}`;
  const { data } = await axios.get(url, { timeout: 15000 });

  if (!data || hasLimitNote(data)) {
    const e = new Error(data?.Note || data?.Information || 'Rate limit');
    e.status = 429;
    throw e;
  }

  return {
    metadata: data.metadata,
    last_updated: data.last_updated,
    top_gainers: data.top_gainers,
    top_losers: data.top_losers,
    most_actively_traded: data.most_actively_traded
  };
}

// 2. OVERVIEW
export async function fetchOverview(symbol) {
  const params = new URLSearchParams({
    function: 'OVERVIEW',
    symbol,
    apikey: API_KEY
  });

  const url = `${BASE}?${params.toString()}`;
  const { data } = await axios.get(url, { timeout: 15000 });

  if (!data || hasLimitNote(data) || !data.Description) {
    throw new Error(`No overview for ${symbol}`);
  }

  return data;
}

// 3. TIME_SERIES_MONTHLY
export async function fetchMonthly(symbol) {
  const params = new URLSearchParams({
    function: 'TIME_SERIES_MONTHLY',
    symbol,
    apikey: API_KEY
  });

  const url = `${BASE}?${params.toString()}`;
  const { data } = await axios.get(url, { timeout: 15000 });

  if (!data || hasLimitNote(data)) {
    throw new Error(`No monthly data for ${symbol}`);
  }

  const monthly = data['Monthly Time Series'];
  if (!monthly) {
    throw new Error(`No monthly time series for ${symbol}`);
  }

  // Get keys sorted, pick the second latest (last month)
  const dates = Object.keys(monthly).sort().reverse();
  const lastMonth = dates[1]; // [0] = current month, [1] = last month
  const lastClose = lastMonth ? monthly[lastMonth]['4. close'] : null;

  return { lastMonth, lastClose };
}
