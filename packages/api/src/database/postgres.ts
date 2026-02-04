import { Pool, PoolClient, QueryResult } from 'pg';
import {
  User,
  Consultant,
  Booking,
  Payment,
  BookingStatus,
  PaymentStatus,
  Location,
  ConsultantWithUser,
} from '@ma-consultant/shared';

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

// Helper to convert snake_case to camelCase
const toCamelCase = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const mapRowToObject = <T>(row: Record<string, any>): T => {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    result[toCamelCase(key)] = value;
  }
  return result as T;
};

// Transaction helper
export const withTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Query helper
export const query = async <T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> => {
  return pool.query(text, params);
};

// ============ USER OPERATIONS ============

export const findUserByEmail = async (email: string): Promise<(User & { passwordHash: string }) | null> => {
  const result = await query(
    'SELECT id, email, password_hash, first_name, last_name, phone_number, role, created_at FROM users WHERE email = $1',
    [email]
  );
  if (result.rows.length === 0) return null;
  return mapRowToObject(result.rows[0]);
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await query(
    'SELECT id, email, first_name, last_name, phone_number, role, created_at FROM users WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) return null;
  return mapRowToObject(result.rows[0]);
};

export const createUser = async (
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string,
  phoneNumber?: string,
  role: string = 'client'
): Promise<User> => {
  const result = await query(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone_number, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, email, first_name, last_name, phone_number, role, created_at`,
    [email, passwordHash, firstName, lastName, phoneNumber, role]
  );
  return mapRowToObject(result.rows[0]);
};

// ============ CONSULTANT OPERATIONS ============

export const findConsultantById = async (id: string): Promise<Consultant | null> => {
  const result = await query(
    `SELECT id, user_id, bio, hourly_rate, specializations, rating, total_reviews,
            years_of_experience, availability, current_latitude, current_longitude,
            location_updated_at, profile_image_url
     FROM consultants WHERE id = $1`,
    [id]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    ...mapRowToObject(row),
    currentLocation: row.current_latitude ? {
      latitude: parseFloat(row.current_latitude),
      longitude: parseFloat(row.current_longitude),
      timestamp: row.location_updated_at,
    } : undefined,
  } as Consultant;
};

export const findConsultantByUserId = async (userId: string): Promise<Consultant | null> => {
  const result = await query(
    `SELECT id, user_id, bio, hourly_rate, specializations, rating, total_reviews,
            years_of_experience, availability, current_latitude, current_longitude,
            location_updated_at, profile_image_url
     FROM consultants WHERE user_id = $1`,
    [userId]
  );
  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    ...mapRowToObject(row),
    currentLocation: row.current_latitude ? {
      latitude: parseFloat(row.current_latitude),
      longitude: parseFloat(row.current_longitude),
      timestamp: row.location_updated_at,
    } : undefined,
  } as Consultant;
};

export const findNearbyConsultants = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 50,
  filters?: {
    specialization?: string;
    minRating?: number;
    maxHourlyRate?: number;
    availability?: string;
  }
): Promise<ConsultantWithUser[]> => {
  let whereConditions = [`availability != 'offline'`];
  const params: any[] = [latitude, longitude, radiusKm];
  let paramIndex = 4;

  if (filters?.specialization) {
    whereConditions.push(`$${paramIndex} = ANY(specializations)`);
    params.push(filters.specialization);
    paramIndex++;
  }
  if (filters?.minRating) {
    whereConditions.push(`rating >= $${paramIndex}`);
    params.push(filters.minRating);
    paramIndex++;
  }
  if (filters?.maxHourlyRate) {
    whereConditions.push(`hourly_rate <= $${paramIndex}`);
    params.push(filters.maxHourlyRate);
    paramIndex++;
  }
  if (filters?.availability) {
    whereConditions.push(`availability = $${paramIndex}`);
    params.push(filters.availability);
    paramIndex++;
  }

  const result = await query(
    `SELECT c.*, u.email, u.first_name, u.last_name, u.phone_number, u.role,
            (6371 * acos(cos(radians($1)) * cos(radians(current_latitude))
            * cos(radians(current_longitude) - radians($2)) + sin(radians($1))
            * sin(radians(current_latitude)))) AS distance
     FROM consultants c
     JOIN users u ON c.user_id = u.id
     WHERE current_latitude IS NOT NULL
       AND ${whereConditions.join(' AND ')}
     HAVING (6371 * acos(cos(radians($1)) * cos(radians(current_latitude))
            * cos(radians(current_longitude) - radians($2)) + sin(radians($1))
            * sin(radians(current_latitude)))) < $3
     ORDER BY distance`,
    params
  );

  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    bio: row.bio,
    hourlyRate: parseFloat(row.hourly_rate),
    specializations: row.specializations,
    rating: parseFloat(row.rating),
    totalReviews: row.total_reviews,
    yearsOfExperience: row.years_of_experience,
    availability: row.availability,
    currentLocation: row.current_latitude ? {
      latitude: parseFloat(row.current_latitude),
      longitude: parseFloat(row.current_longitude),
      timestamp: row.location_updated_at,
    } : undefined,
    profileImageUrl: row.profile_image_url,
    user: {
      id: row.user_id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phoneNumber: row.phone_number,
      role: row.role,
      createdAt: row.created_at,
    },
  }));
};

export const updateConsultantLocation = async (
  consultantId: string,
  location: { latitude: number; longitude: number }
): Promise<void> => {
  await query(
    `UPDATE consultants
     SET current_latitude = $2, current_longitude = $3, location_updated_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [consultantId, location.latitude, location.longitude]
  );
};

export const getAllConsultants = async (): Promise<Consultant[]> => {
  const result = await query(
    `SELECT id, user_id, bio, hourly_rate, specializations, rating, total_reviews,
            years_of_experience, availability, current_latitude, current_longitude,
            location_updated_at, profile_image_url
     FROM consultants`
  );
  return result.rows.map((row) => ({
    ...mapRowToObject(row),
    currentLocation: row.current_latitude ? {
      latitude: parseFloat(row.current_latitude),
      longitude: parseFloat(row.current_longitude),
      timestamp: row.location_updated_at,
    } : undefined,
  })) as Consultant[];
};

// ============ BOOKING OPERATIONS ============

export const createBooking = async (
  booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>,
  client?: PoolClient
): Promise<Booking> => {
  const queryFn = client ? client.query.bind(client) : query;

  const result = await queryFn(
    `INSERT INTO bookings (
      client_id, consultant_id, status, negotiation_type, location_type,
      start_date, duration, location_latitude, location_longitude,
      location_street, location_city, location_state, location_zip_code, location_country,
      nda_first_name, nda_last_name, nda_email, nda_signed_at, total_amount, notes
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
    RETURNING *`,
    [
      booking.clientId,
      booking.consultantId,
      booking.status,
      booking.negotiationType,
      booking.locationType,
      booking.startDate,
      booking.duration,
      booking.location?.latitude,
      booking.location?.longitude,
      booking.location?.address?.street,
      booking.location?.address?.city,
      booking.location?.address?.state,
      booking.location?.address?.zipCode,
      booking.location?.address?.country,
      booking.ndaDetails.firstName,
      booking.ndaDetails.lastName,
      booking.ndaDetails.email,
      booking.ndaDetails.signedAt,
      booking.totalAmount,
      booking.notes,
    ]
  );

  return mapBookingRow(result.rows[0]);
};

export const findBookingById = async (id: string): Promise<Booking | null> => {
  const result = await query('SELECT * FROM bookings WHERE id = $1', [id]);
  if (result.rows.length === 0) return null;
  return mapBookingRow(result.rows[0]);
};

export const findBookingsByClientId = async (clientId: string): Promise<Booking[]> => {
  const result = await query(
    'SELECT * FROM bookings WHERE client_id = $1 ORDER BY created_at DESC',
    [clientId]
  );
  return result.rows.map(mapBookingRow);
};

export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
): Promise<void> => {
  await query(
    'UPDATE bookings SET status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
    [bookingId, status]
  );
};

