import { FONTS_HREF, printCss } from "./css"

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

/**
 * A complete HTML document: inline CSS, Google Fonts link, and the
 * server-rendered body. `k` is the density dial (see css.ts).
 */
export function htmlDocument(opts: { title: string; body: string; k?: number; fonts?: boolean }): string {
  const { title, body, k = 1, fonts = true } = opts
  return [
    "<!doctype html>",
    '<html lang="en-GB">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex, nofollow, noarchive">',
    `<title>${escapeHtml(title)}</title>`,
    ...(fonts
      ? [
          '<link rel="preconnect" href="https://fonts.googleapis.com">',
          '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
          `<link rel="stylesheet" href="${FONTS_HREF}">`,
        ]
      : []),
    `<style>${printCss}</style>`,
    `<style id="density">:root{--k:${k}}</style>`,
    "</head>",
    `<body>${body}</body>`,
    "</html>",
  ].join("\n")
}
