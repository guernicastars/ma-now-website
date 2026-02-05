import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { format, addDays, startOfDay, parseISO } from 'date-fns';
import { Button, Card } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { useBookingStore } from '../../store/bookingStore';
import { publicBookingApi } from '../../services/api';
import { TimeSlot, MeetingTypePublic } from '@ma-consultant/shared';
import * as Localization from 'expo-localization';

interface SlotSelectionScreenProps {
  navigation: any;
  route: { params: { slug: string } };
}

export const SlotSelectionScreen: React.FC<SlotSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const { slug } = route.params;
  const { startBooking, selectSlot, selectedSlot, meetingType } = useBookingStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));

  const timezone = Localization.timezone || 'America/New_York';

  // Generate next 7 days for date selector
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  // Fetch meeting type info
  useEffect(() => {
    const fetchMeetingType = async () => {
      try {
        setIsLoading(true);
        const data = await publicBookingApi.getMeetingType(slug);
        startBooking(data, slug);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load meeting type');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetingType();
  }, [slug]);

  // Fetch available slots when date changes
  const fetchSlots = useCallback(async () => {
    if (!meetingType) return;

    try {
      setIsLoadingSlots(true);
      const startDate = format(selectedDate, 'yyyy-MM-dd');
      const endDate = format(selectedDate, 'yyyy-MM-dd');

      const availableSlots = await publicBookingApi.getAvailableSlots(slug, {
        startDate,
        endDate,
        timezone,
      });

      setSlots(availableSlots);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load slots');
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [slug, selectedDate, timezone, meetingType]);

  useEffect(() => {
    if (meetingType) {
      fetchSlots();
    }
  }, [fetchSlots, meetingType]);

  const handleSlotSelect = (slot: TimeSlot) => {
    selectSlot(slot);
  };

  const handleContinue = () => {
    if (selectedSlot) {
      navigation.navigate('GuestInfo');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading meeting details...</Text>
      </View>
    );
  }

  if (error && !meetingType) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Unable to Load</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Try Again"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Meeting Type Info */}
      <Card style={styles.infoCard}>
        <Text style={styles.meetingName}>{meetingType?.name}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Duration:</Text>
          <Text style={styles.infoValue}>{meetingType?.durationMinutes} minutes</Text>
        </View>
        {meetingType?.locationText && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{meetingType.locationText}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Host:</Text>
          <Text style={styles.infoValue}>{meetingType?.hostName}</Text>
        </View>
        {meetingType?.requiresNda && (
          <View style={styles.ndaBadge}>
            <Text style={styles.ndaBadgeText}>NDA Required</Text>
          </View>
        )}
      </Card>

      {/* Date Selector */}
      <View style={styles.dateSection}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScroll}
        >
          {dates.map((date) => {
            const isSelected =
              format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                onPress={() => setSelectedDate(startOfDay(date))}
              >
                <Text
                  style={[styles.dateDay, isSelected && styles.dateDaySelected]}
                >
                  {format(date, 'EEE')}
                </Text>
                <Text
                  style={[styles.dateNum, isSelected && styles.dateNumSelected]}
                >
                  {format(date, 'd')}
                </Text>
                <Text
                  style={[
                    styles.dateMonth,
                    isSelected && styles.dateMonthSelected,
                  ]}
                >
                  {format(date, 'MMM')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Time Slots */}
      <View style={styles.slotsSection}>
        <Text style={styles.sectionTitle}>Available Times</Text>
        {isLoadingSlots ? (
          <View style={styles.slotsLoading}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : slots.length === 0 ? (
          <View style={styles.noSlots}>
            <Text style={styles.noSlotsText}>
              No available slots for this date
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.slotsScroll}
            refreshControl={
              <RefreshControl
                refreshing={isLoadingSlots}
                onRefresh={fetchSlots}
                tintColor={Colors.primary}
              />
            }
          >
            <View style={styles.slotsGrid}>
              {slots.map((slot) => {
                const slotTime = parseISO(slot.start);
                const isSelected =
                  selectedSlot?.start === slot.start;
                return (
                  <TouchableOpacity
                    key={slot.start}
                    style={[
                      styles.slotButton,
                      isSelected && styles.slotButtonSelected,
                    ]}
                    onPress={() => handleSlotSelect(slot)}
                  >
                    <Text
                      style={[
                        styles.slotTime,
                        isSelected && styles.slotTimeSelected,
                      ]}
                    >
                      {format(slotTime, 'h:mm a')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedSlot}
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
  retryButton: {
    minWidth: 120,
  },
  infoCard: {
    margin: Spacing.md,
  },
  meetingName: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
    width: 80,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.text.primary,
    flex: 1,
  },
  ndaBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  ndaBadgeText: {
    ...Typography.caption,
    color: Colors.warning,
    fontWeight: '600',
  },
  dateSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  dateScroll: {
    paddingVertical: Spacing.xs,
  },
  dateCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginRight: Spacing.sm,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  dateDay: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
  },
  dateDaySelected: {
    color: Colors.primary,
  },
  dateNum: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginVertical: 2,
  },
  dateNumSelected: {
    color: Colors.primary,
  },
  dateMonth: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  dateMonthSelected: {
    color: Colors.primary,
  },
  slotsSection: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  slotsLoading: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  noSlots: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  noSlotsText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  slotsScroll: {
    flex: 1,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slotButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 100,
    alignItems: 'center',
  },
  slotButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotTime: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  slotTimeSelected: {
    color: Colors.white,
  },
  footer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
