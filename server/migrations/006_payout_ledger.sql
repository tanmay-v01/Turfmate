CREATE TABLE IF NOT EXISTS payout_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  turf_id UUID REFERENCES turfs(id),
  owner_user_id UUID NOT NULL REFERENCES users(id),
  entry_type VARCHAR(30) NOT NULL DEFAULT 'BOOKING_SETTLED'
    CHECK (entry_type IN ('BOOKING_SETTLED', 'REFUND_REVERSAL')),
  gross_inr INTEGER NOT NULL DEFAULT 0,
  commission_inr INTEGER NOT NULL DEFAULT 0,
  net_inr INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING_SETTLEMENT'
    CHECK (status IN ('PENDING_SETTLEMENT', 'SETTLED', 'REVERSED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_ledger_owner ON payout_ledger(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_payout_ledger_booking ON payout_ledger(booking_id);
