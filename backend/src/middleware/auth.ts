/**
 * @file        auth.ts
 * @owner       Cybersecurity Team
 * @description Access token validation middleware with role-based access control.
 * @depends     None
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';

export interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

/**
 * Verifies JWT access token from Authorization: Bearer <token> header.
 * Attaches decoded payload to req.user.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

/**
 * Role-based access control. Call after authenticate().
 * Usage: authorize('admin') or authorize('student', 'admin')
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' });
    }
    next();
  };
};
