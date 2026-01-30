import { useEffect, useCallback } from 'react';
import { ConsultantLocationUpdate } from '@ma-consultant/shared';
import { useConsultantStore } from '../store/consultantStore';
import { useLocationStore } from '../store/locationStore';
import { socketService } from '../services/socket';
import { CONSULTANT_SEARCH_RADIUS } from '../constants/config';

export const useRealtimeConsultants = (isConnected: boolean) => {
  const { userLocation } = useLocationStore();
  const { consultants, setConsultants } = useConsultantStore();

  /**
   * Subscribe to area updates when location changes
   */
  useEffect(() => {
    if (!isConnected || !userLocation) {
      return;
    }

    console.log('Subscribing to consultant locations...');
    socketService.subscribeToArea({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      radius: CONSULTANT_SEARCH_RADIUS,
    });

    return () => {
      console.log('Unsubscribing from consultant locations...');
      socketService.unsubscribeFromArea();
    };
  }, [isConnected, userLocation?.latitude, userLocation?.longitude]);

  /**
   * Handle location updates
   */
  const handleLocationUpdate = useCallback(
    (update: ConsultantLocationUpdate) => {
      console.log('Location update received:', update.consultantId);

      setConsultants(
        consultants.map((consultant) => {
          if (consultant.id === update.consultantId) {
            return {
              ...consultant,
              currentLocation: update.location,
              availability: update.availability,
            };
          }
          return consultant;
        })
      );
    },
    [consultants, setConsultants]
  );

  /**
   * Handle initial consultant data from server
   */
  const handleInitialData = useCallback(
    (data: { consultants: any[]; count: number }) => {
      console.log('Received initial consultants:', data.count);
      // This could be used to populate consultants if needed
      // For now, we're using the REST API for initial data
    },
    []
  );

  /**
   * Setup WebSocket event listeners
   */
  useEffect(() => {
    if (!isConnected) {
      return;
    }

    console.log('Setting up location update listeners...');

    // Listen for location updates
    socketService.onLocationUpdate(handleLocationUpdate);

    // Listen for initial data
    socketService.onInitialData(handleInitialData);

    return () => {
      console.log('Cleaning up location update listeners...');
      socketService.off('consultant:location', handleLocationUpdate);
      socketService.off('consultants:initial', handleInitialData);
    };
  }, [isConnected, handleLocationUpdate, handleInitialData]);

  return {
    isSubscribed: isConnected && !!userLocation,
  };
};
