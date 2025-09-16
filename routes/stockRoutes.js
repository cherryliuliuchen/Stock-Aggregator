import { Router } from 'express';
import { getTopMoversAggregated, getTopMovers } from '../controllers/stockController.js';

const router = Router();

// Optional raw endpoint 
router.get('/market-movers', getTopMovers);

// Final endpoint
router.get('/market-movers/aggregate', getTopMoversAggregated);

export default router;
