import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { format, parseISO } from 'date-fns';
import { Button, Card, Input } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { useBookingStore } from '../../store/bookingStore';
import { publicBookingApi, ndaApi } from '../../services/api';
import * as Localization from 'expo-localization';
import { v4 as uuidv4 } from 'uuid';

interface GuestInfoScreenProps {
  navigation: any;
}

export const GuestInfoScreen: React.FC<GuestInfoScreenProps> = ({ navigation }) => {
  const {
    meetingType,
    meetingTypeSlug,
    selectedSlot,
    ndaRequired,
    setGuestInfo,
    setHold,
    setNdaSignUrl,
    setLoading,
    setError,
    isLoading,
    error,
    hold,
    getHoldTimeRemaining,
  } = useBookingStore();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [holdTimeRemaining, setHoldTimeRemaining] = useState<number | null>(null);

  const timezone = Localization.timezone || 'America/New_York';

  // Update hold countdown
  useEffect(() => {
    if (hold) {
      const interval = setInterval(() => {
        const remaining = getHoldTimeRemaining();
        setHoldTimeRemaining(remaining);

        if (remaining !== null && remaining <= 0) {
          Alert.alert(
            'Hold Expired',
            'Your slot hold has expired. Please select a new time slot.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [hold, getHoldTimeRemaining, navigation]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleCreateHold = async () => {
    if (!email || !name) {
      Alert.alert('Required Fields', 'Please fill in your email and name.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!selectedSlot || !meetingTypeSlug) {
      Alert.alert('Error', 'No slot selected. Please go back and select a time slot.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create the slot hold
      const holdData = await publicBookingApi.createHold(meetingTypeSlug, {
        slotStart: selectedSlot.start,
        slotEnd: selectedSlot.end,
        email,
        name,
        idempotencyKey: uuidv4(),
      });

      setHold(holdData);
      setGuestInfo({ email, name, timezone, notes: notes || undefined });

      // If NDA is required, create NDA envelope
      if (ndaRequired) {
        try {
          const ndaResult = await ndaApi.createNDA({
            holdId: holdData.id,
            signerEmail: email,
            signerName: name,
          });
          setNdaSignUrl(ndaResult.signUrl);
          navigation.navigate('NDASigning');
        } catch (ndaError: any) {
          // NDA creation failed but hold was created
          Alert.alert(
            'NDA Error',
            'Failed to create NDA document. Please try again or contact support.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // No NDA required, go straight to confirmation
        navigation.navigate('BookingConfirmation');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reserve slot');
      Alert.alert('Error', err.message || 'Failed to reserve slot. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!selectedSlot || !meetingType) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No slot selected</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          variant="outline"
        />
      </View>
    );
  }

  const slotStart = parseISO(selectedSlot.start);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Selected Slot Info */}
        <Card style={styles.slotCard}>
          <Text style={styles.cardTitle}>Selected Time</Text>
          <Text style={styles.slotDate}>{format(slotStart, 'EEEE, MMMM d, yyyy')}</Text>
          <Text style={styles.slotTime}>{format(slotStart, 'h:mm a')}</Text>
          <Text style={styles.duration}>{meetingType.durationMinutes} minutes</Text>

          {hold && holdTimeRemaining !== null && (
            <View style={styles.holdTimer}>
              <Text style={styles.holdTimerLabel}>Hold expires in:</Text>
              <Text
                style={[
                  styles.holdTimerValue,
                  holdTimeRemaining < 60 && styles.holdTimerWarning,
                ]}
              >
                {formatTimeRemaining(holdTimeRemaining)}
              </Text>
            </View>
          )}
        </Card>

        {/* Guest Info Form */}
        <Card style={styles.formCard}>
          <Text style={styles.cardTitle}>Your Details</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email *</Text>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!hold}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name *</Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              autoCapitalize="words"
              autoComplete="name"
              editable={!hold}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional information..."
              multiline
              numberOfLines={3}
              style={styles.notesInput}
              editable={!hold}
            />
          </View>

          <Text style={styles.timezoneInfo}>
            Times shown in: {timezone}
          </Text>
        </Card>

        {/* Info about what happens next */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          {ndaRequired ? (
            <>
              <Text style={styles.infoText}>
                1. We'll hold this slot for 5 minutes
              </Text>
              <Text style={styles.infoText}>
                2. You'll sign a confidentiality agreement (NDA)
              </Text>
              <Text style={styles.infoText}>
                3. Your booking will be confirmed
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.infoText}>
                1. We'll hold this slot for 5 minutes
              </Text>
              <Text style={styles.infoText}>
                2. Your booking will be confirmed immediately
              </Text>
            </>
          )}
        </Card>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer with action button */}
      <View style={styles.footer}>
        {!hold ? (
          <Button
            title={ndaRequired ? 'Reserve Slot & Sign NDA' : 'Reserve Slot'}
            onPress={handleCreateHold}
            disabled={!email || !name || isLoading}
            loading={isLoading}
            fullWidth
          />
        ) : (
          <Button
            title={ndaRequired ? 'Continue to NDA' : 'Confirm Booking'}
            onPress={() =>
              navigation.navigate(ndaRequired ? 'NDASigning' : 'BookingConfirmation')
            }
            fullWidth
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  slotCard: {
    margin: Spacing.md,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  slotDate: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  slotTime: {
    ...Typography.h2,
    color: Colors.primary,
    marginVertical: Spacing.xs,
  },
  duration: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  holdTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  holdTimerLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  holdTimerValue: {
    ...Typography.h3,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  holdTimerWarning: {
    color: Colors.error,
  },
  formCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  timezoneInfo: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  infoCard: {
    margin: Spacing.md,
    marginTop: 0,
    backgroundColor: Colors.primary + '10',
  },
  infoTitle: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  infoText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  errorContainer: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.error + '20',
    borderRadius: 8,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
