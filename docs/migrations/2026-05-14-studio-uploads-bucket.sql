-- Sprint 4.2 — Studio uploads bucket
--
-- Public-read Supabase Storage bucket for images dropped, pasted, or
-- click-picked inside the Studio Editor. Files are uploaded via the
-- service-role through /api/studio/upload (the Sprint 3 Basic-Auth
-- gate already covers /api/studio/*), and surfaced on the public
-- blog through the bucket's public CDN URL pattern:
--
--   https://<project>.supabase.co/storage/v1/object/public/studio-uploads/<filename>
--
-- Filenames are content-addressed: <sha256-of-bytes>-<sanitised-original-name>.<ext>.
-- That gives us de-dup for free (same image dropped twice = same row,
-- not a second copy) and means we never need to invalidate the URL.
--
-- Bucket constraints:
--   - public        = true            (anonymous reads via the CDN)
--   - file_size_limit = 8 MB
--   - allowed_mime_types = images only (png, jpeg, webp, svg+xml, gif, avif)
--
-- Writes:
--   The service-role bypasses RLS, so no INSERT/UPDATE policies are
--   needed for the /api/studio/upload route. We deliberately do NOT
--   add anon-role write policies — uploads must go through the auth-
--   gated endpoint, never directly from the client.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'studio-uploads',
  'studio-uploads',
  true,
  8388608, -- 8 MiB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
