# M&A Consultant Mobile App

An Uber-like mobile application for booking M&A consultants with real-time location tracking, built with React Native + Expo and Express.js.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [WebSocket Events](#websocket-events)
- [Mobile App Guide](#mobile-app-guide)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Technology Stack](#technology-stack)

## 🎯 Overview

This is a full-stack mobile application MVP that allows clients to:
- View nearby M&A consultants on an interactive map
- See real-time consultant locations (simulated)
- Browse consultant profiles with ratings and specializations
- Book consultations through a 5-step booking flow
- Manage bookings with status tracking
- Receive real-time updates via WebSocket

**Current Status:** ✅ Phase 8 Complete (MVP ready for testing)

## 🏗 Architecture

### Monorepo Structure

```
ma-now-clone/
├── packages/
│   ├── shared/          # Shared TypeScript types
│   │   └── src/types/
│   ├── mobile/          # React Native + Expo app
│   │   ├── src/
│   │   │   ├── navigation/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── store/
│   │   │   ├── services/
│   │   │   ├── hooks/
│   │   │   └── constants/
│   │   └── app.json
│   └── api/             # Express.js API server
│       ├── src/
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── websocket/
│       │   ├── database/
│       │   └── scripts/
│       └── data/        # LowDB JSON database
└── package.json         # Root workspace config
```

### System Components

1. **Shared Package** - Common TypeScript types used by both mobile and API
2. **Mobile App** - React Native iOS app with Expo
3. **API Server** - Express.js REST API with WebSocket support
4. **Mock Database** - LowDB (JSON file-based) with seed data
5. **Location Simulator** - Simulates consultant movement in real-time

## 📦 Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **iOS Simulator** (Xcode) or physical iPhone
- **Git**

## 🚀 Installation

### 1. Clone and Install Dependencies

```bash
cd /Users/meuge/Coding/random/m\&a\ now\ clone/ma-now-clone

# Install all workspace dependencies
npm install

# Install mobile dependencies
cd packages/mobile
npm install

# Install API dependencies
cd ../api
npm install
```

### 2. Seed the Database

```bash
cd packages/api
npm run seed
```

This creates:
- 30 mock consultants across 6 US cities
- Test client account: `client@test.com` / `password123`
- Mock data in `packages/api/data/db.json`

### 3. Verify Installation

```bash
# Check that workspace links are working
npm run dev:api --workspace=@ma-consultant/api
# Should start API server on http://localhost:3000

# In another terminal
npm run start --workspace=@ma-consultant/mobile
# Should start Expo dev server
```

## 🎮 Running the Application

### Start API Server

```bash
cd packages/api
npm run dev
```

Expected output:
```
🚀 API Server running on http://localhost:3000
✅ Routes registered
✅ WebSocket server initialized
📡 Location simulator started
```

The API will:
- Listen on port 3000
- Accept HTTP REST requests
- Accept WebSocket connections
- Broadcast consultant location updates every 10 seconds

### Start Mobile App

In a separate terminal:

```bash
cd packages/mobile
npx expo start
```

Options:
- Press `i` for iOS Simulator
- Scan QR code with Expo Go app on physical iPhone
- Press `r` to reload app
- Press `m` to toggle menu

### Default Test Credentials

**Client Account:**
- Email: `client@test.com`
- Password: `password123`

## 📂 Project Structure

### Shared Package

```
packages/shared/src/types/index.ts
```

Exports all TypeScript interfaces:
- `User`, `AuthResponse`, `RegisterData`, `LoginData`
- `Consultant`, `ConsultantWithDetails`, `ConsultantAvailability`
- `Booking`, `BookingWithDetails`, `BookingStatus`, `NegotiationType`
- `Payment`, `PaymentStatus`
- `Location`, `SubscribeToAreaData`, `ConsultantLocationUpdate`

### Mobile App Structure

**Navigation:**
- `RootNavigator.tsx` - Main navigator with auth check
- `AuthStack.tsx` - Login/Register screens
- `MainTabs.tsx` - Bottom tab navigation (Home, Bookings, Profile)
- `BookingStack.tsx` - 5-step booking flow modal

**Screens:**
- `auth/LoginScreen.tsx` - Login form
- `auth/RegisterScreen.tsx` - Registration form
- `home/HomeScreen.tsx` - Map with real-time consultants
- `booking/ServiceTypeScreen.tsx` - Step 1: Select service type
- `booking/DateSelectionScreen.tsx` - Step 2: Pick date and duration
- `booking/LocationTypeScreen.tsx` - Step 3: Virtual or on-site
- `booking/NDAFormScreen.tsx` - Step 4: Sign NDA
- `booking/PaymentScreen.tsx` - Step 5: Payment and confirmation
- `booking/ConfirmationScreen.tsx` - Success screen
- `bookings/BookingsScreen.tsx` - List of user bookings

**State Management (Zustand):**
- `authStore.ts` - User authentication state
- `locationStore.ts` - GPS location tracking
- `consultantStore.ts` - Consultants list and selection
- `bookingStore.ts` - Multi-step booking form state

**Services:**
- `api/client.ts` - Axios client with JWT interceptor
- `api/auth.ts` - Auth API methods
- `api/consultants.ts` - Consultant API methods
- `api/bookings.ts` - Booking API methods
- `socket/socketService.ts` - WebSocket client

**Hooks:**
- `useLocation.ts` - GPS tracking with permissions
- `useWebSocket.ts` - WebSocket connection management
- `useRealtimeConsultants.ts` - Real-time location updates
- `useConsultants.ts` - Fetch nearby consultants

### API Structure

**Routes:**
- `auth.routes.ts` - Authentication endpoints
- `consultant.routes.ts` - Consultant endpoints
- `booking.routes.ts` - Booking endpoints

**Controllers:**
- `auth.controller.ts` - Auth request handlers
- `consultant.controller.ts` - Consultant request handlers
- `booking.controller.ts` - Booking request handlers

**Services:**
- `auth.service.ts` - JWT token generation, password hashing
- `consultant.service.ts` - Business logic for consultants
- `booking.service.ts` - Business logic for bookings
- `locationSimulator.service.ts` - Simulates consultant movement

**WebSocket:**
- `socketServer.ts` - Socket.io initialization with JWT auth
- `socketHandlers.ts` - WebSocket event handlers

**Middleware:**
- `auth.middleware.ts` - JWT verification for protected routes

## 🔌 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "role": "client"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "client@test.com",
  "password": "password123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "client@test.com",
    "firstName": "Test",
    "lastName": "Client",
    "role": "client"
  }
}
```

### Consultants

#### Get Nearby Consultants
```http
GET /api/consultants/nearby?latitude=40.7128&longitude=-74.0060&radius=50
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "consultants": [
      {
        "id": "uuid",
        "user": { ... },
        "bio": "...",
        "hourlyRate": 350,
        "rating": 4.8,
        "specializations": ["mergers", "acquisitions"],
        "availability": "available",
        "currentLocation": { ... },
        "distance": 2.5
      }
    ],
    "count": 15
  }
}
```

#### Get Consultant by ID
```http
GET /api/consultants/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "user": { ... },
    "bio": "...",
    "hourlyRate": 350,
    // ... full consultant details
  }
}
```

### Bookings

#### Create Booking
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "consultantId": "uuid",
  "negotiationType": "selling-business",
  "locationType": "virtual",
  "startDate": "2026-02-15",
  "duration": 2,
  "ndaDetails": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "signedAt": "2026-01-30T10:00:00Z"
  },
  "location": null
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "clientId": "uuid",
    "consultantId": "uuid",
    "status": "pending",
    "totalAmount": 5600,
    // ... full booking details
  }
}
```

