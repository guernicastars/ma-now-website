import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, MapPressEvent } from 'react-native-maps';
import * as Location from 'expo-location';
import { Button, Card } from '../../components/UI';
import { Colors, Spacing, Typography, DEFAULT_REGION } from '../../constants';
import { useBookingStore } from '../../store/bookingStore';

interface LocationPickerScreenProps {
  navigation: any;
}

interface SelectedLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

export const LocationPickerScreen: React.FC<LocationPickerScreenProps> = ({ navigation }) => {
  const mapRef = useRef<MapView>(null);
  const { setLocation } = useBookingStore();

  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Get user's current location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    })();
  }, []);

  // Reverse geocode to get address
  const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const addr = results[0];
        const parts = [
          addr.streetNumber,
          addr.street,
          addr.city,
          addr.region,
          addr.postalCode,
          addr.country,
        ].filter(Boolean);
        return parts.join(', ');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  // Handle map tap
  const handleMapPress = async (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    setSelectedLocation({ latitude, longitude });
    setIsLoadingAddress(true);

    const address = await getAddressFromCoordinates(latitude, longitude);
    setSelectedLocation({ latitude, longitude, address });
    setIsLoadingAddress(false);

    // Animate to selected location
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300
    );
  };

  // Use current location
  const handleUseCurrentLocation = async () => {
    if (userLocation) {
      setSelectedLocation({ ...userLocation });
      setIsLoadingAddress(true);

      const address = await getAddressFromCoordinates(userLocation.latitude, userLocation.longitude);
      setSelectedLocation({ ...userLocation, address });
      setIsLoadingAddress(false);

      mapRef.current?.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300
      );
    }
  };

  // Confirm location and continue
  const handleConfirm = () => {
    if (selectedLocation) {
      setLocation({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        address: {
          street: selectedLocation.address?.split(',')[0] || '',
          city: selectedLocation.address?.split(',')[1]?.trim() || '',
          state: selectedLocation.address?.split(',')[2]?.trim() || '',
          country: selectedLocation.address?.split(',').pop()?.trim() || '',
        },
      });
      navigation.navigate('NDAForm');
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={userLocation ? {
            ...userLocation,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          } : DEFAULT_REGION}
          showsUserLocation
          showsMyLocationButton={false}
          onPress={handleMapPress}
        >
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              title="Meeting Location"
              description={selectedLocation.address}
            >
              <View style={styles.markerContainer}>
                <View style={styles.marker}>
                  <Text style={styles.markerIcon}>📍</Text>
                </View>
                <View style={styles.markerShadow} />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Use Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}
          activeOpacity={0.8}
        >
          <Text style={styles.currentLocationIcon}>📍</Text>
          <Text style={styles.currentLocationText}>Use My Location</Text>
        </TouchableOpacity>

        {/* Instructions Overlay */}
        {!selectedLocation && (
          <View style={styles.instructionsOverlay}>
            <Text style={styles.instructionsText}>
              Tap on the map to select meeting location
            </Text>
          </View>
        )}
      </View>

      {/* Selected Location Card */}
      <View style={styles.bottomPanel}>
        <Card style={styles.locationCard}>
          <Text style={styles.cardTitle}>Meeting Location</Text>

          {selectedLocation ? (
            <>
              {isLoadingAddress ? (
                <View style={styles.loadingAddress}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Getting address...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.addressText}>{selectedLocation.address}</Text>
                  <Text style={styles.coordinatesText}>
                    {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                  </Text>
                </>
              )}
            </>
          ) : (
            <Text style={styles.placeholderText}>
              No location selected yet
            </Text>
          )}
        </Card>

        <Button
          title="Confirm Location"
          onPress={handleConfirm}
          disabled={!selectedLocation || isLoadingAddress}
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 20,
  },
  markerShadow: {
    width: 10,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 5,
    marginTop: -5,
  },
  currentLocationButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 25,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  currentLocationIcon: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  currentLocationText: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.primary,
  },
  instructionsOverlay: {
    position: 'absolute',
    top: '40%',
    left: Spacing.xl,
    right: Spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: Spacing.md,
    borderRadius: 12,
  },
  instructionsText: {
    ...Typography.body,
    color: Colors.white,
    textAlign: 'center',
  },
  bottomPanel: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  locationCard: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  addressText: {
    ...Typography.body,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  coordinatesText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  placeholderText: {
    ...Typography.body,
    color: Colors.text.secondary,
    fontStyle: 'italic',
  },
  loadingAddress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
});
