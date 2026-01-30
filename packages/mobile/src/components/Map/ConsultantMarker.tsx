import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { ConsultantWithDistance } from '@ma-consultant/shared';
import { Colors, BorderRadius } from '../../constants';

interface ConsultantMarkerProps {
  consultant: ConsultantWithDistance;
  onPress: () => void;
}

export const ConsultantMarker: React.FC<ConsultantMarkerProps> = ({
  consultant,
  onPress,
}) => {
  if (!consultant.currentLocation) return null;

  const getStatusColor = () => {
    switch (consultant.availability) {
      case 'available':
        return Colors.success;
      case 'busy':
        return Colors.warning;
      case 'offline':
        return Colors.text.secondary;
      default:
        return Colors.text.secondary;
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: consultant.currentLocation.latitude,
        longitude: consultant.currentLocation.longitude,
      }}
      onPress={onPress}
    >
      <View style={styles.markerContainer}>
        <View style={[styles.marker, { borderColor: getStatusColor() }]}>
          <Text style={styles.markerText}>
            {consultant.user.firstName[0]}
            {consultant.user.lastName[0]}
          </Text>
        </View>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.white,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});
