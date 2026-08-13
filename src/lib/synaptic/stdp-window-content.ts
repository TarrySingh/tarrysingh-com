/**
 * Sprint 8 — editable copy for the StdpWindow plate.
 * Every user-facing string in src/components/synaptic/StdpWindow.tsx
 * reads from this module.
 */

export const STDP_DISPLAY_NAME = "STDP Window · Memphis"

export const STDP_ARIA_LABEL =
  "STDP window, spike-timing dependent plasticity. Pre-before-post (Δt > 0) potentiates the synapse; post-before-pre (Δt < 0) depresses it. The exponential window is the learning primitive that MEMPHIS demands the memristive substrate produce intrinsically."

export const STDP_KICKER = "PLATE M-I · MMXXVI · FIG. 1.2.a"
export const STDP_HEADER_RIGHT = "SPIKE-TIMING DEPENDENT PLASTICITY · Δw vs Δt"
export const STDP_TITLE = "STDP, the learning primitive"

export const STDP_X_AXIS_LABEL = "Δt · MS (t_post − t_pre)"
export const STDP_Y_AXIS_LABEL = "Δw"

export const STDP_LTP_REGION_LABEL = "LTP · PRE → POST · POTENTIATION"
export const STDP_LTD_REGION_LABEL = "LTD · POST → PRE · DEPRESSION"

export const STDP_SPIKE_PAIR_LABEL = "SPIKE PAIR · t_pre · t_post"
export const STDP_PRE_LABEL = "PRE"
export const STDP_POST_LABEL = "POST"
export const STDP_MS_SUFFIX = "MS"

export const STDP_PANEL_REGIME_LABEL = "CURRENT REGIME"
export const STDP_REGIME_LTP_NAME = "Potentiation"
export const STDP_REGIME_LTD_NAME = "Depression"
export const STDP_REGIME_LTP_SUBTITLE = "LTP · pre before post"
export const STDP_REGIME_LTD_SUBTITLE = "LTD · post before pre"
export const STDP_DT_READOUT_LABEL = "Δt · t_post − t_pre"
export const STDP_MS_UNIT = "ms"
export const STDP_DW_READOUT_LABEL = "Δw · weight change"

export const STDP_FOOTER_CAPTION =
  "Scrub the curve. The substrate that learns is the one whose devices already obey this window, without an external trainer."
