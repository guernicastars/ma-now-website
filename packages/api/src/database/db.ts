import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import path from 'path';
import fs from 'fs';
import {
  User,
  Consultant,
  Booking,
  Payment
} from '@ma-consultant/shared';

export interface Database {
  users: User[];
  consultants: Consultant[];
  bookings: Booking[];
  payments: Payment[];
}

const dbPath = path.resolve(process.env.DATABASE_PATH || './data/db.json');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const adapter = new FileSync<Database>(dbPath);
const db = low(adapter);

// Set defaults
db.defaults({
  users: [],
  consultants: [],
  bookings: [],
  payments: []
}).write();

export default db;

// Helper functions
export const getUsers = () => db.get('users');
export const getConsultants = () => db.get('consultants');
export const getBookings = () => db.get('bookings');
export const getPayments = () => db.get('payments');

export const findUserByEmail = (email: string) =>
  db.get('users').find({ email }).value();

export const findUserById = (id: string) =>
  db.get('users').find({ id }).value();

export const findConsultantById = (id: string) =>
  db.get('consultants').find({ id }).value();

export const findConsultantByUserId = (userId: string) =>
  db.get('consultants').find({ userId }).value();

export const findBookingById = (id: string) =>
  db.get('bookings').find({ id }).value();

export const createUser = (user: User) => {
  db.get('users').push(user).write();
  return user;
};

export const createConsultant = (consultant: Consultant) => {
  db.get('consultants').push(consultant).write();
  return consultant;
};

export const createBooking = (booking: Booking) => {
  db.get('bookings').push(booking).write();
  return booking;
};

export const createPayment = (payment: Payment) => {
  db.get('payments').push(payment).write();
  return payment;
};

export const updateConsultantLocation = (
  consultantId: string,
  location: { latitude: number; longitude: number }
) => {
  db.get('consultants')
    .find({ id: consultantId })
    .assign({
      currentLocation: {
        ...location,
        timestamp: new Date().toISOString()
      }
    })
    .write();
};

export const updateBookingStatus = (
  bookingId: string,
  status: Booking['status']
) => {
  db.get('bookings')
    .find({ id: bookingId })
    .assign({
      status,
      updatedAt: new Date().toISOString()
    })
    .write();
};

export const updatePaymentStatus = (
  paymentId: string,
  status: Payment['status'],
  paidAt?: string
) => {
  const update: any = { status };
  if (paidAt) {
    update.paidAt = paidAt;
  }

  db.get('payments')
    .find({ id: paymentId })
    .assign(update)
    .write();
};
