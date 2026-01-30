import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ConsultantWithDistance } from '@ma-consultant/shared';
import { Card } from '../UI';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants';

interface ConsultantCardProps {
  consultant: ConsultantWithDistance;
  onPress: () => void;
}

export const ConsultantCard: React.FC<ConsultantCardProps> = ({
  consultant,
  onPress,
}) => {
  const getAvailabilityColor = () => {
    switch (consultant.availability) {
      case 'available':
        return Colors.success;
      case 'busy':
        return Colors.warning;
      case 'offline':
        return Colors.text.secondary;
      default:
        return Colors.text.secondary;
    }
  };

  const getAvailabilityText = () => {
    switch (consultant.availability) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Image
            source={{ uri: consultant.profileImageUrl }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>
              {consultant.user.firstName} {consultant.user.lastName}
            </Text>
            <View style={styles.ratingRow}>
              <Text style={styles.rating}>⭐ {consultant.rating.toFixed(1)}</Text>
              <Text style={styles.reviews}>({consultant.totalReviews})</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getAvailabilityColor() },
                ]}
              >
                <Text style={styles.statusText}>{getAvailabilityText()}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.bio} numberOfLines={2}>
          {consultant.bio}
        </Text>

        <View style={styles.footer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Hourly Rate</Text>
            <Text style={styles.infoValue}>${consultant.hourlyRate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Experience</Text>
            <Text style={styles.infoValue}>{consultant.yearsOfExperience} years</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{consultant.distance.toFixed(1)} km</Text>
          </View>
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
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
    backgroundColor: Colors.surface,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  reviews: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginLeft: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  bio: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
});
