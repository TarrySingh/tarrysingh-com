# Stronger Every Week

Standalone responsive browser app for gym.tarrysingh.com. This is a draft; do not release until all checks below pass.

## Build

Node 22; from `gym/` run `npm ci`, `npm run check`, and `npm run build`. Serve the folder over HTTPS. Never commit node_modules. `supabase-bundle.js` is built from the pinned dependency; regenerate it when dependencies change.

## Authentication and storage

The application uses Supabase Auth email/password and stores completed workouts and measurements in the dedicated DKFreeZone `stronger-gym` project. The public key in `auth-entry.js` is intentionally client-visible. Never include a secret or service role key in browser code. `schema.sql` records the applied schema. RLS restricts select/insert/update/delete to a row's authenticated owner and anonymous access is revoked. Draft workout entries are scoped by user and stored in the current browser; avoid shared devices. Export a backup before moving from the previous prototype's origin; import adds data and does not deduplicate.

## Before release

- Configure and test the Supabase auth Site URL, allowed redirects for the actual HTTPS hostname, email confirmation, password recovery, and a production email sender. Default Supabase email restrictions are unsuitable for a general release.
- Run a real two-user end-to-end test for sign-up, confirmation, login, save, reload, isolation, sign-out, password reset, and import/export. Check rate limiting and MFA requirements before general availability.
- Verify the separate Vercel deployment is under the DK AI Lab team, and connect `gym.tarrysingh.com` to its provider-returned DNS target in SiteGround only after the deployment and authentication are confirmed.
- Verify mobile and desktop layouts and TLS. The images are AI-generated stills, not verified motion demonstrations; Apple Health and animation are not yet integrated.

This folder is independent of the parent Next.js app. Adding it to this repository does not automatically make it available at the subdomain. Root repository deployment instructions still apply.
