import { notFound } from "next/navigation"

/**
 * Catch-all under /synaptic that immediately triggers the
 * studio-palette not-found.tsx in this segment, so any wandered
 * path under the Synaptic Cartography tree gets the indigo +
 * copper reading-room 404 (not the cream-paper editorial one).
 */
export default function SynapticCatchAll(): never {
  notFound()
}
