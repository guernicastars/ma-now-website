import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LocationType } from '@ma-consultant/shared';
import { Button, Card } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { useBookingStore } from '../../store/bookingStore';

interface LocationTypeScreenProps {
  navigation: any;
}

export const LocationTypeScreen: React.FC<LocationTypeScreenProps> = ({ navigation }) => {
  const { locationType, setLocationType } = useBookingStore();

  const locationOptions = [
    {
      type: 'virtual' as LocationType,
      title: 'Virtual Meeting',
      description: 'Video conference via Zoom, Teams, or your preferred platform',
      icon: '💻',
      benefits: ['Flexible scheduling', 'No travel required', 'Record sessions'],
    },
    {
      type: 'onsite' as LocationType,
      title: 'On-site Meeting',
      description: 'Meet in person at your office or agreed location',
      icon: '🏢',
      benefits: ['Personal interaction', 'Site visits possible', 'Confidential environment'],
    },
  ];

  const handleSelect = (type: LocationType) => {
    setLocationType(type);
  };

  const handleContinue = () => {
    if (locationType) {
      if (locationType === 'onsite') {
        // For onsite meetings, go to location picker first
        navigation.navigate('LocationPicker');
      } else {
        // For virtual meetings, skip location picker
        navigation.navigate('NDAForm');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Meeting Type</Text>
          <Text style={styles.subtitle}>
            How would you like to conduct the consultation?
          </Text>
        </View>

        {locationOptions.map((option) => (
          <TouchableOpacity
            key={option.type}
            activeOpacity={0.7}
            onPress={() => handleSelect(option.type)}
          >
            <Card
              style={[
                styles.optionCard,
                locationType === option.type && styles.selectedCard,
              ]}
            >
              <Text style={styles.icon}>{option.icon}</Text>
              <View style={styles.content}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.description}>{option.description}</Text>
                <View style={styles.benefits}>
                  {option.benefits.map((benefit, index) => (
                    <Text key={index} style={styles.benefit}>
                      ✓ {benefit}
                    </Text>
                  ))}
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!locationType}
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
  optionCard: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  icon: {
    fontSize: 48,
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  benefits: {
    marginTop: Spacing.sm,
  },
  benefit: {
    ...Typography.caption,
    color: Colors.success,
    marginBottom: Spacing.xs,
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
