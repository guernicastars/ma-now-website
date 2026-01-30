// User Types
export type UserRole = 'client' | 'consultant' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  createdAt: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface RegisterUserData extends UserCredentials {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Location Types
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

// Consultant Types
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

export interface Consultant {
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

export interface ConsultantWithUser extends Consultant {
  user: User;
}

export interface ConsultantWithDistance extends ConsultantWithUser {
  distance: number;
}

// Booking Types
export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type NegotiationType =
  | 'selling-business'
  | 'buying-business'
  | 'buying-asset'
  | 'selling-asset'
  | 'other';

export type LocationType = 'onsite' | 'virtual';

export type BookingDuration = 2 | 3;

export interface NDADetails {
  firstName: string;
  lastName: string;
  email: string;
  signedAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  consultantId: string;
  status: BookingStatus;
  negotiationType: NegotiationType;
  locationType: LocationType;
  startDate: string;
  duration: BookingDuration;
  location?: LocationWithAddress;
  ndaDetails: NDADetails;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithDetails extends Booking {
  client: User;
  consultant: ConsultantWithUser;
}

export interface CreateBookingData {
  consultantId: string;
  negotiationType: NegotiationType;
  locationType: LocationType;
  startDate: string;
  duration: BookingDuration;
  location?: LocationWithAddress;
  ndaDetails: Omit<NDADetails, 'signedAt'>;
  notes?: string;
}

// Payment Types
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'card' | 'bank_transfer' | 'other';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  paidAt?: string;
}

export interface CreatePaymentIntentData {
  bookingId: string;
  amount: number;
  currency?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
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

// WebSocket Event Types
export interface WebSocketMessage<T = any> {
  event: string;
  data: T;
}

export interface ConsultantLocationUpdate {
  consultantId: string;
  location: Location;
  availability: ConsultantAvailability;
}

export interface SubscribeToAreaData {
  latitude: number;
  longitude: number;
  radius: number;
}

// Query Parameters
export interface NearbyConsultantsQuery {
  lat: number;
  lng: number;
  radius?: number;
  specialization?: Specialization;
  minRating?: number;
  maxHourlyRate?: number;
  availability?: ConsultantAvailability;
}

export interface BookingsQuery {
  status?: BookingStatus;
  page?: number;
  limit?: number;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
