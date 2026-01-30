import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../constants';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = Spacing.md,
  style,
  ...props
}) => {
  return (
    <View style={[styles.card, { padding }, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
