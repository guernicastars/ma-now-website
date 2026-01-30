import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NegotiationType } from '@ma-consultant/shared';
import { Button, Card } from '../../components/UI';
import { Colors, Spacing, Typography, BorderRadius } from '../../constants';
import { useBookingStore } from '../../store/bookingStore';

interface ServiceTypeScreenProps {
  navigation: any;
}

const serviceTypes: { type: NegotiationType; title: string; description: string; icon: string }[] = [
  {
    type: 'selling-business',
    title: 'Selling a Business',
    description: 'Get expert guidance on selling your business',
    icon: '🏢',
  },
  {
    type: 'buying-business',
    title: 'Buying a Business',
    description: 'Navigate the acquisition process with confidence',
    icon: '💼',
  },
  {
    type: 'selling-asset',
    title: 'Selling Assets',
    description: 'Maximize value when selling business assets',
    icon: '📊',
  },
  {
    type: 'buying-asset',
    title: 'Buying Assets',
    description: 'Strategic advice for asset acquisition',
    icon: '💎',
  },
  {
    type: 'other',
    title: 'Other M&A Services',
    description: 'Custom consultation for your specific needs',
    icon: '🎯',
  },
];

export const ServiceTypeScreen: React.FC<ServiceTypeScreenProps> = ({ navigation }) => {
  const { consultant, negotiationType, setNegotiationType } = useBookingStore();

  const handleSelect = (type: NegotiationType) => {
    setNegotiationType(type);
  };

  const handleContinue = () => {
    if (negotiationType) {
      navigation.navigate('DateSelection');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Service Type</Text>
          <Text style={styles.subtitle}>
            What kind of M&A consultation do you need?
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {serviceTypes.map((service) => (
            <TouchableOpacity
              key={service.type}
              activeOpacity={0.7}
              onPress={() => handleSelect(service.type)}
            >
              <Card
                style={[
                  styles.optionCard,
                  negotiationType === service.type && styles.selectedCard,
                ]}
              >
                <Text style={styles.icon}>{service.icon}</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>{service.title}</Text>
                  <Text style={styles.optionDescription}>
                    {service.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.radio,
                    negotiationType === service.type && styles.radioSelected,
                  ]}
                >
                  {negotiationType === service.type && (
                    <View style={styles.radioDot} />
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.consultantInfo}>
          Booking with: {consultant?.user.firstName} {consultant?.user.lastName}
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!negotiationType}
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
  optionsContainer: {
    marginBottom: Spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  icon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.h3,
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  optionDescription: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
  },
  consultantInfo: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
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
