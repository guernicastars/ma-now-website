import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User, RegisterUserData, AuthResponse } from '@ma-consultant/shared';
import {
  findUserByEmail,
  findUserById,
  createUser
} from '../database/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  static async register(data: RegisterUserData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user: User = {
      id: uuidv4(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phoneNumber,
      role: data.role || 'client',
      createdAt: new Date().toISOString()
    };

    createUser(user);

    // Store password separately (in real app, would be in users table)
    // For this mock, we'll just generate a token
    const token = this.generateToken(user.id);

    return {
      user,
      token
    };
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // In a real app, we'd verify the password here
    // For this mock, we'll accept any password for seeded users
    // In production, you'd do: const isValid = await bcrypt.compare(password, user.password);

    const token = this.generateToken(user.id);

    return {
      user,
      token
    };
  }

  static async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = findUserById(decoded.userId);

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
    const user = findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
