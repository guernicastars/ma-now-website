import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BookingWithDetails, BookingStatus } from '@ma-consultant/shared';
import { Card } from '../UI';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants';

interface BookingCardProps {
  booking: BookingWithDetails;
  onPress: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'in_progress':
        return Colors.primary;
      case 'completed':
        return Colors.text.secondary;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.text.secondary;
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isUpcoming = () => {
    const startDate = new Date(booking.startDate);
    const now = new Date();
    return startDate > now && booking.status !== 'cancelled' && booking.status !== 'completed';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.consultantName}>
              {booking.consultant.user.firstName} {booking.consultant.user.lastName}
            </Text>
            <Text style={styles.serviceType}>
              {booking.negotiationType
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusLabel(booking.status)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.icon}>📅</Text>
            <Text style={styles.detailText}>
              {formatDate(booking.startDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.icon}>⏱️</Text>
            <Text style={styles.detailText}>
              {booking.duration} days ({booking.duration * 8} hours)
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.icon}>
              {booking.locationType === 'virtual' ? '💻' : '🏢'}
            </Text>
            <Text style={styles.detailText}>
              {booking.locationType === 'virtual'
                ? 'Virtual Meeting'
                : 'On-site Meeting'}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.amount}>${booking.totalAmount}</Text>
          {isUpcoming() && (
            <View style={styles.upcomingBadge}>
              <Text style={styles.upcomingText}>Upcoming</Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  consultantName: {
    ...Typography.h3,
    fontSize: 18,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  serviceType: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  statusText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.white,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  details: {
    marginBottom: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  icon: {
    fontSize: 16,
    marginRight: Spacing.sm,
    width: 20,
  },
  detailText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    ...Typography.h3,
    fontSize: 20,
    color: Colors.primary,
    fontWeight: '700',
  },
  upcomingBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  upcomingText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
});
