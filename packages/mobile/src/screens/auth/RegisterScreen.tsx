import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Button, Input } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../services/api';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const setAuth = useAuthStore((state) => state.setAuth);

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
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authApi.register({
        ...formData,
        role: 'client',
      });
      await setAuth(response);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join us to find your perfect M&A consultant
          </Text>
        </View>

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
            label="Email"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            error={errors.email}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Phone Number (Optional)"
            value={formData.phoneNumber}
            onChangeText={(text) => updateField('phoneNumber', text)}
            placeholder="+1-555-0100"
            keyboardType="phone-pad"
          />

          <Input
            label="Password"
            value={formData.password}
            onChangeText={(text) => updateField('password', text)}
            error={errors.password}
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            style={styles.button}
          />

          <Button
            title="Already have an account? Sign In"
            variant="outline"
            onPress={() => navigation.goBack()}
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: Spacing.lg,
  },
  button: {
    marginBottom: Spacing.md,
  },
});
