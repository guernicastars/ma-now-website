// API Configuration - Using manow backend
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.manow.app/api'; // TODO: Update with production URL

// SSE endpoint for real-time updates (manow uses SSE instead of WebSockets)
export const SSE_BASE_URL = __DEV__
  ? 'http://localhost:3000/api/realtime'
  : 'https://api.manow.app/api/realtime';

// PayPal Configuration (replacing Stripe)
export const PAYPAL_CLIENT_ID = __DEV__
  ? 'sandbox_client_id' // TODO: Add sandbox client ID
  : 'production_client_id'; // TODO: Add production client ID

// Map Configuration
export const DEFAULT_REGION = {
  latitude: 40.7128,
  longitude: -74.0060,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const CONSULTANT_SEARCH_RADIUS = 50; // km

// App Configuration
export const APP_NAME = 'M&A Consultant';
export const SUPPORT_EMAIL = 'support@maconsultant.com';
