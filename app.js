import express from 'express';
import dotenv from 'dotenv';
import stockRouter from './routes/stockRoutes.js';

dotenv.config(); // load .env

const app = express();
app.use(express.json());

// health check
app.get('/', (_req, res) => res.json({ ok: true }));

// stock routes
app.use('/api/stocks', stockRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
