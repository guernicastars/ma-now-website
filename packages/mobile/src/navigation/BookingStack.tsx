import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { SlotSelectionScreen } from '../screens/booking/SlotSelectionScreen';
import { GuestInfoScreen } from '../screens/booking/GuestInfoScreen';
import { NDASigningScreen } from '../screens/booking/NDASigningScreen';
import { BookingConfirmationScreen } from '../screens/booking/BookingConfirmationScreen';
import { Colors } from '../constants';

export type BookingStackParamList = {
  SlotSelection: { slug: string };
  GuestInfo: undefined;
  NDASigning: undefined;
  BookingConfirmation: undefined;
};

const Stack = createStackNavigator<BookingStackParamList>();

export const BookingStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen
        name="SlotSelection"
        component={SlotSelectionScreen}
        options={{ title: 'Select Time Slot' }}
      />
      <Stack.Screen
        name="GuestInfo"
        component={GuestInfoScreen}
        options={{ title: 'Your Details' }}
      />
      <Stack.Screen
        name="NDASigning"
        component={NDASigningScreen}
        options={{ title: 'Sign NDA' }}
      />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
        options={{
          title: 'Booking Confirmed',
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};
