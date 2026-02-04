import { Request, Response, NextFunction } from 'express';

interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  query: Record<string, any>;
  userId?: string;
  ip: string;
  userAgent: string;
  duration?: number;
  statusCode?: number;
}

/**
 * Request logger middleware
 * Logs all incoming requests with timing information
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Generate request ID for tracing
  const requestId = Math.random().toString(36).substring(2, 15);
  req.headers['x-request-id'] = requestId;

  // Log request start
  const log: RequestLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    query: req.query,
    userId: (req as any).user?.id,
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.get('user-agent') || 'unknown',
  };

  // Log on response finish
  res.on('finish', () => {
    log.duration = Date.now() - startTime;
    log.statusCode = res.statusCode;

    // Color code based on status
    const statusColor =
      res.statusCode >= 500
        ? '\x1b[31m' // Red
        : res.statusCode >= 400
        ? '\x1b[33m' // Yellow
        : '\x1b[32m'; // Green

    const resetColor = '\x1b[0m';

    console.log(
      `${statusColor}[${log.method}]${resetColor} ${log.path} - ${log.statusCode} (${log.duration}ms)${
        log.userId ? ` [user: ${log.userId.substring(0, 8)}...]` : ''
      }`
    );

    // Log full details for errors
    if (res.statusCode >= 400) {
      console.log('  Request details:', JSON.stringify(log, null, 2));
    }
  });

  next();
};

/**
 * Simple request counter for monitoring
 */
let requestCount = 0;
let errorCount = 0;

export const getRequestStats = () => ({
  totalRequests: requestCount,
  totalErrors: errorCount,
  errorRate: requestCount > 0 ? (errorCount / requestCount) * 100 : 0,
});

export const requestCounter = (req: Request, res: Response, next: NextFunction) => {
  requestCount++;

  res.on('finish', () => {
    if (res.statusCode >= 400) {
      errorCount++;
    }
  });

  next();
};