#### Get User Bookings
```http
GET /api/bookings
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "confirmed",
      "consultant": { ... },
      "startDate": "2026-02-15",
      // ... booking details
    }
  ]
}
```

#### Get Booking by ID
```http
GET /api/bookings/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "consultant": { ... },
    // ... full booking details
  }
}
```

#### Update Booking Status
```http
PATCH /api/bookings/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}

Response: 200 OK
{
  "success": true,
  "message": "Booking status updated"
}
```

### Error Responses

All endpoints return errors in this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## 🔄 WebSocket Events

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' },
  transports: ['websocket']
});
```

### Client → Server Events

#### Subscribe to Area
```javascript
socket.emit('consultants:subscribe', {
  latitude: 40.7128,
  longitude: -74.0060,
  radius: 50
});
```

#### Update Location (Consultant Only)
```javascript
socket.emit('location:update', {
  latitude: 40.7128,
  longitude: -74.0060
});
```

### Server → Client Events

#### Initial Consultants
```javascript
socket.on('consultants:initial', (data) => {
  console.log(data.consultants); // Array of consultants in area
  console.log(data.count);       // Total count
});
```

#### Real-time Location Update
```javascript
socket.on('consultant:location', (data) => {
  console.log(data.consultantId);  // Consultant UUID
  console.log(data.location);      // { latitude, longitude, timestamp }
  console.log(data.availability);  // 'available' | 'busy' | 'offline'
});
```

#### Connection Events
```javascript
socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.log('Connection error:', error);
});
```

## 📱 Mobile App Guide

### User Flow

1. **Launch App** → Splash screen
2. **Login/Register** → Auth screens
3. **Home Screen** → Map with consultants
4. **Browse Consultants** → Tap markers or scroll list
5. **Start Booking** → Tap consultant card
6. **5-Step Booking Flow:**
   - Select service type
   - Choose date and duration
   - Pick location type
   - Sign NDA
   - Review and confirm
7. **View Bookings** → Bookings tab
8. **Profile** → Profile tab

### Key Features

**Real-time Map:**
- Full-screen interactive map
- User's blue dot location
- Consultant markers with color-coded availability
- Green = Available, Yellow = Busy, Gray = Offline
- Connection status badge (🟢 Live, 🟡 Connecting, 🔴 Error)

**Bottom Sheet:**
- Consultant list cards
- Distance from user
- Hourly rate, rating, experience
- Tap card to start booking

**Booking Flow:**
- Step-by-step wizard UI
- Progress indicator
- Real-time price calculation
- Form validation
- Back/Next navigation

**Bookings List:**
- All user bookings (upcoming and past)
- Status badges (Pending, Confirmed, In Progress, Completed, Cancelled)
- Pull-to-refresh
- Empty state with CTA

### State Management

The app uses Zustand for state management:

```typescript
// Auth state
const { user, token, isAuthenticated } = useAuthStore();

