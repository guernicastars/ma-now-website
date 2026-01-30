import {
  Consultant,
  ConsultantWithUser,
  ConsultantWithDistance,
  NearbyConsultantsQuery,
  Location
} from '@ma-consultant/shared';
import {
  getConsultants,
  findConsultantById,
  findUserById,
  updateConsultantLocation
} from '../database/db';
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
      availability
    } = query;

    let consultants = getConsultants().value();

    // Filter by availability if specified
    if (availability) {
      consultants = consultants.filter((c: Consultant) => c.availability === availability);
    }

    // Filter by specialization if specified
    if (specialization) {
      consultants = consultants.filter((c: Consultant) =>
        c.specializations.includes(specialization)
      );
    }

    // Filter by rating if specified
    if (minRating) {
      consultants = consultants.filter((c: Consultant) => c.rating >= minRating);
    }

    // Filter by hourly rate if specified
    if (maxHourlyRate) {
      consultants = consultants.filter((c: Consultant) => c.hourlyRate <= maxHourlyRate);
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
        const user = findUserById(consultant.userId);
        if (user) {
          consultantsWithDistance.push({
            ...consultant,
            user,
            distance
          });
        }
      }
    }

    // Sort by distance
    consultantsWithDistance.sort((a, b) => a.distance - b.distance);

    return consultantsWithDistance;
  }

  static async getConsultantById(id: string): Promise<ConsultantWithUser | null> {
    const consultant = findConsultantById(id);
    if (!consultant) {
      return null;
    }

    const user = findUserById(consultant.userId);
    if (!user) {
      return null;
    }

    return {
      ...consultant,
      user
    };
  }

  static async updateLocation(
    consultantId: string,
    location: Location
  ): Promise<void> {
    const consultant = findConsultantById(consultantId);
    if (!consultant) {
      throw new Error('Consultant not found');
    }

    updateConsultantLocation(consultantId, {
      latitude: location.latitude,
      longitude: location.longitude
    });
  }

  static async getAllConsultants(): Promise<ConsultantWithUser[]> {
    const consultants = getConsultants().value();
    const consultantsWithUser: ConsultantWithUser[] = [];

    for (const consultant of consultants) {
      const user = findUserById(consultant.userId);
      if (user) {
        consultantsWithUser.push({
          ...consultant,
          user
        });
      }
    }

    return consultantsWithUser;
  }
}
