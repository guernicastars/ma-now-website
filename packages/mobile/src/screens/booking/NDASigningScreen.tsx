import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Button, Card } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { useBookingStore } from '../../store/bookingStore';
import { ndaApi } from '../../services/api';

interface NDASigningScreenProps {
  navigation: any;
}

export const NDASigningScreen: React.FC<NDASigningScreenProps> = ({ navigation }) => {
  const {
    hold,
    ndaSignUrl,
    ndaSigned,
    markNdaSigned,
    getHoldTimeRemaining,
  } = useBookingStore();

  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [holdTimeRemaining, setHoldTimeRemaining] = useState<number | null>(null);
  const [useWebView, setUseWebView] = useState(true);

  // Update hold countdown
  useEffect(() => {
    if (hold) {
      const interval = setInterval(() => {
        const remaining = getHoldTimeRemaining();
        setHoldTimeRemaining(remaining);

        if (remaining !== null && remaining <= 0) {
          Alert.alert(
            'Hold Expired',
            'Your slot hold has expired. Please start over and select a new time slot.',
            [{ text: 'OK', onPress: () => navigation.popToTop() }]
          );
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [hold, getHoldTimeRemaining, navigation]);

  // Poll for NDA signature status
  const checkNDAStatus = useCallback(async () => {
    if (!hold || ndaSigned) return;

    try {
      setIsCheckingStatus(true);
      const document = await ndaApi.getNDAStatus(hold.id);

      if (document.status === 'signed') {
        markNdaSigned();
        Alert.alert(
          'NDA Signed',
          'Thank you for signing the NDA. Proceeding to confirmation.',
          [{ text: 'OK', onPress: () => navigation.navigate('BookingConfirmation') }]
        );
      }
    } catch (err) {
      console.error('Error checking NDA status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  }, [hold, ndaSigned, markNdaSigned, navigation]);

  // Poll every 5 seconds when on this screen
  useEffect(() => {
    if (ndaSigned) return;

    const interval = setInterval(checkNDAStatus, 5000);
    return () => clearInterval(interval);
  }, [checkNDAStatus, ndaSigned]);

  const handleOpenInBrowser = async () => {
    if (ndaSignUrl) {
      const canOpen = await Linking.canOpenURL(ndaSignUrl);
      if (canOpen) {
        await Linking.openURL(ndaSignUrl);
        setUseWebView(false);
      } else {
        Alert.alert('Error', 'Unable to open the signing link.');
      }
    }
  };

  const handleWebViewError = () => {
    Alert.alert(
      'Loading Error',
      'Unable to load the signing page. Would you like to open it in your browser instead?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open in Browser', onPress: handleOpenInBrowser },
      ]
    );
  };

  const handleContinue = () => {
    if (ndaSigned) {
      navigation.navigate('BookingConfirmation');
    } else {
      Alert.alert(
        'NDA Not Signed',
        'Please sign the NDA to continue with your booking.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!ndaSignUrl) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>NDA signing URL not available</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          variant="outline"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Timer and Status */}
      <View style={styles.header}>
        {holdTimeRemaining !== null && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerLabel}>Time remaining:</Text>
            <Text
              style={[
                styles.timerValue,
                holdTimeRemaining < 60 && styles.timerWarning,
              ]}
            >
              {formatTimeRemaining(holdTimeRemaining)}
            </Text>
          </View>
        )}

        {ndaSigned ? (
          <View style={styles.signedBadge}>
            <Text style={styles.signedText}>NDA Signed</Text>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Awaiting Signature</Text>
          </View>
        )}
      </View>

      {/* WebView or Instructions */}
      {useWebView && !ndaSigned ? (
        <View style={styles.webViewContainer}>
          <WebView
            source={{ uri: ndaSignUrl }}
            style={styles.webView}
            onError={handleWebViewError}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Loading NDA document...</Text>
              </View>
            )}
          />
        </View>
      ) : (
        <View style={styles.instructionsContainer}>
          {ndaSigned ? (
            <Card style={styles.successCard}>
              <Text style={styles.successTitle}>NDA Signed Successfully</Text>
              <Text style={styles.successText}>
                Thank you for signing the confidentiality agreement. You can now
                proceed to confirm your booking.
              </Text>
            </Card>
          ) : (
            <Card style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Sign NDA in Browser</Text>
              <Text style={styles.instructionsText}>
                The NDA signing page has been opened in your browser. Please
                complete the signing process there.
              </Text>
              <Text style={styles.instructionsText}>
                Once you've signed, this page will automatically update.
              </Text>

              <Button
                title="Open Signing Link"
                onPress={handleOpenInBrowser}
                variant="outline"
                style={styles.openButton}
              />

              <View style={styles.checkStatusContainer}>
                <Button
                  title="Check Status"
                  onPress={checkNDAStatus}
                  loading={isCheckingStatus}
                  variant="secondary"
                />
              </View>
            </Card>
          )}
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        {!useWebView && !ndaSigned && (
          <Button
            title="Use Embedded View"
            onPress={() => setUseWebView(true)}
            variant="outline"
            style={styles.footerButtonSecondary}
          />
        )}
        <Button
          title={ndaSigned ? 'Continue to Confirmation' : 'I\'ve Signed the NDA'}
          onPress={ndaSigned ? handleContinue : checkNDAStatus}
          loading={isCheckingStatus}
          fullWidth={!(!useWebView && !ndaSigned)}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  timerValue: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: Spacing.xs,
  },
  timerWarning: {
    color: Colors.error,
  },
  signedBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  signedText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  pendingText: {
    ...Typography.caption,
    color: Colors.warning,
    fontWeight: '600',
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  instructionsContainer: {
    flex: 1,
    padding: Spacing.md,
  },
  instructionsCard: {
    alignItems: 'center',
  },
  instructionsTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  instructionsText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  openButton: {
    marginTop: Spacing.sm,
  },
  checkStatusContainer: {
    marginTop: Spacing.lg,
  },
  successCard: {
    alignItems: 'center',
    backgroundColor: Colors.success + '10',
  },
  successTitle: {
    ...Typography.h3,
    color: Colors.success,
    marginBottom: Spacing.md,
  },
  successText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  footerButtonSecondary: {
    flex: 1,
  },
});
