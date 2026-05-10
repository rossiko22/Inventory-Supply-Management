import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config';
import { authMiddleware } from '../middleware/auth.middleware';

/**
 * Inventory / Stock routes — mobile uses the name "stock" instead of "inventory".
 *
 * Mobile endpoint           →  Downstream
 * GET  /stock               →  GET  /inventory
 * GET  /stock/:warehouseId  →  GET  /inventory/:warehouseId
 * POST /stock               →  POST /inventory
 */
export function createInventoryRouter(): Router {
  const router = Router();

  // Rewrite /stock/* → /inventory/*
  const proxy = createProxyMiddleware({
    target: config.services.inventory,
    changeOrigin: true,
    pathRewrite: { '^/stock': '/inventory' },
  });

  router.use(authMiddleware);

  router.get('/',           proxy);
  router.get('/:warehouseId', proxy);
  router.post('/',          proxy);

  return router;
}
