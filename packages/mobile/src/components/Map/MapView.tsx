import React, { useRef, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { ConsultantWithDistance } from '@ma-consultant/shared';
import { ConsultantMarker } from './ConsultantMarker';
import { Colors, DEFAULT_REGION } from '../../constants';

interface MapViewComponentProps {
  userLocation: { latitude: number; longitude: number } | null;
  consultants: ConsultantWithDistance[];
  selectedConsultant: ConsultantWithDistance | null;
  onSelectConsultant: (consultant: ConsultantWithDistance) => void;
}

export const MapViewComponent: React.FC<MapViewComponentProps> = ({
  userLocation,
  consultants,
  selectedConsultant,
  onSelectConsultant,
}) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        },
        1000
      );
    }
  }, [userLocation]);

  useEffect(() => {
    if (selectedConsultant?.currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: selectedConsultant.currentLocation.latitude,
          longitude: selectedConsultant.currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  }, [selectedConsultant]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        loadingEnabled
      >
        {consultants.map((consultant) => (
          <ConsultantMarker
            key={consultant.id}
            consultant={consultant}
            onPress={() => onSelectConsultant(consultant)}
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
