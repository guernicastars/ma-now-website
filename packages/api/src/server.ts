import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeSocket } from './websocket/socketServer';
import { registerRoutes } from './routes';
import { locationSimulator } from './services/locationSimulator.service';
import * as db from './database';
import {
  requestLogger,
  requestCounter,
  getRequestStats,
  errorHandler,
  notFoundHandler,
  generalRateLimit,
} from './middleware';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.io
initializeSocket(httpServer);

// ============ MIDDLEWARE ============

// Request logging & counting
app.use(requestLogger);
app.use(requestCounter);

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// General rate limiting for all routes
app.use(generalRateLimit);

// ============ HEALTH & INFO ENDPOINTS ============

// Health check (no rate limit)
app.get('/health', async (req, res) => {
  const dbHealth = await db.healthCheck();
  const stats = getRequestStats();

  res.json({
    status: dbHealth.ok ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: {
      type: dbHealth.type,
      connected: dbHealth.ok,
    },
    stats: {
      totalRequests: stats.totalRequests,
      errorRate: `${stats.errorRate.toFixed(2)}%`,
    },
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'M&A Consultant API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth/*',
      consultants: '/api/consultants/*',
      bookings: '/api/bookings/*',
    },
    docs: 'See /health for server status',
  });
});

// ============ API ROUTES ============

registerRoutes(app);

// ============ ERROR HANDLING ============

// 404 handler for unknown routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// ============ START SERVER ============

httpServer.listen(PORT, () => {
  console.log('');
  console.log('='.repeat(50));
  console.log(`🚀 M&A Consultant API Server`);
  console.log('='.repeat(50));
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Database: ${db.getDatabaseType()}`);
  console.log(`📡 WebSocket: Ready`);
  console.log('='.repeat(50));
  console.log('');

  // Start location simulator after a brief delay
  setTimeout(() => {
    locationSimulator.start();
  }, 2000);
});

// ============ GRACEFUL SHUTDOWN ============

const shutdown = (signal: string) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  locationSimulator.stop();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
