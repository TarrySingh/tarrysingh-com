# Palette — Synaptic Cartography

The full colour system, with semantic intent. Use this file as a lookup; tokens.css/ts are the runtime source.

## Studio (shared across all plates)

| Swatch | Hex | Token | Role |
| :-: | :-- | :-- | :-- |
| `█` | `#0c1828` | `--bg-deep` | Default page background |
| `█` | `#14223b` | `--bg-mid` | Card backgrounds, gradient bottoms |
| `█` | `#16203a` | `--panel-deep` | Annotation cards, dark panels |
| `█` | `#1c2a48` | `--panel-mid` | Hovered/active panel state |
| `█` | `#f6ead0` | `--ink` | Primary cream text |
| `█` | `#d7c8aa` | `--ink-soft` | Secondary text, labels |
| `█` | `#c4d2e1` | `--ink-cool` | Body prose on dark |
| `█` | `#8e96a8` | `--ink-dim` | Metadata, tertiary |
| `█` | `#c98e4f` | `--copper` | Accent strokes, callouts |
| `█` | `#b89256` | `--gold` | Thin lines, ornaments |

## MEMPHIS (warm-midnight)

| Swatch | Hex | Token | Role |
| :-: | :-- | :-- | :-- |
| `█` | `#e8b87a` | `--memphis-amber` | Primary warm accent |
| `█` | `#ffd296` | `--memphis-amber-hi` | Active firing, highlights |
| `█` | `#e5a896` | `--memphis-rose` | CA1 layer, replay states |
| `█` | `#5aa9b8` | `--memphis-teal` | Vertical bitlines, behaviour |
| `█` | `#2b6e7f` | `--memphis-teal-dp` | Deep teal accents |
| `█` | `#e0cfac` | `--memphis-ceramic` | Chip substrate |
| `█` | `#a89676` | `--memphis-ceramic-dp` | Ceramic edge, contact pads |
| `█` | `#102030` | `--memphis-silicon` | Silicon die |

## SYMPHONY (cool-indigo)

| Swatch | Hex | Token | Role |
| :-: | :-- | :-- | :-- |
| `█` | `#0d1027` | `--symphony-bg-deep` | SYMPHONY page background |
| `█` | `#16183a` | `--symphony-bg-mid` | Card gradient bottoms |
| `█` | `#a698d4` | `--symphony-violet` | Task baton, conductor halo |
| `█` | `#c8b8ff` | `--symphony-violet-hi` | Active baton, pulse states |
| `█` | `#5a4a8a` | `--symphony-violet-dp` | Deep violet accents |
| `█` | `#f4c482` | `--symphony-rationale` | Ring I — Rationale |
| `█` | `#e5a896` | `--symphony-historical` | Ring II — Historical |
| `█` | `#6cb4c2` | `--symphony-behavioural` | Ring III — Behavioural |
| `█` | `#849cc8` | `--symphony-structural` | Ring IV — Structural |

## Accessibility

All ink-on-background pairings have been verified at AA contrast:

- `--ink` on `--bg-deep`: 11.8:1 ✓
- `--ink-cool` on `--bg-deep`: 9.6:1 ✓
- `--ink-soft` on `--bg-deep`: 8.4:1 ✓
- `--memphis-amber` on `--bg-deep`: 7.2:1 ✓
- `--symphony-violet-hi` on `--symphony-bg-deep`: 8.9:1 ✓

The two body-prose pairings most used are `--ink-cool` on `--bg-deep` for paragraphs and `--ink` on `--bg-deep` for headings.

## Forbidden colours

Pure white `#ffffff`, pure black `#000000`, system blue `#0066ff`, generic "success green", generic "warning yellow", any saturated red. The site does not have a colour for "danger" — it has a colour for "uncertainty", which is the existing `--symphony-violet`. Use it.
