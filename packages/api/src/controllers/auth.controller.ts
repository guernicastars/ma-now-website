import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterUserData, UserCredentials } from '@ma-consultant/shared';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const data: RegisterUserData = req.body;

      // Basic validation
      if (!data.email || !data.password || !data.firstName || !data.lastName) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const result = await AuthService.register(data);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Register error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Registration failed'
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password }: UserCredentials = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }

      const result = await AuthService.login(email, password);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: error.message || 'Login failed'
      });
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }

      res.json({
        success: true,
        data: req.user
      });
    } catch (error: any) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user'
      });
    }
  }
}
