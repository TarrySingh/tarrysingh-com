-- =============================================================================
-- PANORAIMA: consortium dashboard membership
-- Replaces the single shared PANORAIMA_USER/PANORAIMA_PASS credential with
-- named accounts. Roles today: 'admin' (full access, manages members) and
-- 'member' (view-only). password_hash is nullable on purpose: members are
-- onboarded by magic link and may later set their own password, so an account
-- is valid before any password exists.
-- =============================================================================

CREATE TABLE IF NOT EXISTS panoraima_members (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  role          TEXT NOT NULL DEFAULT 'member'
                CHECK (role IN ('admin', 'member')),
  password_hash TEXT,
  disabled      BOOLEAN NOT NULL DEFAULT FALSE,
  invited_by    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Email is the login identifier and is always stored lowercased by the
-- application layer; this index keeps the lookup path fast.
CREATE INDEX IF NOT EXISTS idx_panoraima_members_email
  ON panoraima_members (email);

-- Single-use, short-lived magic-link tokens. Only the SHA-256 hash of the
-- token is stored, so a database leak does not yield working links.
CREATE TABLE IF NOT EXISTS panoraima_login_tokens (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email       TEXT NOT NULL,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_panoraima_login_tokens_hash
  ON panoraima_login_tokens (token_hash);

CREATE INDEX IF NOT EXISTS idx_panoraima_login_tokens_expiry
  ON panoraima_login_tokens (expires_at);

-- Both tables are reached only through the service-role client in server-side
-- API routes, never from the browser, so RLS is enabled with no public policy.
ALTER TABLE panoraima_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE panoraima_login_tokens ENABLE ROW LEVEL SECURITY;
