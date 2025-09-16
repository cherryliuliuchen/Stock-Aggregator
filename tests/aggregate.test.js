import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';

test('GET /api/stocks/market-movers/aggregate returns dailyReport with required fields', async () => {
  const res = await request(app)
    .get('/api/stocks/market-movers/aggregate')
    .expect(200);

  // Print full API response for debugging
  console.log('API response:', JSON.stringify(res.body, null, 2));

  // Top-level structure
  assert.ok(res.body, 'response body missing');
  assert.ok(res.body.dailyReport, 'missing dailyReport');

  const dr = res.body.dailyReport;

  // Gainer block presence and fields
  assert.ok(dr['Top Gainer of the Day'], 'missing gainer block');
  const g = dr['Top Gainer of the Day'];
  assert.ok(Object.prototype.hasOwnProperty.call(g, 'Top Gainer of the Day'));
  assert.ok(Object.prototype.hasOwnProperty.call(g, 'Description'));
  assert.ok(Object.prototype.hasOwnProperty.call(g, 'Percentage Gain Today'));
  assert.ok(Object.prototype.hasOwnProperty.call(g, 'Current Price'));
  assert.ok(Object.prototype.hasOwnProperty.call(g, 'Last Months Closing Price'));

  // Loser block presence and fields (note spelling "Looser" per spec)
  assert.ok(dr['Top Looser of the Day'], 'missing loser block');
  const l = dr['Top Looser of the Day'];
  assert.ok(Object.prototype.hasOwnProperty.call(l, 'Top Looser of the Day'));
  assert.ok(Object.prototype.hasOwnProperty.call(l, 'Description'));
  assert.ok(Object.prototype.hasOwnProperty.call(l, 'Percentage Loss Today'));
  assert.ok(Object.prototype.hasOwnProperty.call(l, 'Current Price'));
  assert.ok(Object.prototype.hasOwnProperty.call(l, 'Last Months Closing Price'));

  // Sanity checks: types (allow string fallbacks for description/price if upstream missing)
  assert.equal(typeof g['Top Gainer of the Day'], 'string');
  assert.equal(typeof l['Top Looser of the Day'], 'string');

  // percentage fields should be strings like "123.45%"
  assert.equal(typeof g['Percentage Gain Today'], 'string');
  assert.equal(typeof l['Percentage Loss Today'], 'string');

  // current price may be number or string
  const gPriceType = typeof g['Current Price'];
  assert.ok(gPriceType === 'number' || gPriceType === 'string');

  const lPriceType = typeof l['Current Price'];
  assert.ok(lPriceType === 'number' || lPriceType === 'string');

  // last month close may be number or fallback string
  const gLmcpType = typeof g['Last Months Closing Price'];
  assert.ok(gLmcpType === 'number' || gLmcpType === 'string');

  const lLmcpType = typeof l['Last Months Closing Price'];
  assert.ok(lLmcpType === 'number' || lLmcpType === 'string');
});
