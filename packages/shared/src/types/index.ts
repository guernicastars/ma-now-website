// ============ USER TYPES ============
// Updated to match manow backend

export interface User {
  id: string;
  email: string;
  name: string;
  timezone?: string;
  emailVerified?: boolean;
  avatarUrl?: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData {
  email: string;
  name: string;
  password: string;
  timezone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============ MEETING TYPE TYPES ============
// From manow backend

export interface MeetingType {
  id: string;
  name: string;
  slug: string;
  durationMinutes: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  locationText?: string;
  requiresNda: boolean;
  ndaTemplateId?: string;
  isActive: boolean;
  userId: string;
}

export interface MeetingTypePublic {
  id: string;
  name: string;
  slug: string;
  durationMinutes: number;
  locationText?: string;
  requiresNda: boolean;
  hostName: string;
  hostTimezone?: string;
}

export interface CreateMeetingTypeData {
  name: string;
  slug: string;
  durationMinutes: number;
  bufferBeforeMinutes?: number;
  bufferAfterMinutes?: number;
  locationText?: string;
  requiresNda?: boolean;
  ndaTemplateId?: string;
}

// ============ AVAILABILITY TYPES ============

export interface AvailabilityRule {
  id: string;
  meetingTypeId?: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  effectiveFrom?: string;
  effectiveUntil?: string;
  isActive: boolean;
}

export interface BlackoutDate {
  id: string;
  blackoutDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  reason?: string;
  isRecurringYearly: boolean;
}

export interface TimeSlot {
  start: string; // ISO datetime
  end: string; // ISO datetime
}

// ============ SLOT HOLD TYPES ============

export type HoldStatus = 'active' | 'converted' | 'expired' | 'released';

export interface SlotHold {
  id: string;
  meetingTypeId: string;
  slotStart: string;
  slotEnd: string;
  heldByEmail: string;
  status: HoldStatus;
  expiresAt: string;
}

export interface CreateHoldData {
  slotStart: string;
  slotEnd: string;
  email: string;
  name?: string;
  idempotencyKey: string;
}

// ============ BOOKING TYPES ============

export type BookingStatus = 'confirmed' | 'canceled' | 'completed' | 'no_show';

export interface Booking {
  id: string;
  meetingTypeId: string;
  hostUserId: string;
  slotStart: string;
  slotEnd: string;
  guestEmail: string;
  guestName: string;
  guestTimezone?: string;
  guestNotes?: string;
  status: BookingStatus;
  ndaDocumentId?: string;
  ndaSignedAt?: string;
  createdAt: string;
}

export interface BookingWithMeetingType extends Booking {
  meetingType: MeetingType;
}

export interface ConfirmBookingData {
  holdId: string;
  guestName: string;
  guestTimezone: string;
  guestNotes?: string;
  idempotencyKey: string;
}

// ============ NDA/DOCUMENT TYPES ============

export type DocumentStatus = 'pending' | 'sent' | 'signed' | 'expired' | 'revoked';

export interface NDADocument {
  id: string;
  holdId?: string;
  bookingId?: string;
  status: DocumentStatus;
  storageUrl?: string;
  signerEmail: string;
  externalEnvelopeId?: string;
  sentAt?: string;
  signedAt?: string;
}

export interface CreateNDAData {
  holdId: string;
  signerEmail: string;
  signerName: string;
}

// ============ LOCATION TYPES ============
// For map features

export interface Location {
  latitude: number;
  longitude: number;
  timestamp?: string;
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
}

export interface LocationWithAddress extends Location {
  address: Address;
}

// ============ CONSULTANT TYPES ============
// Extended types for M&A consultant marketplace features

export type ConsultantAvailability = 'available' | 'busy' | 'offline';

export type Specialization =
  | 'mergers-acquisitions'
  | 'business-valuation'
  | 'due-diligence'
  | 'negotiation'
  | 'legal-structuring'
  | 'financial-analysis'
  | 'post-merger-integration'
  | 'asset-sales';

export interface ConsultantProfile {
  id: string;
  userId: string;
  bio: string;
  hourlyRate: number;
  specializations: Specialization[];
  rating: number;
  totalReviews: number;
  yearsOfExperience: number;
  availability: ConsultantAvailability;
  currentLocation?: Location;
  profileImageUrl?: string;
}

export interface ConsultantWithUser extends ConsultantProfile {
  user: User;
}

export interface ConsultantWithDistance extends ConsultantWithUser {
  distance: number;
}

// ============ PAYMENT TYPES ============
// PayPal integration (replacing Stripe)

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paypalOrderId?: string;
  createdAt: string;
  paidAt?: string;
}

// ============ API RESPONSE TYPES ============

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============ REAL-TIME TYPES ============
// SSE events from manow

export interface SlotHeldEvent {
  meetingTypeId: string;
  slotStart: string;
  slotEnd: string;
}

export interface SlotReleasedEvent {
  meetingTypeId: string;
  slotStart: string;
  slotEnd: string;
}

export interface BookingConfirmedEvent {
  bookingId: string;
  meetingTypeId: string;
  slotStart: string;
  slotEnd: string;
}

// ============ QUERY TYPES ============

export interface GetSlotsQuery {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  timezone: string;
}

export interface GetBookingsQuery {
  status?: BookingStatus;
  limit?: number;
  offset?: number;
}

export interface NearbyConsultantsQuery {
  lat: number;
  lng: number;
  radius?: number;
  specialization?: Specialization;
  minRating?: number;
  maxHourlyRate?: number;
  availability?: ConsultantAvailability;
}

// ============ UTILITY TYPES ============

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
