import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { User } from '@ma-consultant/shared';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const user = await AuthService.verifyToken(token);

    req.user = user;
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

export const requireRole = (...roles: User['role'][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};
