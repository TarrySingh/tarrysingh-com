-- =============================================================================
-- Agent & Me: Initial Schema
-- Tables for simulation caching, token management, and purchase records
-- =============================================================================

-- Simulation results cache (24h TTL)
CREATE TABLE IF NOT EXISTS simulation_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_slug TEXT NOT NULL,
  scenario TEXT NOT NULL,
  region TEXT NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sim_cache_lookup
  ON simulation_cache (role_slug, scenario, region, expires_at);

-- User token balances (anonymous, cookie-based)
CREATE TABLE IF NOT EXISTS user_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id
  ON user_tokens (user_id);

-- Purchase records (Stripe sessions)
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,
  amount INTEGER NOT NULL,
  tokens_credited INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id
  ON purchases (user_id);

CREATE INDEX IF NOT EXISTS idx_purchases_session
  ON purchases (stripe_session_id);

-- =============================================================================
-- RPC: Atomic token deduction (prevents race conditions)
-- =============================================================================

CREATE OR REPLACE FUNCTION deduct_token(p_user_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE user_tokens
  SET balance = balance - 1, updated_at = NOW()
  WHERE user_id = p_user_id AND balance > 0
  RETURNING balance INTO new_balance;

  IF new_balance IS NULL THEN
    RETURN 0;
  END IF;

  RETURN new_balance;
END;
$$;

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE simulation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically.
-- No policies for anon — all access is through service role API routes.
