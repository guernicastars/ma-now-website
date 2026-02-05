import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { useAuthStore } from '../../store/authStore';

export const ProfileScreen: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.info}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{user?.name}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>
      <Button
        title="Logout"
        variant="outline"
        onPress={logout}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.xl,
  },
  info: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  value: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  button: {
    marginTop: Spacing.xl,
  },
});
