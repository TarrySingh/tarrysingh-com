/**
 * Synaptic Cartography — Design Tokens (TypeScript)
 *
 * Mirror of `tokens.css`. Use these in component code (Framer Motion variants,
 * inline SVG attributes, etc.) where CSS variables aren't ergonomic.
 *
 * Single source of truth: KEEP IN SYNC with tokens.css.
 */

export const palette = {
  studio: {
    bgDeep:    '#0c1828',
    bgMid:     '#14223b',
    panelDeep: '#16203a',
    panelMid:  '#1c2a48',
    panelEdge: 'rgba(78, 78, 130, 0.7)',
    ink:       '#f6ead0',
    inkSoft:   '#d7c8aa',
    inkCool:   '#c4d2e1',
    inkDim:    '#8e96a8',
    hairline:  'rgba(230, 214, 180, 0.45)',
    copper:    '#c98e4f',
    gold:      '#b89256',
  },
  memphis: {
    amber:     '#e8b87a',
    amberHi:   '#ffd296',
    rose:      '#e5a896',
    teal:      '#5aa9b8',
    tealDp:    '#2b6e7f',
    ceramic:   '#e0cfac',
    ceramicDp: '#a89676',
    silicon:   '#102030',
  },
  symphony: {
    bgDeep:      '#0d1027',
    bgMid:       '#16183a',
    violet:      '#a698d4',
    violetHi:    '#c8b8ff',
    violetDp:    '#5a4a8a',
    rationale:   '#f4c482',
    historical:  '#e5a896',
    behavioural: '#6cb4c2',
    structural:  '#849cc8',
    amber:       '#f4c482',
    amberHi:     '#ffd596',
  },
} as const;

export const fonts = {
  display: "'Gloock', 'Italiana', 'Cormorant Garamond', serif",
  serif:   "'IBM Plex Serif', 'Source Serif Pro', Georgia, serif",
  mono:    "'IBM Plex Mono', 'JetBrains Mono', ui-monospace, monospace",
} as const;

export const tracking = {
  display: '0.08em',
  mono:    '0.18em',
  tight:   '0.02em',
} as const;

export const motion = {
  ease: {
    paper: [0.16, 1, 0.3, 1] as const,
    baton: [0.4, 0, 0.2, 1] as const,
    pulse: [0.45, 0, 0.55, 1] as const,
  },
  duration: {
    micro:    0.12,
    standard: 0.32,
    slow:     0.8,
    ambient:  2.5,
  },
} as const;

export const space = {
  s1:  '0.25rem',
  s2:  '0.5rem',
  s3:  '0.75rem',
  s4:  '1rem',
  s6:  '1.5rem',
  s8:  '2rem',
  s12: '3rem',
  s16: '4rem',
  s24: '6rem',
  s32: '8rem',
} as const;

export const radius = {
  card:  '0.875rem',
  pill:  '9999px',
  tight: '0.375rem',
} as const;

/** Project-scoped accent helper. Use as `accent(project).primary`. */
export function accent(project: 'memphis' | 'symphony') {
  return project === 'memphis'
    ? { primary: palette.memphis.amber, primaryHi: palette.memphis.amberHi }
    : { primary: palette.symphony.violet, primaryHi: palette.symphony.violetHi };
}
