# Fonts

Three families. Set them up once with `next/font` and never touch again.

## The stack

| Family | Where to get it | When to use it | Fallback chain |
| --- | --- | --- | --- |
| **Gloock** | Google Fonts → `import { Gloock } from 'next/font/google'` | Project names (`MEMPHIS`, `SYMPHONY`), large numerals (`O2`, `01`), plate roman numerals (`I, II, III, IV`) | `Italiana, 'Cormorant Garamond', serif` |
| **IBM Plex Serif** | Google Fonts; italic + bold + regular | Long-form prose, italic captions, italic subtitles | `'Source Serif Pro', Georgia, serif` |
| **IBM Plex Mono** | Google Fonts; regular + bold | Labels, plate metadata, small caps, technical annotations, code | `'JetBrains Mono', ui-monospace, monospace` |

## next/font configuration

```ts
// src/app/fonts.ts
import { Gloock, IBM_Plex_Serif, IBM_Plex_Mono } from 'next/font/google';

export const display = Gloock({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
});

export const serif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

export const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});
```

```tsx
// src/app/layout.tsx
import { display, serif, mono } from './fonts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

```js
// tailwind.config.ts (extract)
fontFamily: {
  display: ['var(--font-display)', 'serif'],
  serif:   ['var(--font-serif)', 'serif'],
  mono:    ['var(--font-mono)', 'monospace'],
}
```

## Type scale (recap)

| Token | Size | Where |
| --- | --- | --- |
| `text-display` | `clamp(4.5rem, 10vw, 11rem)` | Project name on hero |
| `text-h1` | `3rem` | Page section heads (use sparingly) |
| `text-h2` | `2rem` | Subsection heads |
| `text-italic-caption` | `clamp(1.125rem, 1.6vw, 1.5rem)` | Italic page subtitles |
| `text-body` | `1.0625rem` | Long-form prose |
| `text-small-caps` | `0.74rem` | Mono labels with `tracking: 0.18em` |

## Editorial rules of thumb

- **Display serif sets the temperature.** Use it generously and trackingly. A small Gloock title is rarely right; if it has to be small, switch to italic serif.
- **Italic serif whispers.** Reserve it for subtitles, captions, and the closing line of a page. Italic body is appropriate only for quotations and footnotes.
- **Small-caps mono labels.** Always uppercase, always wide-tracked (0.18em+). Used for metadata bars, sector labels, plate numbers.
- **No bold ever for emphasis.** If a sentence needs emphasis, italicise it. The site does not bold for stress; bolding is reserved for navigation labels and `<button>` content where weight signals interactivity.
- **No underlines except on links.** And those use the project accent colour, not the default browser blue.

## Performance

- All three families load via `next/font` with `display: 'swap'` and subset to Latin only.
- Preconnect to `fonts.googleapis.com` and `fonts.gstatic.com` is automatic via `next/font`.
- Total font payload should be under 80 KB across the three families. If it isn't, drop a weight.

## Pairings — quick reference

| Scenario | Recipe |
| --- | --- |
| Project name + italic subtitle | Gloock 6rem + IBM Plex Serif Italic 1.5rem, centred |
| Annotation card header | IBM Plex Mono 0.74rem small-caps + Gloock 3rem (the numeral) |
| Body paragraph | IBM Plex Serif 1.0625rem, line-height 1.6, `--ink-cool` on `--bg-deep` |
| Inline citation | IBM Plex Mono 0.7rem superscript, `--copper` |
| Closing italic line | IBM Plex Serif Italic clamp(1.125rem, 2vw, 1.75rem), centred, generous space above |

If a pairing isn't here, you probably don't need it. Defer to one of the recipes above.