const mapBookingRow = (row: any): Booking => ({
  id: row.id,
  clientId: row.client_id,
  consultantId: row.consultant_id,
  status: row.status,
  negotiationType: row.negotiation_type,
  locationType: row.location_type,
  startDate: row.start_date,
  duration: row.duration,
  location: row.location_latitude ? {
    latitude: parseFloat(row.location_latitude),
    longitude: parseFloat(row.location_longitude),
    address: {
      street: row.location_street,
      city: row.location_city,
      state: row.location_state,
      zipCode: row.location_zip_code,
      country: row.location_country,
    },
  } : undefined,
  ndaDetails: {
    firstName: row.nda_first_name,
    lastName: row.nda_last_name,
    email: row.nda_email,
    signedAt: row.nda_signed_at,
  },
  totalAmount: parseFloat(row.total_amount),
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ============ PAYMENT OPERATIONS ============

export const createPayment = async (payment: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> => {
  const result = await query(
    `INSERT INTO payments (booking_id, amount, currency, status, stripe_payment_intent_id, payment_method)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [payment.bookingId, payment.amount, payment.currency, payment.status, payment.stripePaymentIntentId, payment.paymentMethod]
  );
  return mapRowToObject(result.rows[0]);
};

export const updatePaymentStatus = async (
  paymentId: string,
  status: PaymentStatus,
  paidAt?: string
): Promise<void> => {
  if (paidAt) {
    await query(
      'UPDATE payments SET status = $2, paid_at = $3 WHERE id = $1',
      [paymentId, status, paidAt]
    );
  } else {
    await query('UPDATE payments SET status = $2 WHERE id = $1', [paymentId, status]);
  }
};

// ============ SLOT HOLD OPERATIONS ============

export const createSlotHold = async (
  consultantId: string,
  date: string,
  userId: string,
  ttlMinutes: number = 10
): Promise<{ success: boolean; expiresAt?: string }> => {
  try {
    const result = await query(
      `INSERT INTO slot_holds (consultant_id, held_date, user_id, expires_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP + INTERVAL '${ttlMinutes} minutes')
       ON CONFLICT (consultant_id, held_date) DO NOTHING
       RETURNING expires_at`,
      [consultantId, date, userId]
    );
    if (result.rows.length === 0) {
      return { success: false };
    }
    return { success: true, expiresAt: result.rows[0].expires_at };
  } catch (error) {
    return { success: false };
  }
};

export const releaseSlotHold = async (consultantId: string, date: string, userId: string): Promise<void> => {
  await query(
    'DELETE FROM slot_holds WHERE consultant_id = $1 AND held_date = $2 AND user_id = $3',
    [consultantId, date, userId]
  );
};

export const cleanupExpiredHolds = async (): Promise<number> => {
  const result = await query('DELETE FROM slot_holds WHERE expires_at < CURRENT_TIMESTAMP');
  return result.rowCount || 0;
};

// ============ EVENT LOG OPERATIONS ============

export const logEvent = async (
  eventType: string,
  entityType: string,
  entityId: string,
  userId?: string,
  payload?: Record<string, any>
): Promise<void> => {
  await query(
    `INSERT INTO event_log (event_type, entity_type, entity_id, user_id, payload)
     VALUES ($1, $2, $3, $4, $5)`,
    [eventType, entityType, entityId, userId, payload ? JSON.stringify(payload) : null]
  );
};

// ============ HEALTH CHECK ============

export const healthCheck = async (): Promise<boolean> => {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

// Export pool for advanced usage
export { pool };
