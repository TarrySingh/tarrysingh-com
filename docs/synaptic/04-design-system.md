# 04 · Design system — Synaptic Cartography

The visual language is already shipped in `proposals/MEMPHIS/plate.png` and `proposals/SYMPHONY/plate.png`. This doc codifies it.

---

## Identity

**Series name:** Synaptic Cartography.
**Tagline (internal only, never on the site):** *Plates from a studio that takes its time.*

Two project palettes live inside one studio palette. MEMPHIS is *warm-midnight* (amber bloom dominant); SYMPHONY is *cool-indigo* (lavender baton accent). The cover page sits between them visually.

---

## Colour tokens

These are the source of truth. They live in `design/tokens.css` and `design/tokens.ts`.

### Studio (shared)

| Token | Value | Use |
| --- | --- | --- |
| `--bg-deep` | `#0c1828` | Page background, default |
| `--bg-mid` | `#14223b` | Card backgrounds, gradient bottoms |
| `--ink` | `#f6ead0` | Primary text |
| `--ink-soft` | `#d7c8aa` | Secondary text |
| `--ink-cool` | `#c4d2e1` | Body prose on dark |
| `--hairline` | `rgba(230, 214, 180, 0.45)` | Editorial rules |
| `--copper` | `#c98e4f` | Accent strokes |
| `--gold` | `#b89256` | Memristor wires, thin lines |

### MEMPHIS

| Token | Value | Use |
| --- | --- | --- |
| `--memphis-amber` | `#e8b87a` | Primary warm accent |
| `--memphis-amber-hi` | `#ffd296` | Highlights, active firing |
| `--memphis-rose` | `#e5a896` | CA1 / replay |
| `--memphis-teal` | `#5aa9b8` | Verticals, behaviour |
| `--memphis-ceramic` | `#e0cfac` | Chip substrate |

### SYMPHONY

| Token | Value | Use |
| --- | --- | --- |
| `--symphony-bg-deep` | `#0d1027` | Page background on SYMPHONY pages |
| `--symphony-violet` | `#a698d4` | Task baton, conductor halo |
| `--symphony-violet-hi` | `#c8b8ff` | Active baton, pulse states |
| `--symphony-rationale` | `#f4c482` | Ring I |
| `--symphony-historical` | `#e5a896` | Ring II |
| `--symphony-behavioural` | `#6cb4c2` | Ring III |
| `--symphony-structural` | `#849cc8` | Ring IV |

Never invent a colour outside this list. Never saturate beyond the values given.

---

## Typography

Three families. No exceptions.

| Family | Use | Weight | Tracking |
| --- | --- | --- | --- |
| **Gloock** | Project names, large numerals (O1, plate numerals) | Regular only | 0.06–0.08em |
| **IBM Plex Serif** | Body prose, italic captions, italic subtitles | Regular + Italic + Bold | Default |
| **IBM Plex Mono** | Labels, plate metadata, small caps, technical annotations | Regular + Bold | 0.18em for small caps |

If Gloock is unavailable in a context, fall back to *Italiana* or *Cormorant Garamond* — both share its high-contrast modern feel. Never fall back to Times.

### Scale (rem on a 16px root)

| Token | Size | Use |
| --- | --- | --- |
| `text-display` | clamp(4.5rem, 10vw, 11rem) | Hero project name |
| `text-h1` | 3rem | Page section heads (rarely used — prefer plate-style headers) |
| `text-h2` | 2rem | Subsection heads |
| `text-italic-caption` | clamp(1.125rem, 1.6vw, 1.5rem) | Italic page subtitles |
| `text-body` | 1.0625rem | Long-form prose |
| `text-small-caps` | 0.74rem | Mono labels |

---

## Spacing & rhythm

8px baseline. Use multiples: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`. Never `7`, never `15`. Long-form pages use a vertical rhythm of `1.6` line-height with `--space-paragraph: 1.4em`.

Editorial margins: `1.5rem` on mobile, `4rem` on tablet, `6rem`+ on desktop. The eye must rest.

---

## Motion

Slow ease curves only. Define three:

| Token | Value | Use |
| --- | --- | --- |
| `--ease-paper` | `cubic-bezier(0.16, 1, 0.3, 1)` | Soft "settle" — defaults to this |
| `--ease-baton` | `cubic-bezier(0.4, 0, 0.2, 1)` | Linear-ish for SYMPHONY baton transitions |
| `--ease-pulse` | `cubic-bezier(0.45, 0, 0.55, 1)` | Symmetric for breathing pulses |

Durations: `120ms` micro, `320ms` standard, `800ms` deliberate, `2500ms` ambient (e.g. pulse loops).

Never use a bouncy spring. Never use a transform that goes negative-and-back (overshoot). The site does not bounce.

---

## Component library (suggested)

Build these in this order. They unlock everything else.

1. **`<Hairline />`** — the `1px` rule with `linear-gradient(90deg, transparent, var(--hairline), transparent)`. Used everywhere.
2. **`<SmallCaps />`** — `<span>` with `font-mono`, `uppercase`, `tracking-[0.18em]`, `text-[0.74rem]`.
3. **`<ItalicCaption />`** — `<p>` with `font-serif italic`, configurable size token.
4. **`<NumberedDisk number tone="amber|rose|violet" />`** — used for O1–O5, callouts, movements.
5. **`<Cartouche title meta />`** — bordered rounded panel with a title bar and right-aligned meta. The "FIG. A · …" containers.
6. **`<Plate>` (wrapper)** — sets the studio header (PLATE I, ANNO 2026, FIG. 1.2.2), the title, and an italic subtitle row.
7. **`<ChipPlate />`** — the MEMPHIS interactive, lifted from `proposals/MEMPHIS/interactive.html`.
8. **`<Planisphere />`** — the SYMPHONY interactive, lifted from `proposals/SYMPHONY/interactive.html`.

Treat these as **read-only** once shipped: edits to `<Hairline />` ripple across every page.

---

## Voice & writing rules

(Mirrored in `CLAUDE.md`, repeated here so a designer who reads only this file still gets it.)

- Lead with the claim. Then evidence. Then caveat. Never reverse.
- One idea per paragraph; two short sentences beat one long one.
- Numbers earn their place with units and citations.
- British English. *Programme. Behaviour. Co-localised. Organisation.*
- Forbidden: emojis, exclamation marks, "powerful", "revolutionary", "game-changing", "leverage" (as verb), "unlock", "AI-powered", "next-generation".
- Each page ends with one italic line.

---

## Print-CSS

Every proposal page must export to a sensible PDF via the browser's "Print to PDF". Build `@media print` rules that:

- Hide nav and footer.
- Switch interactive plates to their static PNG fallback (load the `plate.png` instead).
- Force black-on-cream by toggling a `.print-mode` token set on `html`.
- Show full footnote text inline at the bottom of each section, not hover-revealable.

A reviewer must be able to print MEMPHIS or SYMPHONY as a 3-page brief and email it round.
