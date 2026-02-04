// Auth middleware
export { authenticate, requireRole } from './auth.middleware';

// Validation middleware
export { validate, validateBody, validateQuery, validateParams } from './validate.middleware';

// Rate limiting middleware
export {
  rateLimit,
  generalRateLimit,
  authRateLimit,
  bookingRateLimit,
} from './rateLimit.middleware';

// Logging middleware
export {
  requestLogger,
  requestCounter,
  getRequestStats,
} from './logger.middleware';

// Error handling middleware
export {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
  asyncHandler,
  errorHandler,
  notFoundHandler,
} from './errorHandler.middleware';
