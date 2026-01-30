import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SocketConnectionStatus } from '../../services/socket';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants';

interface ConnectionStatusProps {
  status: SocketConnectionStatus;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          color: Colors.success,
          text: '🟢 Live',
          description: 'Real-time updates active',
        };
      case 'connecting':
        return {
          color: Colors.warning,
          text: '🟡 Connecting',
          description: 'Establishing connection...',
        };
      case 'error':
        return {
          color: Colors.error,
          text: '🔴 Error',
          description: 'Connection failed',
        };
      case 'disconnected':
        return {
          color: Colors.text.secondary,
          text: '⚪ Offline',
          description: 'No real-time updates',
        };
      default:
        return {
          color: Colors.text.secondary,
          text: '⚪ Unknown',
          description: '',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <View style={[styles.container, { backgroundColor: config.color }]}>
      <Text style={styles.text}>{config.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
});
