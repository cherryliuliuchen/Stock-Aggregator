import { Router } from 'express';
import { getTopMovers, getTopMoversAggregated } from '../controllers/stockController.js';

const router = Router();

// Step 1: raw movers only (already working)
router.get('/market-movers', getTopMovers);

// Step 2: aggregated result (three APIs combined)
router.get('/market-movers/aggregate', getTopMoversAggregated);

export default router;
