ALTER TABLE split_escrow_details ADD COLUMN IF NOT EXISTS slot_time VARCHAR(50);
ALTER TABLE split_escrow_details ADD COLUMN IF NOT EXISTS date_label VARCHAR(20);
ALTER TABLE split_escrow_details ADD COLUMN IF NOT EXISTS sport VARCHAR(30);
