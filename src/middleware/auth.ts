import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    logger.warn('Authentication attempt without token', { ip: req.ip, path: req.path });
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
    const decoded = jwt.verify(token, secret) as any;
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    logger.info('Successful authentication', { userId: decoded.userId, path: req.path });
    next();
  } catch (error) {
    logger.warn('Invalid token provided', { ip: req.ip, path: req.path, error: (error as Error).message });
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
    const decoded = jwt.verify(token, secret) as any;
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    // Token is invalid, but that's okay for optional auth
    logger.debug('Optional auth failed', { error: (error as Error).message });
  }

  next();
};