// Location tracking
const { userLocation, isTracking } = useLocationStore();

// Consultants
const { consultants, selectedConsultant } = useConsultantStore();

// Booking flow
const { consultant, negotiationType, startDate, duration, totalAmount } = useBookingStore();
```

### API Integration

All API calls use the Axios client with automatic JWT token injection:

```typescript
import { authApi, consultantsApi, bookingsApi } from '@/services/api';

// Auth
const response = await authApi.login({ email, password });

// Consultants
const consultants = await consultantsApi.getNearby({ latitude, longitude, radius });

// Bookings
const booking = await bookingsApi.createBooking(data);
```

### WebSocket Integration

WebSocket connection is managed via custom hooks:

```typescript
// Auto-connect/disconnect based on auth
useWebSocket();

// Subscribe to location updates
useRealtimeConsultants();

// Manual control
const { isConnected, connectionStatus } = useWebSocket();
socketService.subscribeToArea({ latitude, longitude, radius });
```

## 🧪 Testing

### Complete Testing Checklist

#### 1. API Server
```bash
cd packages/api

# Start server
npm run dev

# Verify endpoints (use curl or Postman)
curl http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@test.com","password":"password123"}'

# Should return JWT token
```

#### 2. Authentication Flow
- [ ] Open mobile app
- [ ] Register new account
- [ ] Logout
- [ ] Login with test account (client@test.com / password123)
- [ ] Verify token persists after app restart

#### 3. Map & GPS
- [ ] Grant location permission
- [ ] Verify blue dot appears at your location (or NYC default)
- [ ] See 10-30 consultant markers on map
- [ ] Markers are color-coded (green/yellow/gray)
- [ ] Connection status shows "🟢 Live"
- [ ] Bottom sheet displays consultant list

#### 4. Real-time Updates
- [ ] Watch consultant markers move every 10 seconds
- [ ] Open app on two devices/simulators simultaneously
- [ ] Verify both receive same location updates
- [ ] Disconnect network, verify "🔴 Error" status
- [ ] Reconnect, verify automatic reconnection

#### 5. Consultant Discovery
- [ ] Tap a consultant marker on map
- [ ] View consultant profile
- [ ] Scroll bottom sheet consultant list
- [ ] Verify distance calculations
- [ ] Check ratings, specializations, hourly rate display

#### 6. Booking Flow
- [ ] Tap a consultant card
- [ ] Step 1: Select a service type (e.g., "Selling a Business")
- [ ] Step 2: Pick a future date, select 2 or 3 days duration
- [ ] Verify price updates correctly (hourlyRate × 8 hours × duration)
- [ ] Step 3: Choose virtual or on-site
- [ ] Step 4: Review NDA, enter name and email
- [ ] Step 5: Review summary, tap "Confirm Booking"
- [ ] See confirmation screen with booking details
- [ ] Navigate to bookings list

#### 7. Bookings Management
- [ ] Open Bookings tab
- [ ] See newly created booking with "Pending" status
- [ ] Verify consultant name, date, duration, amount
- [ ] Pull down to refresh list
- [ ] Verify empty state when no bookings exist

#### 8. Error Handling
- [ ] Try invalid login credentials
- [ ] Try booking with date in the past (should be prevented)
- [ ] Disconnect network during booking creation
- [ ] Verify error messages display properly

### Load Testing

Simulate multiple consultants:
```bash
# Edit packages/api/src/scripts/seed.ts
# Change consultant count to 100

