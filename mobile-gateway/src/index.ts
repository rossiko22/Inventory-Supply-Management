import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { createAuthRouter }         from './routes/auth.routes';
import { createWarehouseRouter }    from './routes/warehouse.routes';
import { createInventoryRouter }    from './routes/inventory.routes';
import { createOrderRouter }        from './routes/order.routes';
import { createCompanyRouter }      from './routes/company.routes';
import { createProductRouter }      from './routes/product.routes';
import { createFleetRouter }        from './routes/fleet.routes';
import { createNotificationRouter } from './routes/notification.routes';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware';

const app = express();

// ── Security & logging ─────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan('combined'));

// ── CORS — mobile clients may come from any origin ─────────────────────────
app.use(cors({
  origin: config.cors.origins.includes('*') ? '*' : config.cors.origins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // mobile uses Bearer header, not cookies
}));

// ── Rate limiting ──────────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max:      config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too Many Requests', message: 'Rate limit exceeded, try again later' },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'mobile-gateway',
    version: '1.0.0',
    uptime:  process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ──────────────────────────────────────────────────────────────────
// Auth — no JWT required
app.use('/auth', createAuthRouter());

// All remaining routes require a valid Bearer token (enforced per-router)
app.use('/warehouses',    createWarehouseRouter());
app.use('/stock',         createInventoryRouter());    // "stock" instead of "inventory"
app.use('/orders',        createOrderRouter());
app.use('/companies',     createCompanyRouter());
app.use('/',              createProductRouter());      // mounts /products & /categories
app.use('/',              createFleetRouter());        // mounts /drivers & /vehicles
app.use('/notifications', createNotificationRouter());

// ── 404 & error handlers ────────────────────────────────────────────────────
app.use(notFoundMiddleware);
app.use(errorMiddleware);

// ── Start ────────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`[MobileGateway] Listening on port ${config.port}`);
  console.log('[MobileGateway] Routes:');
  console.log('  GET  /health');
  console.log('  POST /auth/login | /auth/register | /auth/logout | /auth/refresh');
  console.log('  GET/POST/PUT/DELETE /warehouses[/:id]');
  console.log('  GET/POST            /stock[/:warehouseId]   (→ inventory-service)');
  console.log('  GET/POST            /orders');
  console.log('  PUT                 /orders/:id/status');
  console.log('  POST                /orders/upload-document');
  console.log('  GET/POST/PUT/DELETE /companies[/:id]');
  console.log('  GET/POST/PUT/DELETE /products[/:id]');
  console.log('  GET/POST            /categories');
  console.log('  GET/POST/PUT/DELETE /drivers[/:id]');
  console.log('  GET/POST/PUT/DELETE /vehicles[/:id]');
  console.log('  GET/PATCH           /notifications');
});
