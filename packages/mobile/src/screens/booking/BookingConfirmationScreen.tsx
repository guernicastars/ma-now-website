import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { format, parseISO } from 'date-fns';
import { Button, Card } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { useBookingStore } from '../../store/bookingStore';
import { publicBookingApi } from '../../services/api';
import { v4 as uuidv4 } from 'uuid';

interface BookingConfirmationScreenProps {
  navigation: any;
}

export const BookingConfirmationScreen: React.FC<BookingConfirmationScreenProps> = ({
  navigation,
}) => {
  const {
    meetingType,
    meetingTypeSlug,
    selectedSlot,
    hold,
    guestName,
    guestEmail,
    guestTimezone,
    guestNotes,
    ndaRequired,
    ndaSigned,
    booking,
    setBooking,
    resetBooking,
    getHoldTimeRemaining,
  } = useBookingStore();

  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [holdTimeRemaining, setHoldTimeRemaining] = useState<number | null>(null);

  // Update hold countdown
  useEffect(() => {
    if (hold && !booking) {
      const interval = setInterval(() => {
        const remaining = getHoldTimeRemaining();
        setHoldTimeRemaining(remaining);

        if (remaining !== null && remaining <= 0) {
          Alert.alert(
            'Hold Expired',
            'Your slot hold has expired. Please start over and select a new time slot.',
            [{ text: 'OK', onPress: handleStartOver }]
          );
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [hold, booking, getHoldTimeRemaining]);

  // Auto-confirm when arriving on this screen if all conditions are met
  useEffect(() => {
    if (
      hold &&
      !booking &&
      !isConfirming &&
      (!ndaRequired || ndaSigned) &&
      guestName &&
      guestTimezone
    ) {
      handleConfirmBooking();
    }
  }, [hold, booking, ndaRequired, ndaSigned, guestName, guestTimezone]);

  const handleConfirmBooking = async () => {
    if (!hold || !meetingTypeSlug || !guestName || !guestTimezone) {
      setError('Missing required information. Please go back and fill in all details.');
      return;
    }

    if (ndaRequired && !ndaSigned) {
      setError('Please sign the NDA before confirming your booking.');
      return;
    }

    try {
      setIsConfirming(true);
      setError(null);

      const confirmedBooking = await publicBookingApi.confirmBooking(meetingTypeSlug, {
        holdId: hold.id,
        guestName,
        guestTimezone,
        guestNotes: guestNotes || undefined,
        idempotencyKey: uuidv4(),
      });

      setBooking(confirmedBooking);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm booking. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleStartOver = () => {
    resetBooking();
    navigation.popToTop();
  };

  const handleDone = () => {
    resetBooking();
    // Navigate to home or bookings list
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state while confirming
  if (isConfirming) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Confirming your booking...</Text>
      </View>
    );
  }

  // Error state
  if (error && !booking) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Unable to Confirm</Text>
        <Text style={styles.errorText}>{error}</Text>
        <View style={styles.errorButtons}>
          <Button
            title="Try Again"
            onPress={handleConfirmBooking}
            style={styles.errorButton}
          />
          <Button
            title="Start Over"
            onPress={handleStartOver}
            variant="outline"
            style={styles.errorButton}
          />
        </View>
      </View>
    );
  }

  // Waiting for confirmation
  if (!booking) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Processing...</Text>
        {holdTimeRemaining !== null && (
          <Text style={styles.timerText}>
            Time remaining: {formatTimeRemaining(holdTimeRemaining)}
          </Text>
        )}
      </View>
    );
  }

  // Success state
  const slotStart = parseISO(booking.slotStart);
  const slotEnd = parseISO(booking.slotEnd);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Success Icon */}
      <View style={styles.successIcon}>
        <Text style={styles.successEmoji}>✓</Text>
      </View>

      <Text style={styles.successTitle}>Booking Confirmed!</Text>
      <Text style={styles.successSubtitle}>
        Your meeting has been scheduled
      </Text>

      {/* Booking Details Card */}
      <Card style={styles.detailsCard}>
        <Text style={styles.cardTitle}>Meeting Details</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Meeting Type</Text>
          <Text style={styles.detailValue}>{meetingType?.name}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>
            {format(slotStart, 'EEEE, MMMM d, yyyy')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Time</Text>
          <Text style={styles.detailValue}>
            {format(slotStart, 'h:mm a')} - {format(slotEnd, 'h:mm a')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Duration</Text>
          <Text style={styles.detailValue}>
            {meetingType?.durationMinutes} minutes
          </Text>
        </View>

        {meetingType?.locationText && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{meetingType.locationText}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Host</Text>
          <Text style={styles.detailValue}>{meetingType?.hostName}</Text>
        </View>
      </Card>

      {/* Guest Info Card */}
      <Card style={styles.guestCard}>
        <Text style={styles.cardTitle}>Your Information</Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Name</Text>
          <Text style={styles.detailValue}>{booking.guestName}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{booking.guestEmail}</Text>
        </View>

        {booking.guestNotes && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes</Text>
            <Text style={styles.detailValue}>{booking.guestNotes}</Text>
          </View>
        )}

        {ndaRequired && booking.ndaSignedAt && (
          <View style={styles.ndaInfo}>
            <Text style={styles.ndaText}>NDA signed on {format(parseISO(booking.ndaSignedAt), 'MMM d, yyyy')}</Text>
          </View>
        )}
      </Card>

      {/* Confirmation Info */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoText}>
          A confirmation email has been sent to {booking.guestEmail}
        </Text>
      </Card>

      {/* Booking ID */}
      <Text style={styles.bookingId}>
        Booking ID: {booking.id.slice(0, 8)}...
      </Text>

      {/* Done Button */}
      <Button
        title="Done"
        onPress={handleDone}
        fullWidth
        style={styles.doneButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  timerText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  errorButton: {
    minWidth: 120,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successEmoji: {
    fontSize: 40,
    color: Colors.white,
  },
  successTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
  },
  detailsCard: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  guestCard: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  detailLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  detailValue: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.md,
  },
  ndaInfo: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ndaText: {
    ...Typography.caption,
    color: Colors.success,
  },
  infoCard: {
    width: '100%',
    backgroundColor: Colors.primary + '10',
    marginBottom: Spacing.md,
  },
  infoText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  bookingId: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  doneButton: {
    marginTop: Spacing.md,
  },
});
