import { Router } from 'express';
import { getTopMoversAggregated, getTopMovers } from '../controllers/stockController.js';

const router = Router();

// Optional raw endpoint (kept for debugging)
router.get('/market-movers', getTopMovers);

// Final required payload (strict fields only, nested under dailyReport)
router.get('/market-movers/aggregate', getTopMoversAggregated);

export default router;
