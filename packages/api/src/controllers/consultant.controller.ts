import { Request, Response } from 'express';
import { ConsultantService } from '../services/consultant.service';
import { NearbyConsultantsQuery } from '@ma-consultant/shared';
import { asyncHandler, NotFoundError, ForbiddenError } from '../middleware';

export class ConsultantController {
  /**
   * GET /api/consultants/nearby
   * Get nearby consultants based on location and filters
   */
  static getNearbyConsultants = asyncHandler(async (req: Request, res: Response) => {
    // Validation is done by middleware - query params are already validated
    const { lat, lng, radius, specialization, minRating, maxHourlyRate, availability } = req.query;

    const query: NearbyConsultantsQuery = {
      lat: parseFloat(lat as string),
      lng: parseFloat(lng as string),
      radius: radius ? parseInt(String(radius)) : undefined,
      specialization: specialization as any,
      minRating: minRating ? parseFloat(String(minRating)) : undefined,
      maxHourlyRate: maxHourlyRate ? parseInt(String(maxHourlyRate)) : undefined,
      availability: availability as any,
    };

    const consultants = await ConsultantService.getNearbyConsultants(query);

    res.json({
      success: true,
      data: consultants,
      count: consultants.length,
    });
  });

  /**
   * GET /api/consultants/:id
   * Get a specific consultant by ID
   */
  static getConsultantById = asyncHandler(async (req: Request, res: Response) => {
    const consultant = await ConsultantService.getConsultantById(req.params.id);

    if (!consultant) {
      throw NotFoundError('Consultant not found');
    }

    res.json({
      success: true,
      data: consultant,
    });
  });

  /**
   * POST /api/consultants/:id/location
   * Update consultant location (protected - consultants only)
   */
  static updateLocation = asyncHandler(async (req: Request, res: Response) => {
    // Validation is done by middleware - body is already validated
    const { latitude, longitude } = req.body;

    // Verify user is the consultant
    if (req.user?.role !== 'consultant') {
      throw ForbiddenError('Only consultants can update their location');
    }

    await ConsultantService.updateLocation(req.params.id, {
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Location updated successfully',
    });
  });

  /**
   * GET /api/consultants
   * Get all consultants (admin/internal use)
   */
  static getAllConsultants = asyncHandler(async (req: Request, res: Response) => {
    const consultants = await ConsultantService.getAllConsultants();

    res.json({
      success: true,
      data: consultants,
      count: consultants.length,
    });
  });
}
