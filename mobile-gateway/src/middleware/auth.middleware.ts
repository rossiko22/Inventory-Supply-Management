import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  userId: string;
  sub:    string;   // email
  role:   'MANAGER' | 'WORKER';
  iat:    number;
  exp:    number;
}

// Attach decoded user to request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Mobile clients send JWT in the Authorization header:
 *   Authorization: Bearer <token>
 *
 * Unlike the web gateway (which reads the AUTH_TOKEN HttpOnly cookie),
 * mobile apps manage the token themselves and send it explicitly.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or malformed Authorization header. Expected: Bearer <token>',
    });
    return;
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    // The auth-service signs with a base64-decoded HMAC-SHA256 key
    const secret = Buffer.from(config.jwt.secret, 'base64');
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;

    // Forward user context as headers so downstream services can trust them
    req.headers['x-user-id']    = payload.userId;
    req.headers['x-user-email'] = payload.sub;
    req.headers['x-user-role']  = payload.role;

    // Strip the raw Authorization header — downstream services don't need it
    delete req.headers['authorization'];

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Unauthorized', message: 'Token has expired' });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Internal Server Error', message: 'Token validation failed' });
    }
  }
}

/** Optional — restrict a route to MANAGER role only */
export function requireManager(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'MANAGER') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'This action requires MANAGER role',
    });
    return;
  }
  next();
}
