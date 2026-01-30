import { Request, Response } from 'express';
import { ConsultantService } from '../services/consultant.service';
import { NearbyConsultantsQuery } from '@ma-consultant/shared';

export class ConsultantController {
  static async getNearbyConsultants(req: Request, res: Response) {
    try {
      const { lat, lng, radius, specialization, minRating, maxHourlyRate, availability } = req.query;

      // Validate required parameters
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required'
        });
      }

      const query: NearbyConsultantsQuery = {
        lat: parseFloat(lat as string),
        lng: parseFloat(lng as string),
        radius: radius ? parseInt(String(radius)) : undefined,
        specialization: specialization as any,
        minRating: minRating ? parseFloat(String(minRating)) : undefined,
        maxHourlyRate: maxHourlyRate ? parseInt(String(maxHourlyRate)) : undefined,
        availability: availability as any
      };

      const consultants = await ConsultantService.getNearbyConsultants(query);

      res.json({
        success: true,
        data: consultants,
        count: consultants.length
      });
    } catch (error: any) {
      console.error('Get nearby consultants error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get consultants'
      });
    }
  }

  static async getConsultantById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const consultant = await ConsultantService.getConsultantById(String(id));

      if (!consultant) {
        return res.status(404).json({
          success: false,
          error: 'Consultant not found'
        });
      }

      res.json({
        success: true,
        data: consultant
      });
    } catch (error: any) {
      console.error('Get consultant error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get consultant'
      });
    }
  }

  static async updateLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required'
        });
      }

      // Verify user is the consultant
      if (req.user?.role !== 'consultant') {
        return res.status(403).json({
          success: false,
          error: 'Only consultants can update their location'
        });
      }

      await ConsultantService.updateLocation(String(id), {
        latitude,
        longitude,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        message: 'Location updated successfully'
      });
    } catch (error: any) {
      console.error('Update location error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update location'
      });
    }
  }

  static async getAllConsultants(req: Request, res: Response) {
    try {
      const consultants = await ConsultantService.getAllConsultants();

      res.json({
        success: true,
        data: consultants,
        count: consultants.length
      });
    } catch (error: any) {
      console.error('Get all consultants error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get consultants'
      });
    }
  }
}
