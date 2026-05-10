import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config';
import { authMiddleware, requireManager } from '../middleware/auth.middleware';

/**
 * Product & Category routes.
 *
 * Mobile endpoint          →  Downstream
 * GET    /products         →  GET    /products
 * GET    /products/:id     →  GET    /products/:id
 * POST   /products         →  POST   /products  (MANAGER only)
 * PUT    /products/:id     →  PUT    /products/:id  (MANAGER only)
 * DELETE /products/:id     →  DELETE /products/:id  (MANAGER only)
 *
 * GET    /categories       →  GET    /categories
 * POST   /categories       →  POST   /categories  (MANAGER only)
 */
export function createProductRouter(): Router {
  const router = Router();

  const proxy = createProxyMiddleware({
    target: config.services.product,
    changeOrigin: true,
  });

  router.use(authMiddleware);

  router.get('/products',           proxy);
  router.get('/products/:id',       proxy);
  router.post('/products',          requireManager, proxy);
  router.put('/products/:id',       requireManager, proxy);
  router.delete('/products/:id',    requireManager, proxy);

  router.get('/categories',         proxy);
  router.post('/categories',        requireManager, proxy);

  return router;
}
