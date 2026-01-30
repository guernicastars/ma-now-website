import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { BookingDuration } from '@ma-consultant/shared';
import { Button, Card } from '../../components/UI';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants';
import { useBookingStore } from '../../store/bookingStore';

interface DateSelectionScreenProps {
  navigation: any;
}

export const DateSelectionScreen: React.FC<DateSelectionScreenProps> = ({
  navigation,
}) => {
  const { consultant, startDate, duration, setDateAndDuration } = useBookingStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(startDate);
  const [selectedDuration, setSelectedDuration] = useState<BookingDuration | null>(
    duration
  );

  // Generate next 30 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dates = generateDates();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDurationSelect = (dur: BookingDuration) => {
    setSelectedDuration(dur);
  };

  const handleContinue = () => {
    if (selectedDate && selectedDuration) {
      setDateAndDuration(selectedDate, selectedDuration);
      navigation.navigate('LocationType');
    }
  };

  const calculateTotal = () => {
    if (!consultant || !selectedDuration) return 0;
    return consultant.hourlyRate * 8 * selectedDuration;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Date & Duration</Text>
          <Text style={styles.subtitle}>
            Choose when you'd like to start the consultation
          </Text>
        </View>

        {/* Date Selection */}
        <Text style={styles.sectionTitle}>Select Start Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
          contentContainerStyle={styles.dateScrollContent}
        >
          {dates.map((date) => {
            const isSelected =
              selectedDate?.toDateString() === date.toDateString();
            return (
              <TouchableOpacity
                key={date.toISOString()}
                onPress={() => handleDateSelect(date)}
              >
                <Card
                  style={[
                    styles.dateCard,
                    isSelected && styles.selectedDateCard,
                  ]}
                  padding={Spacing.md}
                >
                  <Text
                    style={[
                      styles.dateText,
                      isSelected && styles.selectedDateText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDateText,
                    ]}
                  >
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                </Card>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selectedDate && (
          <Text style={styles.selectedDateDisplay}>
            Selected: {formatDate(selectedDate)}
          </Text>
        )}

        {/* Duration Selection */}
        <Text style={styles.sectionTitle}>Select Duration</Text>
        <View style={styles.durationContainer}>
          <TouchableOpacity
            style={styles.durationOption}
            onPress={() => handleDurationSelect(2)}
          >
            <Card
              style={[
                styles.durationCard,
                selectedDuration === 2 && styles.selectedCard,
              ]}
            >
              <Text style={styles.durationDays}>2 Days</Text>
              <Text style={styles.durationHours}>16 hours total</Text>
              {consultant && (
                <Text style={styles.durationPrice}>
                  ${consultant.hourlyRate * 8 * 2}
                </Text>
              )}
            </Card>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.durationOption}
            onPress={() => handleDurationSelect(3)}
          >
            <Card
              style={[
                styles.durationCard,
                selectedDuration === 3 && styles.selectedCard,
              ]}
            >
              <Text style={styles.durationDays}>3 Days</Text>
              <Text style={styles.durationHours}>24 hours total</Text>
              {consultant && (
                <Text style={styles.durationPrice}>
                  ${consultant.hourlyRate * 8 * 3}
                </Text>
              )}
            </Card>
          </TouchableOpacity>
        </View>

        {selectedDate && selectedDuration && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Start Date:</Text>
              <Text style={styles.summaryValue}>
                {formatDate(selectedDate)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>{selectedDuration} days</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Hours:</Text>
              <Text style={styles.summaryValue}>
                {selectedDuration * 8} hours
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Estimated Total:</Text>
              <Text style={styles.totalValue}>${calculateTotal()}</Text>
            </View>
          </Card>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedDate || !selectedDuration}
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
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  dateScroll: {
    marginBottom: Spacing.md,
  },
  dateScrollContent: {
    paddingRight: Spacing.lg,
  },
  dateCard: {
    marginRight: Spacing.md,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedDateCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  dateText: {
    ...Typography.h2,
    fontSize: 24,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  dayText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  selectedDateText: {
    color: Colors.white,
  },
  selectedDateDisplay: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  durationContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  durationOption: {
    flex: 1,
    marginRight: Spacing.md,
  },
  durationCard: {
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  durationDays: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  durationHours: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  durationPrice: {
    ...Typography.h3,
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '700',
  },
  summaryCard: {
    marginTop: Spacing.lg,
  },
  summaryTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  summaryValue: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    ...Typography.h3,
    fontSize: 18,
    color: Colors.text.primary,
  },
  totalValue: {
    ...Typography.h3,
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '700',
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
});
