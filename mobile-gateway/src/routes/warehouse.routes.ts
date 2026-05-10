import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config';
import { authMiddleware, requireManager } from '../middleware/auth.middleware';

/**
 * Warehouse routes — mobile-specific endpoint design.
 *
 * Mobile endpoint            →  Downstream
 * GET  /warehouses           →  GET  /warehouses
 * GET  /warehouses/summary   →  GET  /warehouses/total  (mobile naming convention)
 * GET  /warehouses/:id       →  GET  /warehouses/:id
 * POST /warehouses           →  POST /warehouses           (MANAGER only)
 * PUT  /warehouses/:id       →  PUT  /warehouses/:id       (MANAGER only)
 * DELETE /warehouses/:id     →  DELETE /warehouses/:id     (MANAGER only)
 */
export function createWarehouseRouter(): Router {
  const router = Router();

  const proxy = createProxyMiddleware({
    target: config.services.warehouse,
    changeOrigin: true,
    // Remap /warehouses/summary → /warehouses/total
    pathRewrite: { '^/warehouses/summary': '/warehouses/total' },
  });

  router.use(authMiddleware);

  router.get('/',           proxy);
  router.get('/summary',    proxy);
  router.get('/:id',        proxy);

  // MANAGER-only write operations
  router.post('/',          requireManager, proxy);
  router.put('/:id',        requireManager, proxy);
  router.delete('/:id',     requireManager, proxy);

  return router;
}
