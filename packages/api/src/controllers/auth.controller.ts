import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    // Validation is done by middleware - req.body is already validated
    const result = await AuthService.register(req.body);

    res.status(201).json({
      success: true,
      data: result,
    });
  });

  /**
   * POST /api/auth/login
   * Login user and return JWT token
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * GET /api/auth/me
   * Get current authenticated user
   */
  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    // User is attached by auth middleware
    res.json({
      success: true,
      data: req.user,
    });
  });
}
