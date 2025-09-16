// Service: talk to Alpha Vantage (three endpoints)
import axios from 'axios';

const BASE = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_KEY;

// Detect upstream rate-limit/info notes
function hasLimitNote(data) {
  return data?.Note || data?.Information;
}

// Generic fetcher
async function callAlphaVantage(params) {
  const url = `${BASE}?${new URLSearchParams({ ...params, apikey: API_KEY }).toString()}`;
  const { data } = await axios.get(url, { timeout: 15000 });

  if (!data) {
    const e = new Error('Empty response from upstream');
    e.status = 502;
    throw e;
  }
  if (hasLimitNote(data)) {
    const e = new Error(data.Note || data.Information || 'Rate limit from upstream');
    e.status = 429;
    throw e;
  }
  return data;
}

// 1) TOP_GAINERS_LOSERS
export async function fetchTopGainersLosers() {
  const data = await callAlphaVantage({ function: 'TOP_GAINERS_LOSERS' });
  if (!data.top_gainers || !data.top_losers) {
    const e = new Error('No movers data from upstream');
    e.status = 404;
    throw e;
  }
  return {
    last_updated: data.last_updated,
    top_gainers: data.top_gainers,
    top_losers: data.top_losers
  };
}

// 2) OVERVIEW (for Description)
export async function fetchOverview(symbol) {
  const data = await callAlphaVantage({ function: 'OVERVIEW', symbol });
  if (!data || !data.Symbol) {
    const e = new Error(`No overview for ${symbol}`);
    e.status = 404;
    throw e;
  }
  return data; // includes "Description"
}

// 3) TIME_SERIES_MONTHLY (full series; controller picks last month close)
export async function fetchMonthlySeries(symbol) {
  const data = await callAlphaVantage({ function: 'TIME_SERIES_MONTHLY', symbol });
  const series = data?.['Monthly Time Series'];
  if (!series) {
    const e = new Error(`No monthly series for ${symbol}`);
    e.status = 404;
    throw e;
  }
  return series; // { 'YYYY-MM-DD': { '1. open', '2. high', '3. low', '4. close', '5. volume' }, ... }
}
