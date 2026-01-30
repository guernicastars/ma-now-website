import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { BookingStack } from './BookingStack';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants';

const Stack = createStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, loadAuth } = useAuthStore();

  useEffect(() => {
    loadAuth();
  }, [loadAuth]);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="Booking"
            component={BookingStack}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
