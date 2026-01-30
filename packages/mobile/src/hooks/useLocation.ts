import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '../store/locationStore';

export const useLocation = () => {
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const { userLocation, setUserLocation, setTracking, setError } = useLocationStore();

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status !== 'granted') {
        setError('Location permission not granted');
        return;
      }

      startTracking();
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      setError('Failed to request location permissions');
    }
  };

  const startTracking = async () => {
    try {
      setTracking(true);

      // Get initial location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date(location.timestamp).toISOString(),
      });

      // Watch location updates
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Or when moved 50 meters
        },
        (location) => {
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: new Date(location.timestamp).toISOString(),
          });
        }
      );
    } catch (error) {
      console.error('Error tracking location:', error);
      setError('Failed to track location');
      setTracking(false);
    }
  };

  return {
    userLocation,
    permissionStatus,
    requestPermissions,
  };
};
