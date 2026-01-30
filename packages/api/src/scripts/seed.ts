import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import db, { createUser, createConsultant } from '../database/db';
import {
  User,
  Consultant,
  Specialization,
  ConsultantAvailability
} from '@ma-consultant/shared';

// City locations for mock data
const cities = [
  { name: 'New York', lat: 40.7128, lng: -74.0060 },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { name: 'Boston', lat: 42.3601, lng: -71.0589 },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'Seattle', lat: 47.6062, lng: -122.3321 }
];

const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris'
];

const specializations: Specialization[] = [
  'mergers-acquisitions',
  'business-valuation',
  'due-diligence',
  'negotiation',
  'legal-structuring',
  'financial-analysis',
  'post-merger-integration',
  'asset-sales'
];

const bios = [
  'Seasoned M&A advisor with expertise in mid-market transactions.',
  'Former investment banker specializing in technology sector deals.',
  'Expert in business valuation and financial due diligence.',
  'Strategic consultant with 15+ years in negotiation and deal structuring.',
  'Specialist in cross-border acquisitions and international transactions.',
  'Focused on healthcare and life sciences M&A advisory.',
  'Former CFO with deep experience in post-merger integration.',
  'Expert in distressed asset sales and restructuring.',
  'Boutique advisor serving family-owned business transitions.',
  'Former Big 4 consultant specializing in buy-side advisory.'
];

const availabilityOptions: ConsultantAvailability[] = ['available', 'busy', 'offline'];

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random items from array
const randomItems = <T>(arr: T[], min: number, max: number): T[] => {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper to generate random location near a city
const randomLocationNearCity = (city: typeof cities[0], radiusKm: number = 5) => {
  const radiusInDegrees = radiusKm / 111;
  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  const newLat = city.lat + y;
  const newLng = city.lng + (x / Math.cos(city.lat * Math.PI / 180));

  return {
    latitude: parseFloat(newLat.toFixed(6)),
    longitude: parseFloat(newLng.toFixed(6)),
    timestamp: new Date().toISOString()
  };
};

const seedDatabase = async () => {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  db.set('users', []).write();
  db.set('consultants', []).write();
  db.set('bookings', []).write();
  db.set('payments', []).write();

  // Create a test client user
  const clientPassword = await bcrypt.hash('password123', 10);
  const clientUser: User = {
    id: uuidv4(),
    email: 'client@test.com',
    firstName: 'Test',
    lastName: 'Client',
    phoneNumber: '+1-555-0001',
    role: 'client',
    createdAt: new Date().toISOString()
  };
  createUser(clientUser);
  console.log('✅ Created test client user: client@test.com');

  // Create 30 mock consultants
  const consultantCount = 30;
  for (let i = 0; i < consultantCount; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const city = randomItem(cities);
    const password = await bcrypt.hash('consultant123', 10);

    const user: User = {
      id: uuidv4(),
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@consultant.com`,
      firstName,
      lastName,
      phoneNumber: `+1-555-${String(i + 100).padStart(4, '0')}`,
      role: 'consultant',
      createdAt: new Date().toISOString()
    };
    createUser(user);

    const consultant: Consultant = {
      id: uuidv4(),
      userId: user.id,
      bio: randomItem(bios),
      hourlyRate: Math.floor(Math.random() * 600) + 200, // $200-$800
      specializations: randomItems(specializations, 2, 4),
      rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5-5.0
      totalReviews: Math.floor(Math.random() * 150) + 10, // 10-160 reviews
      yearsOfExperience: Math.floor(Math.random() * 20) + 5, // 5-25 years
      availability: randomItem(availabilityOptions),
      currentLocation: randomLocationNearCity(city),
      profileImageUrl: `https://i.pravatar.cc/150?u=${user.id}`
    };
    createConsultant(consultant);
  }

  console.log(`✅ Created ${consultantCount} mock consultants`);
  console.log('✨ Database seeded successfully!');
  console.log('\nTest accounts:');
  console.log('  Client: client@test.com / password123');
  console.log('  Consultant: [any consultant email] / consultant123');
};

// Run seed
seedDatabase()
  .then(() => {
    console.log('\n✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
