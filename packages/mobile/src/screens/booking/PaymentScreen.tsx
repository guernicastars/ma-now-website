import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Button, Card } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { useBookingStore } from '../../store/bookingStore';
import { bookingsApi } from '../../services/api';

interface PaymentScreenProps {
  navigation: any;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation }) => {
  const {
    consultant,
    negotiationType,
    startDate,
    duration,
    locationType,
    location,
    ndaDetails,
    totalAmount,
    setBookingId,
  } = useBookingStore();

  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!consultant || !negotiationType || !startDate || !duration || !locationType || !ndaDetails) {
      Alert.alert('Error', 'Missing booking information');
      return;
    }

    setLoading(true);

    try {
      // Create booking
      const booking = await bookingsApi.createBooking({
        consultantId: consultant.id,
        negotiationType,
        startDate: startDate.toISOString(),
        duration,
        locationType,
        location: location || undefined,
        ndaDetails: {
          firstName: ndaDetails.firstName,
          lastName: ndaDetails.lastName,
          email: ndaDetails.email,
        },
      });

      setBookingId(booking.id);

      // In a real app, we would:
      // 1. Create Stripe payment intent
      // 2. Show Stripe payment sheet
      // 3. Confirm payment
      // For now, we'll simulate success

      setTimeout(() => {
        setLoading(false);
        navigation.navigate('Confirmation');
      }, 2000);

    } catch (error: any) {
      console.error('Booking error:', error);
      setLoading(false);
      Alert.alert('Booking Failed', error.message || 'Please try again');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Review & Pay</Text>
          <Text style={styles.subtitle}>
            Confirm your booking details and complete payment
          </Text>
        </View>

        {/* Booking Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Booking Summary</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Consultant:</Text>
            <Text style={styles.value}>
              {consultant?.user.firstName} {consultant?.user.lastName}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Service Type:</Text>
            <Text style={styles.value}>
              {negotiationType?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.value}>{startDate && formatDate(startDate)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{duration} days ({duration && duration * 8} hours)</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Meeting Type:</Text>
            <Text style={styles.value}>
              {locationType === 'virtual' ? 'Virtual Meeting' : 'On-site Meeting'}
            </Text>
          </View>

          {location && locationType === 'onsite' && (
            <View style={styles.summaryRow}>
              <Text style={styles.label}>Location:</Text>
              <Text style={[styles.value, styles.locationText]} numberOfLines={2}>
                {location.address?.city}, {location.address?.country}
              </Text>
            </View>
          )}

          <View style={styles.summaryRow}>
            <Text style={styles.label}>Hourly Rate:</Text>
            <Text style={styles.value}>${consultant?.hourlyRate}/hr</Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>${totalAmount}</Text>
          </View>
        </Card>

        {/* NDA Details */}
        <Card style={styles.ndaCard}>
          <Text style={styles.sectionTitle}>NDA Signed By:</Text>
          <Text style={styles.ndaText}>
            {ndaDetails?.firstName} {ndaDetails?.lastName}
          </Text>
          <Text style={styles.ndaEmail}>{ndaDetails?.email}</Text>
        </Card>

        {/* Payment Info */}
        <Card style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>
          <Text style={styles.paymentText}>
            In production, Stripe payment integration would be here
          </Text>
          <Text style={styles.paymentSubtext}>
            For this demo, clicking "Complete Booking" will simulate a successful payment
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <Button
            title={`Complete Booking - $${totalAmount}`}
            onPress={handlePayment}
            fullWidth
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.body,
    color: Colors.text.secondary,
    flex: 1,
  },
  value: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  locationText: {
    fontSize: 13,
  },
  totalRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  totalValue: {
    ...Typography.h2,
    fontSize: 24,
    color: Colors.primary,
    fontWeight: '700',
  },
  ndaCard: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primaryLight,
  },
  ndaText: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  ndaEmail: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  paymentCard: {
    backgroundColor: Colors.surface,
  },
  paymentText: {
    ...Typography.body,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  paymentSubtext: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
});
