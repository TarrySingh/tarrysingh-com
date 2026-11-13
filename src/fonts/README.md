# Self-hosted fonts

Latin-subset WOFF2 files, loaded with `next/font/local` so the production build never downloads fonts from Google (a failed fetch used to fail the whole Vercel build).

Source: Fontsource npm packages, version 5.3.0 (`@fontsource/ibm-plex-sans`, `ibm-plex-serif`, `ibm-plex-mono`, `gloock`, `instrument-serif`; `@fontsource-variable/geist`, `geist-mono`, `space-grotesk`). All are under the SIL Open Font License 1.1, which permits bundling and redistribution.

To add a weight, copy the matching `*-latin-<weight>-<style>.woff2` from the package's `files/` directory and add it to the `src` list in the loader.