npm run seed
npm run dev

# Verify 100 markers appear on map
```

### Performance Testing

Monitor WebSocket updates:
```javascript
// In mobile app, add to HomeScreen.tsx
useEffect(() => {
  const startTime = Date.now();
  socketService.onLocationUpdate((data) => {
    const latency = Date.now() - data.location.timestamp;
    console.log(`Location update latency: ${latency}ms`);
  });
}, []);
```

## 🔧 Troubleshooting

### API Server Issues

**Port already in use:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

**Database not seeded:**
```bash
cd packages/api
rm -rf data/db.json
npm run seed
```

**WebSocket not connecting:**
- Check if API server is running on port 3000
- Verify no firewall blocking localhost connections
- Check console for auth token errors

### Mobile App Issues

**Metro bundler not starting:**
```bash
cd packages/mobile
npx expo start --clear
```

**Location permission not working:**
- iOS Simulator: Features → Location → Custom Location
- Physical device: Settings → Privacy → Location Services

**Map not displaying:**
- Check Google Maps API key in app.json
- For iOS, Apple Maps should work without API key

**Markers not appearing:**
- Verify API server is running
- Check network request in console
- Verify user location is set (not null)

**WebSocket connection failing:**
```javascript
// Check token in socketService.ts
const token = useAuthStore.getState().token;
console.log('Connecting with token:', token);
```

**App crashes on startup:**
```bash
# Clear Expo cache
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Common Errors

**"Cannot find module '@ma-consultant/shared'"**
```bash
# Reinstall workspace dependencies
npm install
```

**"No matching version found for lowdb@^7.0.2"**
- Already fixed in package.json (using v1.0.0)

**TypeScript compilation errors:**
```bash
# Rebuild TypeScript
cd packages/api
npm run build

cd ../mobile
npx expo start --clear
```

**Nodemon continuously restarting:**
- Already fixed with nodemon.json (ignores data directory)

## 🛠 Technology Stack

### Mobile App
- **React Native** 0.76 - Native mobile framework
- **Expo SDK** 52 - Development tooling
- **TypeScript** 5.x - Type safety
- **React Navigation** 7 - Navigation library
- **React Native Maps** - Apple Maps integration
- **Expo Location** - GPS tracking
- **Zustand** - State management
- **Axios** - HTTP client
- **Socket.io Client** - WebSocket client

### API Server
- **Node.js** 18+ - Runtime
- **Express** 4.x - Web framework
- **TypeScript** 5.x - Type safety
- **Socket.io** 4.x - WebSocket server
- **LowDB** 1.0.0 - JSON database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **UUID** - ID generation

### Shared
- **TypeScript** 5.x - Shared types across packages

### Development Tools
- **npm Workspaces** - Monorepo management
- **Nodemon** - Auto-restart on changes
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📝 Notes

### Current Limitations (MVP)
- iOS only (Android support can be added)
- Mock database (data resets on server restart)
- Simulated location updates (not real GPS tracking)
- Simulated payments (Stripe integration ready)
- No booking detail screen (logs to console)
- No consultant app (separate app needed)
- No push notifications yet
- No in-app messaging

### Production Considerations

To make this production-ready:

1. **Database:** Migrate from LowDB to PostgreSQL/MongoDB
2. **Authentication:** Add refresh tokens, OAuth support
3. **Payments:** Integrate real Stripe payment flow
4. **Location:** Switch to real GPS tracking for consultants
5. **Hosting:** Deploy API to cloud (AWS, Heroku, Vercel)
6. **Mobile:** Publish to App Store with EAS Build
7. **Push Notifications:** Add Expo Notifications
8. **Error Tracking:** Add Sentry or similar
9. **Analytics:** Add analytics tracking
10. **Testing:** Add unit tests, integration tests, E2E tests

### Known Issues

- Location simulator moves consultants randomly (not following real roads)
- Mock data resets when API server restarts
- Booking detail screen not implemented (placeholder)
- No cancel booking functionality yet
- Payment is simulated (no real Stripe integration)

## 📄 License

MIT

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API logs in terminal
3. Check mobile app console for errors
4. Verify all services are running (API server, Expo dev server)

---

**Built with ❤️ for M&A professionals**

Last updated: January 30, 2026
