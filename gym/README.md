# Stronger Every Week

Standalone static workout journal for gym.tarrysingh.com. `index.html`, `app.js`, `style.css`, and `assets/` must be served together from the web root of the gym subdomain. This folder is independent of the repository's Next.js app and is not automatically exposed or deployed by merely committing it.

## Current behavior

Workout logs, in-progress drafts, and body measurements are stored in localStorage for this browser and origin. Export a JSON backup from Data & settings. Changing hostname, browser, or device does not transfer saved data automatically; export from the old origin and restore on the new one. Clearing browser data can delete records. Avoid using a shared device for private health information.

Exercise images are AI-generated stills, not animated or verified movement demonstrations. Apple Health, accounts, and cross-device sync are not implemented.

## Run locally

From this directory: `python3 -m http.server 8765`. Visit http://localhost:8765.

## Deployment

Publish the contents of this folder as a static website on the chosen hosting provider, then point the `gym` DNS record to that provider's verified target and configure TLS. Merely creating the folder or a DNS record does not deploy the app. Do not point DNS at an old provider until the desired hosting is configured. The repository root deploys to the DK AI Lab Vercel team; see the root README and CLAUDE.md before changing its deployment.
