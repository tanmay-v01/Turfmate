CREATE TABLE IF NOT EXISTS player_sport_stats (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport VARCHAR(30) NOT NULL,
  stats JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, sport)
);

CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sport VARCHAR(30) NOT NULL,
  summary TEXT,
  delta JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_results_user ON match_results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_player_sport_stats_sport ON player_sport_stats(sport);
