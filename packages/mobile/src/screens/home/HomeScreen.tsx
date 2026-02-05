import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Button, Card, Input } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { useAuthStore } from '../../store/authStore';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const [meetingSlug, setMeetingSlug] = useState('');

  const handleBookMeeting = () => {
    const slug = meetingSlug.trim().toLowerCase();

    if (!slug) {
      Alert.alert('Required', 'Please enter a meeting link or code.');
      return;
    }

    // Extract slug from URL if full URL was pasted
    let finalSlug = slug;
    if (slug.includes('/')) {
      const parts = slug.split('/');
      finalSlug = parts[parts.length - 1];
    }

    // Navigate to booking flow with the slug
    navigation.navigate('Booking', {
      screen: 'SlotSelection',
      params: { slug: finalSlug },
    });
  };

  const handleScanQR = () => {
    // TODO: Implement QR code scanning
    Alert.alert(
      'Coming Soon',
      'QR code scanning will be available in a future update.'
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
        </Text>
        <Text style={styles.subtitle}>
          Book a consultation with an M&A expert
        </Text>
      </View>

      {/* Book by Link/Code */}
      <Card style={styles.bookingCard}>
        <Text style={styles.cardTitle}>Book a Meeting</Text>
        <Text style={styles.cardDescription}>
          Enter the meeting link or code provided by your consultant
        </Text>

        <View style={styles.inputRow}>
          <Input
            value={meetingSlug}
            onChangeText={setMeetingSlug}
            placeholder="e.g., john-doe-consultation"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>

        <Button
          title="Find Available Times"
          onPress={handleBookMeeting}
          disabled={!meetingSlug.trim()}
          fullWidth
        />

        <TouchableOpacity style={styles.qrButton} onPress={handleScanQR}>
          <Text style={styles.qrButtonText}>Scan QR Code</Text>
        </TouchableOpacity>
      </Card>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Bookings')}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>📅</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Bookings</Text>
            <Text style={styles.actionDescription}>
              View and manage your scheduled meetings
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.actionIcon}>
            <Text style={styles.actionEmoji}>👤</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Profile</Text>
            <Text style={styles.actionDescription}>
              Update your account settings
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Help Section */}
      <Card style={styles.helpCard}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <Text style={styles.helpText}>
          If you don't have a meeting code, please contact your M&A consultant
          directly to get their booking link.
        </Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('mailto:support@manow.app')}
        >
          <Text style={styles.helpLink}>Contact Support</Text>
        </TouchableOpacity>
      </Card>
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
  },
  welcomeSection: {
    marginBottom: Spacing.xl,
  },
  welcomeText: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  bookingCard: {
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.lg,
  },
  inputRow: {
    marginBottom: Spacing.md,
  },
  input: {
    marginBottom: 0,
  },
  qrButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  qrButtonText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  quickActions: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  actionTitle: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDescription: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  helpCard: {
    backgroundColor: Colors.primary + '10',
  },
  helpTitle: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  helpText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  helpLink: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
  },
});
