import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '@ma-consultant/shared';
import { findUserById } from '../database/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let io: Server;

interface AuthenticatedSocket extends Socket {
  user?: User;
}

export const initializeSocket = (httpServer: HTTPServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        console.log('No token provided for WebSocket connection');
        // Allow anonymous connections for now (can be tightened later)
        return next();
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = findUserById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      console.log(`Authenticated WebSocket connection: ${user.email} (${socket.id})`);
      next();
    } catch (error) {
      console.log('WebSocket authentication failed:', error);
      // Allow connection anyway for anonymous users
      next();
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Client connected: ${socket.id}${socket.user ? ` (${socket.user.email})` : ''}`);

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Import and initialize event handlers
    require('./socketHandlers').initializeHandlers(socket, io);
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};
