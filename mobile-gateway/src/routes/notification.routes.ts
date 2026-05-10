import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from '../config';
import { authMiddleware } from '../middleware/auth.middleware';

/**
 * Notification routes.
 *
 * Mobile endpoint                    →  Downstream
 * GET   /notifications               →  GET   /notifications
 * GET   /notifications/unread        →  GET   /notifications/unread
 * PATCH /notifications/read-all      →  PATCH /notifications/read-all
 * PATCH /notifications/:id/read      →  PATCH /notifications/:id/read
 *
 * Note: WebSocket for real-time events is at ws://localhost:9091
 * Mobile clients should connect to it directly (or via a WS proxy if needed).
 */
export function createNotificationRouter(): Router {
  const router = Router();

  const proxy = createProxyMiddleware({
    target: config.services.notification,
    changeOrigin: true,
  });

  router.use(authMiddleware);

  router.get('/',              proxy);
  router.get('/unread',        proxy);
  router.patch('/read-all',    proxy);
  router.patch('/:id/read',    proxy);

  return router;
}
