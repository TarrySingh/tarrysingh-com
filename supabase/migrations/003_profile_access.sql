-- =============================================================================
-- Executive profile: access grants, access log, access requests, private bucket
-- =============================================================================
-- Backs the gated layer at /curriculumvitae/dossier. (Numbered 003 because 002
-- is panoraima_members.) Idempotent: safe to run more than once.
--
-- Design (plan section 3):
--   * Access codes are issued per person by a local CLI, shown once, and
--     stored only as HMAC-SHA256(normalised code, CV_CODE_PEPPER).
--   * Server routes use the service role (src/lib/supabase/server.ts).
--     RLS is enabled with NO policies, so anon and authenticated roles
--     can read or write nothing; table and view grants are revoked too.
--   * IP addresses are stored only as HMAC(ip, CV_IP_SALT); user agents are
--     truncated; location is country-level only.
--   * Master PDFs and the gated profile live in the PRIVATE Storage bucket
--     'cv-private' (created at the end of this file), never in /public.
--   * Retention: events and declined or stale requests are purged after 12
--     months (scheduled job; see the end of this file).
-- =============================================================================

-- Requests from search firms (the front door to issuing a grant)
CREATE TABLE IF NOT EXISTS profile_access_requests (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name                   TEXT NOT NULL,
  email                  TEXT NOT NULL,
  firm                   TEXT,
  role_title             TEXT,
  mandate_summary        TEXT,
  message                TEXT,
  consent_at             TIMESTAMPTZ NOT NULL,
  privacy_notice_version TEXT NOT NULL,
  status                 TEXT NOT NULL DEFAULT 'new'
                         CHECK (status IN ('new', 'approved', 'declined')),
  ip_hash                TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_access_requests_status
  ON profile_access_requests (status, created_at DESC);

-- Rate limiting for the request form (3 per ip_hash per hour)
CREATE INDEX IF NOT EXISTS idx_profile_access_requests_ip
  ON profile_access_requests (ip_hash, created_at DESC);

-- One row per issued access code
CREATE TABLE IF NOT EXISTS profile_grants (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_hash         TEXT NOT NULL UNIQUE,
  label             TEXT,
  recruiter_name    TEXT,
  recruiter_email   TEXT,
  firm              TEXT,
  mandate_note      TEXT,
  -- e.g. {'dossier','cases','pdf:exec-cv','pdf:one-pager','pdf:long-bio','pdf:board-bio'}
  scopes            TEXT[] NOT NULL DEFAULT '{}',
  max_redemptions   INTEGER NOT NULL DEFAULT 5 CHECK (max_redemptions > 0),
  redemptions       INTEGER NOT NULL DEFAULT 0 CHECK (redemptions >= 0),
  expires_at        TIMESTAMPTZ NOT NULL,
  revoked_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_request_id UUID REFERENCES profile_access_requests (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_profile_grants_active
  ON profile_grants (expires_at)
  WHERE revoked_at IS NULL;

-- Append-only access log; grant_id is null for failed redemptions
CREATE TABLE IF NOT EXISTS profile_events (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grant_id   UUID REFERENCES profile_grants (id) ON DELETE SET NULL,
  kind       TEXT NOT NULL
             CHECK (kind IN ('redeem_ok', 'redeem_fail', 'view', 'download',
                             'request', 'revoke', 'lockout')),
  artefact   TEXT,
  path       TEXT,
  ip_hash    TEXT,
  ua_short   TEXT,
  country    TEXT CHECK (country IS NULL OR country ~ '^[A-Z]{2}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_events_grant
  ON profile_events (grant_id, created_at DESC);

-- Brute-force protection (5 failed redemptions per ip_hash per 15 minutes)
CREATE INDEX IF NOT EXISTS idx_profile_events_ip_kind
  ON profile_events (ip_hash, kind, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profile_events_kind
  ON profile_events (kind, created_at DESC);

-- Owner's activity console: latest activity per grant with view and download
-- counts. security_invoker makes the view obey the RLS of its base tables,
-- so it is no wider than they are.
CREATE OR REPLACE VIEW profile_activity_v
WITH (security_invoker = true) AS
SELECT
  g.id                                                    AS grant_id,
  g.label,
  g.recruiter_name,
  g.firm,
  g.scopes,
  g.expires_at,
  g.revoked_at,
  g.redemptions,
  g.max_redemptions,
  MIN(e.created_at) FILTER (WHERE e.kind = 'redeem_ok')   AS first_redeemed_at,
  COUNT(e.id) FILTER (WHERE e.kind = 'view')              AS views,
  COUNT(e.id) FILTER (WHERE e.kind = 'download')          AS downloads,
  MAX(e.created_at)                                       AS last_activity_at
FROM profile_grants g
LEFT JOIN profile_events e ON e.grant_id = g.id
GROUP BY g.id;

-- =============================================================================
-- Row Level Security: enabled, no policies. Service role only.
-- =============================================================================

ALTER TABLE profile_access_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_events ENABLE ROW LEVEL SECURITY;

-- Belt and braces: no direct API access for client roles at all.
REVOKE ALL ON profile_access_requests FROM anon, authenticated;
REVOKE ALL ON profile_grants FROM anon, authenticated;
REVOKE ALL ON profile_events FROM anon, authenticated;
REVOKE ALL ON profile_activity_v FROM anon, authenticated;

-- Service role bypasses RLS automatically.
-- No policies for anon or authenticated: all access goes through
-- service-role API routes and the local scripts/cv/grant.ts CLI.

-- =============================================================================
-- Private Storage bucket for gated.json and the master PDFs (service role only)
-- =============================================================================
-- public = false and no storage.objects policies: only the service role (the
-- API routes and scripts/cv/upload.ts) can read or write it. Guarded so the
-- migration still runs on a database without the Supabase storage schema.

DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'cv-private',
      'cv-private',
      false,
      26214400,
      ARRAY['application/pdf', 'application/json']
    )
    ON CONFLICT (id) DO UPDATE
      SET public = false,
          file_size_limit = EXCLUDED.file_size_limit,
          allowed_mime_types = EXCLUDED.allowed_mime_types;
  END IF;
END
$$;

-- =============================================================================
-- Retention (not part of this migration): a scheduled job, e.g.
--   DELETE FROM profile_events WHERE created_at < NOW() - INTERVAL '12 months';
--   DELETE FROM profile_access_requests
--     WHERE status IN ('new', 'declined') AND created_at < NOW() - INTERVAL '12 months';
-- =============================================================================
