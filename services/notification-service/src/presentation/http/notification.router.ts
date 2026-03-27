import { Router, Request, Response } from 'express';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationRepository } from '../../domain/repository/notification.repository';

// Helper — keeps each route handler clean
function handleError(res: Response, label: string) {
  return catchError((err: Error) => {
    console.error(`[Router] ${label}:`, err.message);
    res.status(500).json({ error: err.message });
    return EMPTY;
  });
}

export function createNotificationRouter(repo: NotificationRepository): Router {
  const router = Router();

  // GET /notifications
  router.get('/', (_req: Request, res: Response) => {
    repo.findAll(50).pipe(
      handleError(res, 'findAll'),
    ).subscribe(notifications => res.json(notifications));
  });

  // GET /notifications/unread
  router.get('/unread', (_req: Request, res: Response) => {
    repo.findUnread().pipe(
      handleError(res, 'findUnread'),
    ).subscribe(notifications => res.json(notifications));
  });

  // PATCH /notifications/read-all  — must come before /:id/read
  router.patch('/read-all', (_req: Request, res: Response) => {
    repo.markAllAsRead().pipe(
      handleError(res, 'markAllAsRead'),
    ).subscribe(() => res.status(204).send());
  });

  // PATCH /notifications/:id/read
  router.patch('/:id/read', (req: Request, res: Response) => {
    repo.markAsRead(req.params['id']).pipe(
      handleError(res, 'markAsRead'),
    ).subscribe(() => res.status(204).send());
  });

  return router;
}