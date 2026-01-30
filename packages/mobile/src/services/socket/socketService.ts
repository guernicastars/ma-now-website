import { io, Socket } from 'socket.io-client';
import { SOCKET_URL } from '../../constants/config';
import {
  ConsultantLocationUpdate,
  SubscribeToAreaData,
} from '@ma-consultant/shared';

export type SocketConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

type EventCallback = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private connectionStatus: SocketConnectionStatus = 'disconnected';
  private statusListeners: ((status: SocketConnectionStatus) => void)[] = [];

  /**
   * Initialize and connect to WebSocket server
   */
  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Connecting to WebSocket server...');
    this.setConnectionStatus('connecting');

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupEventListeners();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting from WebSocket server...');
      this.socket.disconnect();
      this.socket = null;
      this.setConnectionStatus('disconnected');
    }
  }

  /**
   * Subscribe to consultant locations in a geographic area
   */
  subscribeToArea(data: SubscribeToAreaData) {
    if (!this.socket?.connected) {
      console.warn('Cannot subscribe: Socket not connected');
      return;
    }

    console.log('Subscribing to area:', data);
    this.socket.emit('consultants:subscribe', data);
  }

  /**
   * Unsubscribe from location updates
   */
  unsubscribeFromArea() {
    if (!this.socket?.connected) {
      return;
    }

    console.log('Unsubscribing from area');
    this.socket.emit('consultants:unsubscribe');
  }

  /**
   * Listen for location updates
   */
  onLocationUpdate(callback: (data: ConsultantLocationUpdate) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.on('consultant:location', callback);
  }

  /**
   * Listen for initial consultant data
   */
  onInitialData(callback: (data: { consultants: any[]; count: number }) => void) {
    if (!this.socket) {
      console.warn('Socket not initialized');
      return;
    }

    this.socket.on('consultants:initial', callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: EventCallback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  /**
   * Listen for connection status changes
   */
  onStatusChange(callback: (status: SocketConnectionStatus) => void) {
    this.statusListeners.push(callback);
    // Immediately call with current status
    callback(this.connectionStatus);

    // Return cleanup function
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== callback);
    };
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): SocketConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.setConnectionStatus('connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.setConnectionStatus('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.setConnectionStatus('error');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Ping/pong for connection health
    this.socket.on('pong', (data) => {
      console.log('Pong received:', data);
    });
  }

  /**
   * Update connection status and notify listeners
   */
  private setConnectionStatus(status: SocketConnectionStatus) {
    this.connectionStatus = status;
    this.statusListeners.forEach((listener) => listener(status));
  }

  /**
   * Send ping to server
   */
  ping() {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }
}

// Export singleton instance
export const socketService = new SocketService();
