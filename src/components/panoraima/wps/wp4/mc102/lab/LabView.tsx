"use client"

import { useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import type { MC102Graph } from "@/lib/panoraima/types"
import type { HoverInfo } from "./ConflictMap3D"
import ConflictMap2D from "./ConflictMap2D"
import s from "./lab.module.css"

const ConflictMap3D = dynamic(() => import("./ConflictMap3D"), { ssr: false })

function webglAvailable(): boolean {
  try {
    const c = document.createElement("canvas")
    const gl = c.getContext("webgl2") || c.getContext("webgl")
    if (!gl) return false
    ;(gl as WebGLRenderingContext).getExtension("WEBGL_lose_context")?.loseContext()
    return true
  } catch {
    return false
  }
}

const YEARS = [2009, 2010, 2011, 2012, 2013, 2014, 2015]

export default function LabView({ graph }: { graph: MC102Graph }) {
  const [mode, setMode] = useState<"3d" | "2d">("3d")
  const [webgl, setWebgl] = useState<boolean | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [theme, setTheme] = useState<number | null>(null)
  const [showLocal, setShowLocal] = useState(true)
  const [showCross, setShowCross] = useState(true)
  const [zExag, setZExag] = useState(1.6)
  const [timeMax, setTimeMax] = useState(2015)
  const [hover, setHover] = useState<HoverInfo | null>(null)

  useEffect(() => {
    const ok = webglAvailable()
    setWebgl(ok)
    if (!ok) setMode("2d")
  }, [])

  const stranded = useMemo(
    () => graph.themeStats.filter(t => t.cross === 0),
    [graph.themeStats],
  )

  const show3d = mode === "3d" && webgl === true && !err

  return (
    <div className={s.lab}>
      <div className={s.wrap} style={{ paddingTop: "5.5rem", paddingBottom: "3rem" }}>
        <p className={s.eyebrow}>
          <Link href="/experiments/panoraima/wps/wp4/mc-102" style={{ color: "inherit" }}>
            ← MC-102
          </Link>
          {"  ·  Argument mining lab"}
        </p>
        <h1 className={s.h1}>Where the two camps actually met</h1>
        <p className={s.lede}>
          Every argumentative unit the model found in the Paks II debate, placed by when it
          was said, which camp said it, and what it was offered in support of. The gap down
          the middle is what an attack has to cross.
        </p>

        <div className={s.callout} style={{ marginTop: "1.4rem" }}>
          <h2>Every edge here was drawn by the model.</h2>
          <p>
            {graph.meta.note} So this is one graph, labelled as the model&rsquo;s, not a
            comparison. Where a theme has claims on one side and nothing opposite, that is
            the corpus, not a rendering choice: unanswered themes are kept visible rather
            than filtered away for being empty.
          </p>
        </div>
      </div>

      <div className={s.wrap} style={{ paddingBottom: "4rem" }}>
        <div className={s.instrument}>
          <div className={s.instrumentHead}>
            <h2 className={s.instrumentTitle}>Conflict map</h2>
            <span className={s.small}>
              {graph.meta.n_nodes} units · {graph.meta.n_local} local links ·{" "}
              {graph.meta.n_cross} cross-camp oppositions
            </span>
            <span className={s.instrumentNote}>
              {show3d ? "drag to orbit, scroll to zoom" : "table view"}
            </span>
          </div>

          {show3d ? (
            <div className={s.canvasWrap}>
              <ConflictMap3D
                graph={graph}
                themeFilter={theme}
                showLocal={showLocal}
                showCross={showCross}
                zExag={zExag}
                timeMax={timeMax}
                onHover={setHover}
                onError={m => setErr(m)}
              />
              {hover && (
                <div className={s.hoverBox}>
                  <p className={s.hoverMeta}>
                    <span>{hover.node.label}</span>
                    <span>{hover.node.community}</span>
                    <span>{hover.node.date}</span>
                    <span>{hover.node.theme}</span>
                  </p>
                  <p style={{ margin: 0 }}>{hover.node.text}</p>
                </div>
              )}
              {!hover && (
                <p className={s.hoverMeta} style={{ position: "absolute", left: "0.9rem", top: "0.8rem" }}>
                  hover a unit to read it
                </p>
              )}
            </div>
          ) : (
            <div style={{ padding: "0.9rem" }}>
              {webgl === false && (
                <p className={s.small} style={{ marginTop: 0 }}>
                  WebGL is unavailable in this browser, so the table is shown instead. It
                  carries the same finding.
                </p>
              )}
              {err && (
                <p className={s.small} style={{ marginTop: 0, color: "var(--refuse)" }}>
                  {err} Showing the table instead.
                </p>
              )}
              <ConflictMap2D graph={graph} />
            </div>
          )}

          <div className={s.controls}>
            <div className={s.control}>
              <span className={s.controlLabel} id="lab-theme-l">Theme</span>
              <select
                aria-labelledby="lab-theme-l"
                className={s.select}
                value={theme === null ? "" : theme}
                onChange={e => setTheme(e.target.value === "" ? null : Number(e.target.value))}
              >
                <option value="">All eight themes</option>
                {graph.meta.themes.map((t, i) => (
                  <option key={t} value={i}>{t}</option>
                ))}
              </select>
              <p className={s.controlNote}>Others dim rather than vanish, so the column stays legible.</p>
            </div>

            <div className={s.control}>
              <span className={s.controlLabel} id="lab-edges-l">Relations</span>
              <div className={s.segmented} role="group" aria-labelledby="lab-edges-l">
                <button type="button" aria-pressed={showLocal} onClick={() => setShowLocal(v => !v)}>
                  Support
                </button>
                <button type="button" aria-pressed={showCross} onClick={() => setShowCross(v => !v)}>
                  Opposition
                </button>
              </div>
              <p className={s.controlNote}>
                Support links sit inside a camp. Opposition crosses between them.
              </p>
            </div>

            <div className={s.control}>
              <label className={s.controlLabel} htmlFor="lab-time">
                Up to {Math.floor(timeMax)}
              </label>
              <input
                id="lab-time" className={s.range} type="range"
                min={2009} max={2015} step={0.25} value={timeMax}
                onChange={e => setTimeMax(Number(e.target.value))}
              />
              <p className={s.controlNote}>Sweep the debate forward in time.</p>
            </div>

            <div className={s.control}>
              <label className={s.controlLabel} htmlFor="lab-z">Depth exaggeration</label>
              <input
                id="lab-z" className={s.range} type="range"
                min={0.4} max={4} step={0.1} value={zExag}
                onChange={e => setZExag(Number(e.target.value))}
                disabled={!show3d}
              />
              <p className={s.controlNote}>How tall a stack of premises reads.</p>
            </div>

            <div className={s.control}>
              <span className={s.controlLabel} id="lab-mode-l">View</span>
              <div className={s.segmented} role="group" aria-labelledby="lab-mode-l">
                <button type="button" aria-pressed={mode === "3d"} disabled={webgl === false}
                        onClick={() => { setErr(null); setMode("3d") }}>
                  3D
                </button>
                <button type="button" aria-pressed={mode === "2d"} onClick={() => setMode("2d")}>
                  Table
                </button>
              </div>
              <p className={s.controlNote}>
                {webgl === false ? "WebGL unavailable here." : "The table carries the same finding."}
              </p>
            </div>
          </div>

          <div className={s.legend}>
            <span className={s.legendItem}><span className={s.swatch} style={{ background: "#c98a4b" }} />Government</span>
            <span className={s.legendItem}><span className={s.swatch} style={{ background: "#79b57e" }} />Opposition</span>
            <span className={s.legendItem}><span className={s.swatch} style={{ background: "#8f9cc4" }} />Transparency</span>
            <span className={s.legendItem}><span className={s.swatchLine} style={{ borderTopColor: "#5e6a73" }} />supports</span>
            <span className={s.legendItem}><span className={s.swatchLine} style={{ borderTopColor: "#d4574e" }} />opposes</span>
            <span className={s.legendItem}>large sphere = claim · small = premise</span>
          </div>
        </div>

        {/* the ledger states the finding in words, because a picture is not a result */}
        <div className={s.grid2} style={{ marginTop: "1.5rem" }}>
          <div className={s.instrument}>
            <div className={s.instrumentHead}>
              <h2 className={s.instrumentTitle}>Engagement by theme</h2>
            </div>
            <ConflictMap2D graph={graph} />
          </div>

          <div className={s.instrument}>
            <div className={s.instrumentHead}>
              <h2 className={s.instrumentTitle}>What the shape says</h2>
            </div>
            <div style={{ padding: "0.9rem", fontSize: "0.88rem", color: "var(--ink-2)" }}>
              <p style={{ marginTop: 0 }}>
                The camps argue hardest about money and secrecy. Cost and public finance
                carries the most oppositions, and transparency the second most, which is
                where the freedom-of-information litigation sits.
              </p>
              <p>
                {stranded.length} of the eight themes have no opposition at all. The sharpest
                is <strong>environment and renewables</strong>: 20 opposition claims and{" "}
                <strong>zero</strong> from government. The government never answers on that
                ground. Symmetrically, it makes 17 claims about jobs and industry that nobody
                contests.
              </p>
              <p style={{ marginBottom: 0 }}>
                That asymmetry is what &ldquo;talking past each other&rdquo; looks like when
                it is measured rather than asserted. It is also the part most in need of the
                annotator&rsquo;s check, because an opposition the model failed to notice
                looks identical here to one that was never made.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
