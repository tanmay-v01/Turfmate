-- Phase 5c: account deletion (soft-delete + anonymize)

ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_status_check;
ALTER TABLE users ADD CONSTRAINT users_status_check
  CHECK (status IN ('ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED'));
