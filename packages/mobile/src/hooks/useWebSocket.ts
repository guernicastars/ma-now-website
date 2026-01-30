import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { socketService, SocketConnectionStatus } from '../services/socket';

export const useWebSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const [connectionStatus, setConnectionStatus] =
    useState<SocketConnectionStatus>('disconnected');

  useEffect(() => {
    // Connect when authenticated
    if (isAuthenticated && token) {
      console.log('Connecting WebSocket with token...');
      socketService.connect(token);

      // Listen for status changes
      const unsubscribe = socketService.onStatusChange(setConnectionStatus);

      return () => {
        unsubscribe();
      };
    } else {
      // Disconnect when logged out
      socketService.disconnect();
      setConnectionStatus('disconnected');
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return {
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    socketService,
  };
};
