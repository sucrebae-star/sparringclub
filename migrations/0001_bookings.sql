CREATE TABLE IF NOT EXISTS academy_bookings (
  id TEXT PRIMARY KEY,
  request_key TEXT NOT NULL UNIQUE,
  payload_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  program TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  notification_status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS academy_bookings_created ON academy_bookings(created_at);
CREATE TABLE IF NOT EXISTS booking_rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
