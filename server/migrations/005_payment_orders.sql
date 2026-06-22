CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_order_id VARCHAR(100) UNIQUE,
  razorpay_payment_id VARCHAR(100),
  user_id UUID NOT NULL REFERENCES users(id),
  purpose VARCHAR(40) NOT NULL
    CHECK (purpose IN ('BOOKING_PRIVATE', 'SPLIT_HOST', 'SPLIT_JOIN')),
  amount_paise INTEGER NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'INR',
  status VARCHAR(20) NOT NULL DEFAULT 'CREATED'
    CHECK (status IN ('CREATED', 'PAID', 'FAILED', 'REFUNDED')),
  payload JSONB NOT NULL DEFAULT '{}',
  booking_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_razorpay ON payment_orders(razorpay_order_id);
