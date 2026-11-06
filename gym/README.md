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

## Exercise library and session templates

The library incorporates the 876-entry [Free Exercise DB](https://github.com/yuhonas/free-exercise-db) snapshot at commit `f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5`, distributed by its authors under the Unlicense. Reference images are loaded from that pinned revision and require an internet connection. Exercise information and images have not been clinically verified. Session templates sync per account via `plans-schema.sql`; workout drafts remain device-local.

Additional exercise data comes from [Glowupp Open ExerciseDB](https://github.com/Glowupp-app/open-exercisedb), MIT licensed, snapshot `80b98f38721a88119b860e0e0e969bf1592c2525`. Machine variants were informed by [Atlantis](https://atlantisstrength.com/gym-equipment/legs) and [Technogym](https://www.technogym.com/en-US/category/plate-loaded/) catalogues; those entries have no manufacturer photos. Custom exercises can fill gaps. Machine starting resistance and adjustments differ by model; follow the machine's instructions.

### Exercise-image overrides

`exerciseVisuals` in `app.js` maps a small, manually reviewed set of exact library IDs to the existing preferred-style stills and additional AI-generated stills in `assets/*-v2.webp`. Other entries retain their original imagery or placeholder. New image prompts asked for a single realistic human performing a specific movement against a white background, with the correct equipment and pose and no text or logos; generated images remain illustrative and have not been independently verified by a trainer. The generated hack-squat and seated-leg-curl candidates were excluded because the equipment or pose was ambiguous. Existing seated-leg-curl and seated-calf images predate these changes and require correction.
