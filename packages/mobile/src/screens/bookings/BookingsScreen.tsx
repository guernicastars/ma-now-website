import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { format, parseISO, isPast } from 'date-fns';
import { BookingWithMeetingType, BookingStatus } from '@ma-consultant/shared';
import { Button, Card } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { bookingsApi } from '../../services/api';

interface BookingsScreenProps {
  navigation: any;
}

type FilterStatus = 'all' | BookingStatus;

export const BookingsScreen: React.FC<BookingsScreenProps> = ({ navigation }) => {
  const [bookings, setBookings] = useState<BookingWithMeetingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      const query = filterStatus === 'all' ? undefined : { status: filterStatus };
      const data = await bookingsApi.getBookings(query);
      setBookings(data);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleCancelBooking = async (booking: BookingWithMeetingType) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingsApi.cancelBooking(booking.id);
              fetchBookings();
              Alert.alert('Cancelled', 'Your booking has been cancelled.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'completed':
        return Colors.primary;
      case 'canceled':
        return Colors.error;
      case 'no_show':
        return Colors.warning;
      default:
        return Colors.text.secondary;
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'completed':
        return 'Completed';
      case 'canceled':
        return 'Cancelled';
      case 'no_show':
        return 'No Show';
      default:
        return status;
    }
  };

  const renderBookingCard = ({ item: booking }: { item: BookingWithMeetingType }) => {
    const slotStart = parseISO(booking.slotStart);
    const slotEnd = parseISO(booking.slotEnd);
    const isUpcoming = !isPast(slotStart) && booking.status === 'confirmed';

    return (
      <Card style={styles.bookingCard}>
        {/* Header with status */}
        <View style={styles.cardHeader}>
          <Text style={styles.meetingName}>{booking.meetingType.name}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.status) + '20' },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(booking.status) }]}
            >
              {getStatusLabel(booking.status)}
            </Text>
          </View>
        </View>

        {/* Date and Time */}
        <View style={styles.dateTimeRow}>
          <Text style={styles.dateText}>
            {format(slotStart, 'EEEE, MMMM d, yyyy')}
          </Text>
          <Text style={styles.timeText}>
            {format(slotStart, 'h:mm a')} - {format(slotEnd, 'h:mm a')}
          </Text>
        </View>

        {/* Duration */}
        <Text style={styles.durationText}>
          {booking.meetingType.durationMinutes} minutes
        </Text>

        {/* Location if available */}
        {booking.meetingType.locationText && (
          <Text style={styles.locationText}>{booking.meetingType.locationText}</Text>
        )}

        {/* Guest notes if any */}
        {booking.guestNotes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{booking.guestNotes}</Text>
          </View>
        )}

        {/* NDA status */}
        {booking.ndaSignedAt && (
          <Text style={styles.ndaText}>
            NDA signed on {format(parseISO(booking.ndaSignedAt), 'MMM d, yyyy')}
          </Text>
        )}

        {/* Actions for upcoming bookings */}
        {isUpcoming && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(booking)}
            >
              <Text style={styles.cancelButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Unable to Load</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          title="Try Again"
          onPress={() => {
            setLoading(true);
            fetchBookings();
          }}
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'confirmed', 'completed', 'canceled'] as FilterStatus[]).map(
          (status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                filterStatus === status && styles.filterTabActive,
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterStatus === status && styles.filterTabTextActive,
                ]}
              >
                {status === 'all' ? 'All' : getStatusLabel(status as BookingStatus)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Bookings</Text>
          <Text style={styles.emptyText}>
            {filterStatus === 'all'
              ? 'You haven\'t made any bookings yet'
              : `No ${getStatusLabel(filterStatus as BookingStatus).toLowerCase()} bookings`}
          </Text>
          <Button
            title="Book a Meeting"
            onPress={() => navigation.navigate('Home')}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        />
      )}
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
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTab: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
    marginRight: Spacing.xs,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  filterTabTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
  },
  bookingCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  meetingName: {
    ...Typography.h3,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  dateTimeRow: {
    marginBottom: Spacing.xs,
  },
  dateText: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  timeText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  durationText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  locationText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  notesContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 4,
  },
  notesLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  notesText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  ndaText: {
    ...Typography.caption,
    color: Colors.success,
    marginTop: Spacing.sm,
  },
  actionsRow: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-start',
  },
  cancelButton: {
    paddingVertical: Spacing.xs,
  },
  cancelButtonText: {
    ...Typography.caption,
    color: Colors.error,
    fontWeight: '600',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    minWidth: 180,
  },
});
