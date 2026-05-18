import { Router } from 'express';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
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

  // Express strips the `/stock` mount path; forward as `/inventory` + path
  // so downstream inventory-service sees /inventory, /inventory/:warehouseId, etc.
  const proxy = createProxyMiddleware({
    target: config.services.inventory,
    changeOrigin: true,
    pathRewrite: (path) => `/inventory${path === '/' ? '' : path}`,
    on: { proxyReq: fixRequestBody },
  });

  router.use(authMiddleware);

  router.get('/',           proxy);
  router.get('/:warehouseId', proxy);
  router.post('/',          proxy);

  return router;
}
