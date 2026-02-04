import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeSocket } from './websocket/socketServer';
import { registerRoutes } from './routes';
import { locationSimulator } from './services/locationSimulator.service';
import * as db from './database';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize Socket.io
initializeSocket(httpServer);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', async (req, res) => {
  const dbHealth = await db.healthCheck();
  res.json({
    status: dbHealth.ok ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: {
      type: dbHealth.type,
      connected: dbHealth.ok,
    },
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'M&A Consultant API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/*',
      consultants: '/api/consultants/*',
      bookings: '/api/bookings/*',
      payments: '/api/payments/*'
    }
  });
});

// Register API routes
registerRoutes(app);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);

  // Start location simulator after a brief delay
  setTimeout(() => {
    locationSimulator.start();
  }, 2000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  locationSimulator.stop();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  locationSimulator.stop();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
