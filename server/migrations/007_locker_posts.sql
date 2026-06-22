CREATE TABLE IF NOT EXISTS locker_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id),
  content_type VARCHAR(30) NOT NULL,
  content_text TEXT NOT NULL,
  extra_json JSONB NOT NULL DEFAULT '{}',
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_locker_posts_created ON locker_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_locker_posts_author ON locker_posts(author_id);
