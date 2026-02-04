-- M&A Now - Initial PostgreSQL Schema
-- Migration: 001_initial_schema
-- Created: 2026-02-04

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'consultant', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Consultants table
CREATE TABLE IF NOT EXISTS consultants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    specializations TEXT[] NOT NULL DEFAULT '{}',
    rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    total_reviews INTEGER DEFAULT 0,
    years_of_experience INTEGER DEFAULT 0,
    availability VARCHAR(20) DEFAULT 'offline' CHECK (availability IN ('available', 'busy', 'offline')),
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    location_updated_at TIMESTAMP WITH TIME ZONE,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    negotiation_type VARCHAR(50) NOT NULL CHECK (negotiation_type IN ('selling-business', 'buying-business', 'buying-asset', 'selling-asset', 'other')),
    location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('onsite', 'virtual')),
    start_date DATE NOT NULL,
    duration INTEGER NOT NULL CHECK (duration IN (2, 3)),

    -- Location details (for onsite)
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    location_street VARCHAR(255),
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_zip_code VARCHAR(20),
    location_country VARCHAR(100),

    -- NDA details
    nda_first_name VARCHAR(100) NOT NULL,
    nda_last_name VARCHAR(100) NOT NULL,
    nda_email VARCHAR(255) NOT NULL,
    nda_signed_at TIMESTAMP WITH TIME ZONE,
    nda_document_url TEXT,

    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Prevent double-booking: same consultant, same date
    CONSTRAINT unique_consultant_date UNIQUE (consultant_id, start_date)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
    stripe_payment_intent_id VARCHAR(255),
    payment_method VARCHAR(20) CHECK (payment_method IN ('card', 'bank_transfer', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE
);

-- Event log table (for audit trail)
CREATE TABLE IF NOT EXISTS event_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Slot holds table (for preventing double-booking during checkout)
CREATE TABLE IF NOT EXISTS slot_holds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultant_id UUID NOT NULL REFERENCES consultants(id) ON DELETE CASCADE,
    held_date DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Only one hold per consultant per date
    CONSTRAINT unique_consultant_hold_date UNIQUE (consultant_id, held_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_consultants_user_id ON consultants(user_id);
CREATE INDEX IF NOT EXISTS idx_consultants_availability ON consultants(availability);
CREATE INDEX IF NOT EXISTS idx_consultants_location ON consultants(current_latitude, current_longitude);
CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_consultant_id ON bookings(consultant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_event_log_entity ON event_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_event_log_created ON event_log(created_at);
CREATE INDEX IF NOT EXISTS idx_slot_holds_expires ON slot_holds(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_consultants_updated_at BEFORE UPDATE ON consultants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired slot holds
CREATE OR REPLACE FUNCTION cleanup_expired_holds()
RETURNS void AS $$
BEGIN
    DELETE FROM slot_holds WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ language 'plpgsql';
