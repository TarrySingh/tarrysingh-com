# Agent notes for tarrysingh-com

See CLAUDE.md in this repo. Key rule: **the gym app lives in `TarrySingh/stronger-gym`, never commit gym files here**, and batch pushes (every push triggers ~7-minute Vercel builds).

The gym app (gym.tarrysingh.com) lives in its own repo, `TarrySingh/stronger-gym`
(local: `~/Documents/GitHub/stronger-gym`), with its own Vercel project. It was moved out on 7 Nov 2026.

- **Never commit gym files, exercise images or `gym/` anything to this repo.**
- Every push here triggers Vercel preview + production builds of the Next.js site (~7 min each).
  On 6-7 Nov 2026 ~70 gym-image PRs pushed here burned ~24 build-hours (about 146 CPU-hours on the dashboard).
- Push discipline for any agent: commit locally as often as you like, push once per session; one branch, one PR.

