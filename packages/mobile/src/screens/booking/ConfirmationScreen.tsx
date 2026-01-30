import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button, Card } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { useBookingStore } from '../../store/bookingStore';

interface ConfirmationScreenProps {
  navigation: any;
}

export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({ navigation }) => {
  const { consultant, bookingId, startDate, duration, resetBooking } = useBookingStore();

  const handleDone = () => {
    resetBooking();
    navigation.navigate('Home');
  };

  const handleViewBookings = () => {
    resetBooking();
    navigation.navigate('Bookings');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.successIcon}>
          <Text style={styles.iconText}>✅</Text>
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your consultation has been successfully booked
        </Text>

        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Booking Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Booking ID:</Text>
            <Text style={styles.value}>{bookingId?.substring(0, 8)}...</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Consultant:</Text>
            <Text style={styles.value}>
              {consultant?.user.firstName} {consultant?.user.lastName}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Start Date:</Text>
            <Text style={styles.value}>
              {startDate?.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Duration:</Text>
            <Text style={styles.value}>{duration} days</Text>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>📧 What's Next?</Text>
          <Text style={styles.infoText}>
            • Confirmation email sent to your inbox{'\n'}
            • Consultant will contact you within 24 hours{'\n'}
            • Check your bookings tab for details{'\n'}
            • Add the consultation to your calendar
          </Text>
        </Card>

        <Card style={styles.contactCard}>
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactText}>
            Contact support at support@maconsultant.com
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="View My Bookings"
          onPress={handleViewBookings}
          fullWidth
          style={styles.button}
        />
        <Button
          title="Find More Consultants"
          onPress={handleDone}
          variant="outline"
          fullWidth
        />
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
    paddingBottom: 150,
    alignItems: 'center',
  },
  successIcon: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  iconText: {
    fontSize: 80,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  detailsCard: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  label: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  value: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  infoCard: {
    width: '100%',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primaryLight,
  },
  infoTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  infoText: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  contactCard: {
    width: '100%',
    backgroundColor: Colors.surface,
  },
  contactTitle: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  contactText: {
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
  },
  button: {
    marginBottom: Spacing.md,
  },
});
