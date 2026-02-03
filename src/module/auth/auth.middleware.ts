import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import database from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import logger from '../../utils/logger.js';
import { IJWTPayload, IUser } from './auth.model.js';

// Extend Request interface to include user
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Access token is required', 401));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return next(new AppError('Access token is required', 401));
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as IJWTPayload;

    if (!decoded.id || !decoded.email) {
      return next(new AppError('Invalid token payload', 401));
    }

    // Get user from database
    const db = database.getDb();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({
      _id: new ObjectId(decoded.id),
      isActive: true
    }) as IUser | null;

    if (!user) {
      return next(new AppError('User not found or account deactivated', 401));
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return next(new AppError('Account is temporarily locked. Please try again later.', 423));
    }

    // Attach user to request
    req.user = {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      return next(new AppError('Invalid or expired token', 401));
    }

    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('Expired JWT token', {
        error: error.message,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      return next(new AppError('Token has expired', 401));
    }

    logger.error('Authentication error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    return next(new AppError('Authentication failed', 401));
  }
};

/**
 * Authorization middleware - checks user roles
 */
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
      
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without user
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next(); // No token, continue without user
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, secret) as IJWTPayload;

    if (decoded.id && decoded.email) {
      // Get user from database
      const db = database.getDb();
      const usersCollection = db.collection('users');
      
      const user = await usersCollection.findOne({
        _id: new ObjectId(decoded.id),
        isActive: true
      }) as IUser | null;

      if (user && (!user.lockUntil || user.lockUntil <= new Date())) {
        req.user = {
          id: user._id!.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    }

    next();

  } catch (error) {
    // Ignore token errors in optional auth
    next();
  }
};

/**
 * Rate limiting middleware for authentication endpoints
 */
export const authRateLimit = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    const userAttempts = attempts.get(key);
    
    if (!userAttempts || now > userAttempts.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userAttempts.count >= maxAttempts) {
      logger.warn('Rate limit exceeded for authentication', {
        ip: req.ip,
        attempts: userAttempts.count,
        endpoint: req.originalUrl,
        timestamp: new Date().toISOString()
      });
      
      return next(new AppError('Too many authentication attempts. Please try again later.', 429));
    }
    
    userAttempts.count++;
    next();
  };
};