CREATE TABLE IF NOT EXISTS owner_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  turf_id UUID REFERENCES turfs(id) ON DELETE SET NULL,
  turf_legacy_id VARCHAR(40),
  category VARCHAR(20) NOT NULL DEFAULT 'PROMO',
  headline TEXT NOT NULL,
  body_text TEXT NOT NULL,
  promo_code TEXT,
  cta_text TEXT DEFAULT 'Book Now',
  sport VARCHAR(30) DEFAULT 'football',
  expires_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'EXPIRED', 'DEACTIVATED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_owner_broadcasts_active ON owner_broadcasts(status, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_owner_broadcasts_owner ON owner_broadcasts(owner_user_id);
