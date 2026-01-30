// API Configuration
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';

export const SOCKET_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://your-production-api.com';

export const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_stripe_key';

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
