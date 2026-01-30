import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Input, Card } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { useBookingStore } from '../../store/bookingStore';
import { useAuthStore } from '../../store/authStore';

interface NDAFormScreenProps {
  navigation: any;
}

export const NDAFormScreen: React.FC<NDAFormScreenProps> = ({ navigation }) => {
  const user = useAuthStore((state) => state.user);
  const { ndaDetails, setNDADetails } = useBookingStore();

  const [formData, setFormData] = useState({
    firstName: ndaDetails?.firstName || user?.firstName || '',
    lastName: ndaDetails?.lastName || user?.lastName || '',
    email: ndaDetails?.email || user?.email || '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: undefined });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      setNDADetails(formData);
      navigation.navigate('Payment');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign NDA</Text>
          <Text style={styles.subtitle}>
            Non-disclosure agreement for confidential consultation
          </Text>
        </View>

        <Card style={styles.ndaCard}>
          <Text style={styles.ndaTitle}>📋 Non-Disclosure Agreement</Text>
          <Text style={styles.ndaText}>
            By providing your information below, you agree that all information shared
            during the consultation will be kept strictly confidential. Both parties
            agree not to disclose any proprietary information, business strategies, or
            sensitive data discussed during the engagement.
          </Text>
        </Card>

        <View style={styles.form}>
          <Input
            label="First Name"
            value={formData.firstName}
            onChangeText={(text) => updateField('firstName', text)}
            error={errors.firstName}
            placeholder="John"
            autoCapitalize="words"
          />

          <Input
            label="Last Name"
            value={formData.lastName}
            onChangeText={(text) => updateField('lastName', text)}
            error={errors.lastName}
            placeholder="Doe"
            autoCapitalize="words"
          />

          <Input
            label="Email Address"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            error={errors.email}
            placeholder="john.doe@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Card style={styles.agreementCard}>
            <Text style={styles.agreementText}>
              ✓ I agree to the terms of the Non-Disclosure Agreement
            </Text>
            <Text style={styles.agreementSubtext}>
              Your signature will be recorded digitally upon completion of payment
            </Text>
          </Card>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue to Payment"
          onPress={handleContinue}
          fullWidth
        />
      </View>
    </KeyboardAvoidingView>
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
  ndaCard: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.primaryLight,
  },
  ndaTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  ndaText: {
    ...Typography.body,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  form: {
    marginBottom: Spacing.lg,
  },
  agreementCard: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  agreementText: {
    ...Typography.body,
    color: Colors.success,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  agreementSubtext: {
    ...Typography.caption,
    color: Colors.text.secondary,
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
