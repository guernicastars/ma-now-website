import { getConsultants, updateConsultantLocation } from '../database/db';
import { getIO } from '../websocket/socketServer';
import { Consultant, ConsultantLocationUpdate } from '@ma-consultant/shared';

const UPDATE_INTERVAL = 10000; // 10 seconds
const MIN_MOVEMENT_KM = 0.1; // 100 meters
const MAX_MOVEMENT_KM = 0.5; // 500 meters

// City boundaries to keep consultants within realistic areas
const cityBoundaries: { [key: string]: { minLat: number; maxLat: number; minLng: number; maxLng: number } } = {
  'new-york': { minLat: 40.6, maxLat: 40.9, minLng: -74.1, maxLng: -73.8 },
  'san-francisco': { minLat: 37.7, maxLat: 37.85, minLng: -122.55, maxLng: -122.35 },
  'boston': { minLat: 42.25, maxLat: 42.45, minLng: -71.2, maxLng: -70.95 },
  'chicago': { minLat: 41.75, maxLat: 42.05, minLng: -87.8, maxLng: -87.5 },
  'los-angeles': { minLat: 33.95, maxLat: 34.15, minLng: -118.4, maxLng: -118.15 },
  'seattle': { minLat: 47.5, maxLat: 47.75, minLng: -122.45, maxLng: -122.25 }
};

export class LocationSimulatorService {
  private intervalId?: NodeJS.Timeout;
  private isRunning = false;

  /**
   * Start the location simulator
   */
  start(): void {
    if (this.isRunning) {
      console.log('Location simulator is already running');
      return;
    }

    console.log('🚀 Starting location simulator...');
    this.isRunning = true;

    // Run immediately, then at intervals
    this.simulateMovement();

    this.intervalId = setInterval(() => {
      this.simulateMovement();
    }, UPDATE_INTERVAL);

    console.log(`✅ Location simulator started (updates every ${UPDATE_INTERVAL / 1000}s)`);
  }

  /**
   * Stop the location simulator
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping location simulator...');
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isRunning = false;
    console.log('✅ Location simulator stopped');
  }

  /**
   * Simulate movement for all consultants
   */
  private simulateMovement(): void {
    const consultants = getConsultants().value();

    consultants.forEach((consultant: Consultant) => {
      if (consultant.availability === 'available' && consultant.currentLocation) {
        const newLocation = this.calculateNewLocation(consultant.currentLocation);

        // Update in database
        updateConsultantLocation(consultant.id, newLocation);

        // Broadcast via WebSocket
        this.broadcastLocationUpdate({
          consultantId: consultant.id,
          location: {
            ...newLocation,
            timestamp: new Date().toISOString()
          },
          availability: consultant.availability
        });
      }
    });
  }

  /**
   * Calculate new location using random walk algorithm
   */
  private calculateNewLocation(currentLocation: { latitude: number; longitude: number }): { latitude: number; longitude: number } {
    // Random distance between MIN and MAX
    const distanceKm = MIN_MOVEMENT_KM + Math.random() * (MAX_MOVEMENT_KM - MIN_MOVEMENT_KM);

    // Random direction (0-360 degrees)
    const bearing = Math.random() * 360;

    // Convert to radians
    const lat1 = this.toRadians(currentLocation.latitude);
    const lng1 = this.toRadians(currentLocation.longitude);
    const bearingRad = this.toRadians(bearing);

    // Earth's radius in km
    const R = 6371;
    const angularDistance = distanceKm / R;

    // Calculate new position
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad)
    );

    const lng2 = lng1 + Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

    let newLat = this.toDegrees(lat2);
    let newLng = this.toDegrees(lng2);

    // Apply boundaries to keep consultants in realistic areas
    newLat = this.clamp(newLat, currentLocation.latitude - 0.05, currentLocation.latitude + 0.05);
    newLng = this.clamp(newLng, currentLocation.longitude - 0.05, currentLocation.longitude + 0.05);

    return {
      latitude: parseFloat(newLat.toFixed(6)),
      longitude: parseFloat(newLng.toFixed(6))
    };
  }

  /**
   * Broadcast location update via WebSocket
   */
  private broadcastLocationUpdate(update: ConsultantLocationUpdate): void {
    try {
      const io = getIO();
      io.emit('consultant:location', update);
    } catch (error) {
      // Socket.io not initialized yet, skip broadcast
    }
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  private toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Clamp a value between min and max
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

// Export singleton instance
export const locationSimulator = new LocationSimulatorService();
