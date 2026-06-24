-- Prevent double-booking the same slot (active bookings only)

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_slot_active
  ON bookings (slot_key)
  WHERE status IN ('CONFIRMED', 'PENDING_FUNDING');
