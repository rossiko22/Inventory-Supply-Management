import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { azureConfigured, config } from './config';
import { createInventorySummaryRouter } from './routes/inventory-summary';
import { createReorderRouter }          from './routes/reorder-suggestion';

const app = express();

app.use(cors({
  origin: config.cors.origins.includes('*') ? '*' : config.cors.origins,
  credentials: false,
}));
app.use(express.json());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      300,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too Many Requests', message: 'Rate limit exceeded.' },
}));

app.get('/health', (_req, res) => {
  res.json({
    status:           'ok',
    service:          'ai-service',
    azureConfigured:  azureConfigured(),
    upstreams:        config.services,
  });
});

const ai = express.Router();
ai.use(createInventorySummaryRouter());
ai.use(createReorderRouter());
app.use('/ai', ai);

app.use((_req, res) => res.status(404).json({ error: 'Not Found' }));

app.listen(config.port, () => {
  console.log(`[ai-service] listening on port ${config.port} (Azure ${azureConfigured() ? 'configured' : 'not configured — using templated summaries'})`);
});
