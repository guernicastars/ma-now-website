import { z } from 'zod';

// ============ AUTH SCHEMAS ============

export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(1, 'Email is required')
    .max(255, 'Email too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long'),
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  phoneNumber: z
    .string()
    .regex(/^[+]?[\d\s()-]+$/, 'Invalid phone number format')
    .optional(),
  role: z.enum(['client', 'consultant', 'admin']).optional().default('client'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

// ============ BOOKING SCHEMAS ============

export const negotiationTypeSchema = z.enum([
  'selling-business',
  'buying-business',
  'buying-asset',
  'selling-asset',
  'other',
]);

export const locationTypeSchema = z.enum(['onsite', 'virtual']);

export const bookingDurationSchema = z.union([z.literal(2), z.literal(3)]);

export const addressSchema = z.object({
  street: z.string().max(255).optional(),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  zipCode: z.string().max(20).optional(),
  country: z.string().min(1, 'Country is required').max(100),
});

export const locationWithAddressSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: addressSchema,
});

export const ndaDetailsSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name too long'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name too long'),
  email: z.string().email('Invalid email format'),
});

export const createBookingSchema = z.object({
  consultantId: z.string().uuid('Invalid consultant ID'),
  negotiationType: negotiationTypeSchema,
  locationType: locationTypeSchema,
  startDate: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) && parsed > new Date();
  }, 'Start date must be a valid future date'),
  duration: bookingDurationSchema,
  location: locationWithAddressSchema.optional(),
  ndaDetails: ndaDetailsSchema,
  notes: z.string().max(1000, 'Notes too long').optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
});

// ============ CONSULTANT SCHEMAS ============

export const nearbyConsultantsQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(1).max(500).optional().default(50),
  specialization: z
    .enum([
      'mergers-acquisitions',
      'business-valuation',
      'due-diligence',
      'negotiation',
      'legal-structuring',
      'financial-analysis',
      'post-merger-integration',
      'asset-sales',
    ])
    .optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  maxHourlyRate: z.coerce.number().min(0).optional(),
  availability: z.enum(['available', 'busy', 'offline']).optional(),
});

export const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

// ============ PARAM SCHEMAS ============

export const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type NearbyConsultantsQuery = z.infer<typeof nearbyConsultantsQuerySchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
