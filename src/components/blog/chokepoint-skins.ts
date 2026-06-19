/**
 * chokepoint-skins — the four candidate visual directions for "The Chokepoint
 * Paradox", as one source of truth. Used by the live skin-switcher audition so
 * Tarry can flip the real hero + the real V1 instrument between directions and
 * decide from pixels. Once a direction is chosen, the winner's values get baked
 * into the `.syn-chokepoint` palette + chokepoint-kit and this file retires.
 *
 * Each skin drives BOTH the page chrome (hero) and the instrument palette, so a
 * whole-direction swap is exactly this: editing colour values in one place.
 */

import { paletteFor, type ReadMode } from "./read-chart-kit"
import type { CPPalette } from "./chokepoint-kit"

export type SkinKey = "atlas" | "noir" | "broadsheet" | "dossier"

export interface Skin {
  key: SkinKey
  name: string
  blurb: string
  mode: ReadMode
  titleFont: "sans" | "serif" | "mono"
  pageBg: string
  ink: string
  inkRGB: string
  muted: string
  kicker: string
  accent: string
  // instrument semantic accents
  leverage: string
  leverageHi: string
  squeeze: string
  squeezeHi: string
  wonder: string
  wonderHi: string
  // instrument frame
  figureBg: string
  figureBorder: string
  hair: string
  blueprint: string
}

export const SKINS: Record<SkinKey, Skin> = {
  atlas: {
    key: "atlas",
    name: "Atlas Luminous",
    blurb: "Warm-dark observatory — gold + soft cyan, glowing instruments. Wonder, then dread.",
    mode: "dark",
    titleFont: "sans",
    pageBg: "radial-gradient(ellipse at center 34%, #142a52 0%, #0c1a38 46%, #0a1024 100%)",
    ink: "#eef2ff",
    inkRGB: "238,242,255",
    muted: "rgba(238,242,255,0.66)",
    kicker: "#e6b45a",
    accent: "#6cc6e6",
    leverage: "#6cc6e6",
    leverageHi: "#9ad8ef",
    squeeze: "#f0708a",
    squeezeHi: "#f59ab0",
    wonder: "#e6b45a",
    wonderHi: "#f4cd86",
    figureBg: "#0d1a36",
    figureBorder: "rgba(120,170,230,0.24)",
    hair: "rgba(180,200,240,0.14)",
    blueprint: "rgba(120,170,230,0.18)",
  },
  noir: {
    key: "noir",
    name: "Capital Noir",
    blurb: "Cinematic, investigative — near-black, molten amber, one reserved transfer-red.",
    mode: "dark",
    titleFont: "sans",
    pageBg: "radial-gradient(ellipse at center 34%, #16161c 0%, #0e0e12 56%, #08080b 100%)",
    ink: "#f3efe6",
    inkRGB: "243,239,230",
    muted: "rgba(243,239,230,0.62)",
    kicker: "#e89a3c",
    accent: "#e2483f",
    leverage: "#e8a44a",
    leverageHi: "#f4c98a",
    squeeze: "#e2483f",
    squeezeHi: "#f0708a",
    wonder: "#e8a44a",
    wonderHi: "#f4c98a",
    figureBg: "#121216",
    figureBorder: "rgba(232,164,74,0.22)",
    hair: "rgba(243,239,230,0.12)",
    blueprint: "rgba(232,164,74,0.14)",
  },
  broadsheet: {
    key: "broadsheet",
    name: "The Broadsheet",
    blurb: "Luxury editorial, light — ivory paper, serif display, oxblood + gold gravitas.",
    mode: "light",
    titleFont: "serif",
    pageBg: "radial-gradient(ellipse at center 28%, #f8f3e9 0%, #f1ebdc 60%, #ece4d2 100%)",
    ink: "#1b1713",
    inkRGB: "27,23,19",
    muted: "rgba(27,23,19,0.6)",
    kicker: "#8a2f2a",
    accent: "#8a2f2a",
    leverage: "#a9772f",
    leverageHi: "#c89a4e",
    squeeze: "#8a2f2a",
    squeezeHi: "#b0473f",
    wonder: "#a9772f",
    wonderHi: "#c89a4e",
    figureBg: "#f7f2e7",
    figureBorder: "rgba(27,23,19,0.18)",
    hair: "rgba(27,23,19,0.12)",
    blueprint: "rgba(169,119,47,0.20)",
  },
  dossier: {
    key: "dossier",
    name: "The Dossier",
    blurb: "Declassified report, light — ivory, ink, classified-red stamps, monospace.",
    mode: "light",
    titleFont: "mono",
    pageBg: "linear-gradient(180deg, #ece9df 0%, #e6e3d8 100%)",
    ink: "#15151a",
    inkRGB: "21,21,26",
    muted: "rgba(21,21,26,0.6)",
    kicker: "#6a665a",
    accent: "#c0271f",
    leverage: "#15151a",
    leverageHi: "#3a3a40",
    squeeze: "#c0271f",
    squeezeHi: "#d8463d",
    wonder: "#c0271f",
    wonderHi: "#d8463d",
    figureBg: "#efece2",
    figureBorder: "rgba(21,21,26,0.18)",
    hair: "rgba(21,21,26,0.12)",
    blueprint: "rgba(21,21,26,0.14)",
  },
}

export const SKIN_ORDER: SkinKey[] = ["atlas", "noir", "broadsheet", "dossier"]

export function fontVar(f: Skin["titleFont"]): string {
  return f === "serif"
    ? "var(--font-serif), serif"
    : f === "mono"
      ? "var(--font-mono), monospace"
      : "var(--font-sans, var(--font-display)), sans-serif"
}

/** Build the instrument palette for a skin: the mode's neutral ink/scales,
 *  overridden with the skin's canvas + semantic accents. */
export function getSkinPalette(key: SkinKey): CPPalette {
  const sk = SKINS[key]
  const base = paletteFor(sk.mode)
  return {
    ...base,
    bg: sk.figureBg,
    border: sk.figureBorder,
    ink: sk.ink,
    inkRGB: sk.inkRGB,
    muted: sk.muted,
    soft: `rgba(${sk.inkRGB}, 0.42)`,
    hair: sk.hair,
    accent: sk.wonder,
    leverage: sk.leverage,
    leverageHi: sk.leverageHi,
    squeeze: sk.squeeze,
    squeezeHi: sk.squeezeHi,
    wonder: sk.wonder,
    wonderHi: sk.wonderHi,
    blueprint: sk.blueprint,
  }
}
