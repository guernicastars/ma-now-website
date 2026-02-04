import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants';

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  currentStep,
  totalSteps,
  labels = ['Service', 'Date', 'Location', 'NDA', 'Payment', 'Done'],
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCompleted,
                  isActive && styles.stepActive,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      (isCompleted || isActive) && styles.stepNumberActive,
                    ]}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>

              {/* Connector Line */}
              {index < totalSteps - 1 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>

      {/* Current Step Label */}
      <Text style={styles.currentLabel}>
        Step {currentStep} of {totalSteps}: {labels[currentStep - 1]}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  stepCompleted: {
    borderColor: Colors.success,
    backgroundColor: Colors.success,
  },
  stepNumber: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  stepNumberActive: {
    color: Colors.white,
  },
  checkmark: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
    maxWidth: 40,
  },
  connectorCompleted: {
    backgroundColor: Colors.success,
  },
  currentLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});
