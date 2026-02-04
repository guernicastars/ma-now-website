/**
 * Database Interface
 *
 * Provides a unified interface that supports both:
 * - PostgreSQL (production) - when DATABASE_URL is set
 * - LowDB (development fallback) - when DATABASE_URL is not set
 *
 * Usage:
 *   import * as db from './database';
 *   const user = await db.findUserByEmail('test@test.com');
 */

import {
  User,
  Consultant,
  Booking,
  Payment,
  BookingStatus,
  PaymentStatus,
  ConsultantWithUser,
} from '@ma-consultant/shared';

// Determine which database to use
const usePostgres = !!process.env.DATABASE_URL;

// Import the appropriate module
let postgres: typeof import('./postgres') | null = null;
let lowdb: typeof import('./db') | null = null;

if (usePostgres) {
  postgres = require('./postgres');
  console.log('📦 Using PostgreSQL database');
} else {
  lowdb = require('./db');
  console.log('📦 Using LowDB (file-based) database - set DATABASE_URL for PostgreSQL');
}

// ============ USER OPERATIONS ============

export const findUserByEmail = async (
  email: string
): Promise<(User & { passwordHash?: string }) | null> => {
  if (postgres) {
    return postgres.findUserByEmail(email);
  }
  const user = lowdb!.findUserByEmail(email);
  return user || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  if (postgres) {
    return postgres.findUserById(id);
  }
  const user = lowdb!.findUserById(id);
  return user || null;
};

export const createUser = async (
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string,
  phoneNumber?: string,
  role: string = 'client'
): Promise<User> => {
  if (postgres) {
    return postgres.createUser(email, passwordHash, firstName, lastName, phoneNumber, role);
  }

  // LowDB version - need to create user object
  const { v4: uuidv4 } = require('uuid');
  const user: User & { passwordHash: string } = {
    id: uuidv4(),
    email,
    passwordHash,
    firstName,
    lastName,
    phoneNumber,
    role: role as User['role'],
    createdAt: new Date().toISOString(),
  } as any;
  lowdb!.createUser(user as any);
  return user;
};

// ============ CONSULTANT OPERATIONS ============

export const findConsultantById = async (id: string): Promise<Consultant | null> => {
  if (postgres) {
    return postgres.findConsultantById(id);
  }
  const consultant = lowdb!.findConsultantById(id);
  return consultant || null;
};

export const findConsultantByUserId = async (userId: string): Promise<Consultant | null> => {
  if (postgres) {
    return postgres.findConsultantByUserId(userId);
  }
  const consultant = lowdb!.findConsultantByUserId(userId);
  return consultant || null;
};

export const updateConsultantLocation = async (
  consultantId: string,
  location: { latitude: number; longitude: number }
): Promise<void> => {
  if (postgres) {
    return postgres.updateConsultantLocation(consultantId, location);
  }
  lowdb!.updateConsultantLocation(consultantId, location);
};

export const getAllConsultants = async (): Promise<Consultant[]> => {
  if (postgres) {
    return postgres.getAllConsultants();
  }
  return lowdb!.getConsultants().value() || [];
};

export const findNearbyConsultants = async (
  latitude: number,
  longitude: number,
  radiusKm?: number,
  filters?: {
    specialization?: string;
    minRating?: number;
    maxHourlyRate?: number;
    availability?: string;
  }
): Promise<ConsultantWithUser[]> => {
  if (postgres) {
    return postgres.findNearbyConsultants(latitude, longitude, radiusKm, filters);
  }

  // LowDB version - simple implementation without distance calculation
  const consultants = lowdb!.getConsultants().value() || [];
  const users = lowdb!.getUsers().value() || [];

  return consultants
    .filter((c: Consultant) => c.availability !== 'offline')
    .map((c: Consultant) => ({
      ...c,
      user: users.find((u: User) => u.id === c.userId)!,
    }))
    .filter((c: ConsultantWithUser) => c.user);
};

// ============ BOOKING OPERATIONS ============

export const createBooking = async (
  booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Booking> => {
  if (postgres) {
    return postgres.createBooking(booking);
  }

  const { v4: uuidv4 } = require('uuid');
  const newBooking: Booking = {
    ...booking,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  lowdb!.createBooking(newBooking);
  return newBooking;
};

export const findBookingById = async (id: string): Promise<Booking | null> => {
  if (postgres) {
    return postgres.findBookingById(id);
  }
  const booking = lowdb!.findBookingById(id);
  return booking || null;
};

export const findBookingsByClientId = async (clientId: string): Promise<Booking[]> => {
  if (postgres) {
    return postgres.findBookingsByClientId(clientId);
  }
  return (
    lowdb!
      .getBookings()
      .filter((b: Booking) => b.clientId === clientId)
      .value() || []
  );
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
): Promise<void> => {
  if (postgres) {
    return postgres.updateBookingStatus(bookingId, status);
  }
  lowdb!.updateBookingStatus(bookingId, status);
};

// ============ PAYMENT OPERATIONS ============

export const createPayment = async (
  payment: Omit<Payment, 'id' | 'createdAt'>
): Promise<Payment> => {
  if (postgres) {
    return postgres.createPayment(payment);
  }

  const { v4: uuidv4 } = require('uuid');
  const newPayment: Payment = {
    ...payment,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  lowdb!.createPayment(newPayment);
  return newPayment;
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
  paidAt?: string
): Promise<void> => {
  if (postgres) {
    return postgres.updatePaymentStatus(paymentId, status, paidAt);
  }
  lowdb!.updatePaymentStatus(paymentId, status, paidAt);
};

// ============ SLOT HOLD OPERATIONS (PostgreSQL only) ============

export const createSlotHold = async (
  consultantId: string,
  date: string,
  userId: string,
  ttlMinutes?: number
): Promise<{ success: boolean; expiresAt?: string }> => {
  if (postgres) {
    return postgres.createSlotHold(consultantId, date, userId, ttlMinutes);
  }
  // LowDB doesn't support slot holds - always succeed (no concurrency protection)
  console.warn('⚠️ Slot holds not supported in LowDB mode');
  return { success: true };
};

export const releaseSlotHold = async (
  consultantId: string,
  date: string,
  userId: string
): Promise<void> => {
  if (postgres) {
    return postgres.releaseSlotHold(consultantId, date, userId);
  }
  // No-op for LowDB
};

export const cleanupExpiredHolds = async (): Promise<number> => {
  if (postgres) {
    return postgres.cleanupExpiredHolds();
  }
  return 0;
};

// ============ EVENT LOG OPERATIONS (PostgreSQL only) ============

export const logEvent = async (
  eventType: string,
  entityType: string,
  entityId: string,
  userId?: string,
  payload?: Record<string, any>
): Promise<void> => {
  if (postgres) {
    return postgres.logEvent(eventType, entityType, entityId, userId, payload);
  }
  // LowDB - just log to console
  console.log(`[EVENT] ${eventType} ${entityType}:${entityId}`, payload || '');
};

// ============ TRANSACTION SUPPORT (PostgreSQL only) ============

export const withTransaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  if (postgres) {
    return postgres.withTransaction(callback);
  }
  // LowDB doesn't support transactions - just run the callback
  return callback(null);
};

// ============ HEALTH CHECK ============

export const healthCheck = async (): Promise<{ ok: boolean; type: string }> => {
  if (postgres) {
    const ok = await postgres.healthCheck();
    return { ok, type: 'postgresql' };
  }
  return { ok: true, type: 'lowdb' };
};

// Export database type for checking
export const getDatabaseType = () => (usePostgres ? 'postgresql' : 'lowdb');
