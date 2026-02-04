import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, RegisterUserData, AuthResponse } from '@ma-consultant/shared';
import * as db from '../database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  static async register(data: RegisterUserData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await db.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await db.createUser(
      data.email,
      hashedPassword,
      data.firstName,
      data.lastName,
      data.phoneNumber,
      data.role || 'client'
    );

    // Log registration event
    await db.logEvent('user.registered', 'user', user.id, user.id, {
      email: user.email,
      role: user.role,
    });

    const token = this.generateToken(user.id);

    return {
      user,
      token,
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = await db.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    if (user.passwordHash) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }
    }

    // Log login event
    await db.logEvent('user.login', 'user', user.id, user.id);

    const token = this.generateToken(user.id);

    // Remove passwordHash from response
    const { passwordHash, ...userWithoutPassword } = user as any;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await db.findUserById(decoded.userId);

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
  }

  static async getCurrentUser(userId: string): Promise<User> {
    const user = await db.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
