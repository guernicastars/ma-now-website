import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MapViewComponent } from '../../components/Map/MapView';
import { ConsultantCard } from '../../components/Consultant/ConsultantCard';
import { Button, ConnectionStatus } from '../../components/UI';
import { Colors, Spacing, Typography } from '../../constants';
import { useLocation } from '../../hooks/useLocation';
import { useConsultants } from '../../hooks/useConsultants';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useRealtimeConsultants } from '../../hooks/useRealtimeConsultants';
import { useBookingStore } from '../../store/bookingStore';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { userLocation, permissionStatus } = useLocation();
  const {
    consultants,
    selectedConsultant,
    isLoading,
    error,
    setSelectedConsultant,
    refetch,
  } = useConsultants();

  // WebSocket integration
  const { connectionStatus, isConnected } = useWebSocket();
  const { isSubscribed } = useRealtimeConsultants(isConnected);

  // Booking store
  const startBooking = useBookingStore((state) => state.startBooking);

  const handleBookConsultant = (consultant: any) => {
    startBooking(consultant);
    navigation.navigate('Booking', { screen: 'ServiceType' });
  };

  if (permissionStatus === 'denied') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>Location Permission Required</Text>
        <Text style={styles.errorText}>
          Please enable location permissions to find consultants near you
        </Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapViewComponent
          userLocation={userLocation}
          consultants={consultants}
          selectedConsultant={selectedConsultant}
          onSelectConsultant={setSelectedConsultant}
        />
      </View>

      {/* Bottom Sheet with Consultant List */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <View style={styles.headerRow}>
            <Text style={styles.sheetTitle}>
              Nearby Consultants ({consultants.length})
            </Text>
            <ConnectionStatus status={connectionStatus} />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {isLoading && consultants.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={consultants}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ConsultantCard
                consultant={item}
                onPress={() => handleBookConsultant(item)}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No consultants found nearby
                </Text>
                <Button
                  title="Refresh"
                  variant="outline"
                  onPress={refetch}
                  style={styles.refreshButton}
                />
              </View>
            }
          />
        )}
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
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  mapContainer: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
  },
  sheetHeader: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sheetTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  listContent: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  refreshButton: {
    minWidth: 120,
  },
  errorTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
  },
});
