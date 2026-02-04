import {
  Consultant,
  ConsultantWithUser,
  ConsultantWithDistance,
  NearbyConsultantsQuery,
  Location,
} from '@ma-consultant/shared';
import * as db from '../database';
import { haversineDistance } from '../utils/distance';

export class ConsultantService {
  static async getNearbyConsultants(
    query: NearbyConsultantsQuery
  ): Promise<ConsultantWithDistance[]> {
    const {
      lat,
      lng,
      radius = 50, // Default 50km radius
      specialization,
      minRating,
      maxHourlyRate,
      availability,
    } = query;

    // Use PostgreSQL's built-in distance calculation if available
    const dbType = db.getDatabaseType();

    if (dbType === 'postgresql') {
      const consultants = await db.findNearbyConsultants(lat, lng, radius, {
        specialization,
        minRating,
        maxHourlyRate,
        availability,
      });

      // Add distance to results
      return consultants.map((c) => ({
        ...c,
        distance: c.currentLocation
          ? haversineDistance(
              lat,
              lng,
              c.currentLocation.latitude,
              c.currentLocation.longitude
            )
          : 0,
      }));
    }

    // Fallback for LowDB - filter in memory
    let consultants = await db.getAllConsultants();

    // Filter by availability if specified
    if (availability) {
      consultants = consultants.filter((c) => c.availability === availability);
    }

    // Filter by specialization if specified
    if (specialization) {
      consultants = consultants.filter((c) =>
        c.specializations.includes(specialization as any)
      );
    }

    // Filter by rating if specified
    if (minRating) {
      consultants = consultants.filter((c) => c.rating >= minRating);
    }

    // Filter by hourly rate if specified
    if (maxHourlyRate) {
      consultants = consultants.filter((c) => c.hourlyRate <= maxHourlyRate);
    }

    // Calculate distances and filter by radius
    const consultantsWithDistance: ConsultantWithDistance[] = [];

    for (const consultant of consultants) {
      if (!consultant.currentLocation) continue;

      const distance = haversineDistance(
        lat,
        lng,
        consultant.currentLocation.latitude,
        consultant.currentLocation.longitude
      );

      if (distance <= radius) {
        const user = await db.findUserById(consultant.userId);
        if (user) {
          consultantsWithDistance.push({
            ...consultant,
            user,
            distance,
          });
        }
      }
    }

    // Sort by distance
    consultantsWithDistance.sort((a, b) => a.distance - b.distance);

    return consultantsWithDistance;
  }

  static async getConsultantById(id: string): Promise<ConsultantWithUser | null> {
    const consultant = await db.findConsultantById(id);
    if (!consultant) {
      return null;
    }

    const user = await db.findUserById(consultant.userId);
    if (!user) {
      return null;
    }

    return {
      ...consultant,
      user,
    };
  }

  static async updateLocation(
    consultantId: string,
    location: Location
  ): Promise<void> {
    const consultant = await db.findConsultantById(consultantId);
    if (!consultant) {
      throw new Error('Consultant not found');
    }

    await db.updateConsultantLocation(consultantId, {
      latitude: location.latitude,
      longitude: location.longitude,
    });

    // Log location update event
    await db.logEvent('consultant.location_updated', 'consultant', consultantId, undefined, {
      latitude: location.latitude,
      longitude: location.longitude,
    });
  }

  static async getAllConsultants(): Promise<ConsultantWithUser[]> {
    const consultants = await db.getAllConsultants();
    const consultantsWithUser: ConsultantWithUser[] = [];

    for (const consultant of consultants) {
      const user = await db.findUserById(consultant.userId);
      if (user) {
        consultantsWithUser.push({
          ...consultant,
          user,
        });
      }
    }

    return consultantsWithUser;
  }
}
