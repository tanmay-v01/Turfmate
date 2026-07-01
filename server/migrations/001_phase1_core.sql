-- TurfMate Phase 1: Identity, turfs, bookings core
-- Uses lat/lng columns (PostGIS optional in Phase 1b)

-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(15) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'PLAYER'
    CHECK (role IN ('PLAYER', 'OWNER', 'SUPER_ADMIN')),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'SUSPENDED', 'BANNED')),
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(100),
  username VARCHAR(50) UNIQUE,
  avatar_url VARCHAR(255),
  location_label VARCHAR(100),
  location_lat DECIMAL(10, 7),
  location_lng DECIMAL(10, 7),
  filter_radius_km INTEGER NOT NULL DEFAULT 10,
  reliability_score DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  sports_dna JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS turf_owners (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(150),
  business_email VARCHAR(150),
  owner_name VARCHAR(100),
  kyc_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (kyc_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  pan_number VARCHAR(20),
  bank_account_no VARCHAR(50),
  ifsc_code VARCHAR(20),
  gstin VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS turfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES turf_owners(user_id) ON DELETE SET NULL,
  legacy_id VARCHAR(50),
  name VARCHAR(150) NOT NULL,
  address TEXT,
  city VARCHAR(80),
  location_lat DECIMAL(10, 7),
  location_lng DECIMAL(10, 7),
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  amenities JSONB NOT NULL DEFAULT '[]'::jsonb,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  sports JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  legacy_id VARCHAR(50),
  name VARCHAR(50) NOT NULL,
  size_format VARCHAR(20),
  base_price_per_hour INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS slot_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turf_id UUID NOT NULL REFERENCES turfs(id) ON DELETE CASCADE,
  pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
  slot_key VARCHAR(80) NOT NULL,
  locked_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (turf_id, slot_key)
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turf_id UUID NOT NULL REFERENCES turfs(id),
  pitch_id UUID REFERENCES pitches(id),
  host_id UUID NOT NULL REFERENCES users(id),
  booking_type VARCHAR(20) NOT NULL
    CHECK (booking_type IN ('PRIVATE_FULL', 'SPLIT_PAY', 'MANUAL_OFFLINE')),
  status VARCHAR(30) NOT NULL
    CHECK (status IN (
      'PENDING_FUNDING', 'CONFIRMED', 'CANCELLED_BY_HOST',
      'CANCELLED_BY_SYSTEM', 'CANCELLED_BY_OWNER'
    )),
  slot_key VARCHAR(80),
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  total_cost INTEGER NOT NULL DEFAULT 0,
  platform_fee INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS split_escrow_details (
  booking_id UUID PRIMARY KEY REFERENCES bookings(id) ON DELETE CASCADE,
  players_needed INTEGER NOT NULL,
  cost_per_head INTEGER NOT NULL,
  amount_collected INTEGER NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  amount_paid INTEGER NOT NULL DEFAULT 0,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (payment_status IN ('PENDING', 'HELD_IN_ESCROW', 'SETTLED', 'REFUNDED')),
  is_host BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (booking_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_turfs_location ON turfs(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_bookings_host ON bookings(host_id);
CREATE INDEX IF NOT EXISTS idx_slot_locks_expires ON slot_locks(expires_at);
