/** Synthetic educational surfaces, arbitrary units; no field or flow data. */
export function reservoirHeight(x: number, z: number, layer: number, alternative: number) {
  return 1.2 - layer * 1.15 + .28 * Math.sin(x * .65) * Math.cos(z * .7) + alternative * .7 * Math.exp(-(x*x+z*z)/7)
}
