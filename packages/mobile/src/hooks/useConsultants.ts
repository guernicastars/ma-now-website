import { useEffect } from 'react';
import { useConsultantStore } from '../store/consultantStore';
import { useLocationStore } from '../store/locationStore';
import { consultantsApi } from '../services/api';
import { CONSULTANT_SEARCH_RADIUS } from '../constants/config';

export const useConsultants = () => {
  const { userLocation } = useLocationStore();
  const {
    consultants,
    selectedConsultant,
    isLoading,
    error,
    setConsultants,
    setSelectedConsultant,
    setLoading,
    setError,
  } = useConsultantStore();

  useEffect(() => {
    if (userLocation) {
      fetchNearbyConsultants();
    }
  }, [userLocation]);

  const fetchNearbyConsultants = async () => {
    if (!userLocation) return;

    setLoading(true);
    setError(null);

    try {
      const data = await consultantsApi.getNearby({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radius: CONSULTANT_SEARCH_RADIUS,
      });

      setConsultants(data);
    } catch (error: any) {
      console.error('Error fetching consultants:', error);
      setError(error.message || 'Failed to fetch consultants');
    } finally {
      setLoading(false);
    }
  };

  return {
    consultants,
    selectedConsultant,
    isLoading,
    error,
    setSelectedConsultant,
    refetch: fetchNearbyConsultants,
  };
};
