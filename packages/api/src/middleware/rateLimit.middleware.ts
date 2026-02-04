import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
  keyGenerator?: (req: Request) => string;
}

// In-memory store (use Redis in production for multi-instance deployments)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

/**
 * Rate limiter middleware factory
 */
export const rateLimit = (options: RateLimitOptions) => {
  const {
    windowMs = 60000, // 1 minute default
    maxRequests = 100,
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip || req.socket.remoteAddress || 'unknown',
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    if (!entry || entry.resetTime < now) {
      // Create new entry
      entry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(key, entry);
    } else {
      // Increment existing entry
      entry.count++;
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - entry.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));

    if (entry.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
    }

    next();
  };
};

/**
 * Pre-configured rate limiters
 */

// General API rate limit: 100 requests per minute
export const generalRateLimit = rateLimit({
  windowMs: 60000,
  maxRequests: 100,
  message: 'Too many requests, please try again later',
});

// Auth rate limit: 10 attempts per minute (stricter for login/register)
export const authRateLimit = rateLimit({
  windowMs: 60000,
  maxRequests: 10,
  message: 'Too many authentication attempts, please try again later',
});

// Booking rate limit: 20 bookings per minute per user
export const bookingRateLimit = rateLimit({
  windowMs: 60000,
  maxRequests: 20,
  message: 'Too many booking requests, please slow down',
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    const userId = (req as any).user?.id;
    return userId || req.ip || req.socket.remoteAddress || 'unknown';
  },
});
