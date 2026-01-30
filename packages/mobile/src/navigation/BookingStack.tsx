import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ServiceTypeScreen } from '../screens/booking/ServiceTypeScreen';
import { DateSelectionScreen } from '../screens/booking/DateSelectionScreen';
import { LocationTypeScreen } from '../screens/booking/LocationTypeScreen';
import { NDAFormScreen } from '../screens/booking/NDAFormScreen';
import { PaymentScreen } from '../screens/booking/PaymentScreen';
import { ConfirmationScreen } from '../screens/booking/ConfirmationScreen';
import { Colors } from '../constants';

export type BookingStackParamList = {
  ServiceType: undefined;
  DateSelection: undefined;
  LocationType: undefined;
  NDAForm: undefined;
  Payment: undefined;
  Confirmation: undefined;
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
        name="ServiceType"
        component={ServiceTypeScreen}
        options={{ title: 'Step 1: Service Type' }}
      />
      <Stack.Screen
        name="DateSelection"
        component={DateSelectionScreen}
        options={{ title: 'Step 2: Date & Duration' }}
      />
      <Stack.Screen
        name="LocationType"
        component={LocationTypeScreen}
        options={{ title: 'Step 3: Meeting Type' }}
      />
      <Stack.Screen
        name="NDAForm"
        component={NDAFormScreen}
        options={{ title: 'Step 4: NDA Signing' }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ title: 'Step 5: Payment' }}
      />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{
          title: 'Booking Confirmed',
          headerLeft: () => null, // Disable back button
          gestureEnabled: false, // Disable swipe back
        }}
      />
    </Stack.Navigator>
  );
};
