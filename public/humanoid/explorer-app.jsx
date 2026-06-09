/* Value-Chain Explorer — app */
const { useState, useEffect, useCallback } = React;
const REGIONS = window.REGIONS, SHAPES = window.SHAPES, BOM_ORDER = window.BOM_ORDER, RISK_STEPS = window.RISK_STEPS;
const MAX_SHARE = Math.max(...Object.values(REGIONS).map(r => r.share));
const ACTUATOR_TOTAL = REGIONS.arm.share + REGIONS.leg.share + REGIONS.hands.share;

// first shape index per region → anchor for the floating label
const ANCHOR = {};
SHAPES.forEach((s, i) => { if (!(s.region in ANCHOR)) ANCHOR[s.region] = i; });

function lensFill(region, lens) {
  const r = REGIONS[region];
  if (lens === "cost") { const a = 0.15 + 0.64 * (r.share / MAX_SHARE); return `rgba(32,64,223,${a.toFixed(3)})`; }
  if (lens === "risk") { const a = 0.12 + 0.72 * r.risk; return `rgba(32,64,223,${a.toFixed(3)})`; }
  return "var(--paper-dark-2)";
}

function Figure({ selected, hovered, lens, onSelect, onHover }) {
  return (
    <div className="figure">
      <div className="spine"></div>
      {SHAPES.map((s, i) => {
        const isSel = s.region === selected;
        const isHov = s.region === hovered;
        const cls = "part" + (isSel ? " sel" : "");
        const style = {
          ...s.style, position: "absolute", borderRadius: s.r,
          background: lensFill(s.region, lens),
          borderColor: isSel ? "var(--accent-2)" : (isHov ? "var(--accent-3)" : "var(--rule-dark-2)"),
          transform: isHov && !isSel ? "scale(1.04)" : "none",
        };
        return (
          <div key={i} className={cls} style={style}
            onClick={() => onSelect(s.region)}
            onMouseEnter={() => onHover(s.region)}
            onMouseLeave={() => onHover(null)}>
            {ANCHOR[s.region] === i && (isHov || isSel) && (
              <span className="plabel" style={{ opacity: 1 }}>{REGIONS[s.region].name}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Intro() {
  return (
    <div className="intro">
      <p className="lead">A humanoid is a brain, a body, and an integrator — and <span className="accent">half its cost is in the muscles.</span></p>
      <p className="body">Click any part of the machine to inspect its share of the bill of materials, the components inside it, who supplies them, and where the bottleneck lies.</p>
      <p className="body">Switch the lens at top-right to recolor the whole body by <strong style={{color:"var(--ink-on-dark)",fontWeight:500}}>cost share</strong> or <strong style={{color:"var(--ink-on-dark)",fontWeight:500}}>supply risk</strong> — and watch where the value, and the vulnerability, concentrate.</p>
      <p className="cue">↖ Select a subsystem to begin</p>
    </div>
  );
}

function Detail({ region }) {
  const r = REGIONS[region];
  return (
    <div key={region} style={{ animation: "none" }}>
      <div className="pcat">{r.cat}</div>
      <h2 className="ptitle">{r.name}</h2>
      <div className="pshare">
        <span className="n">{r.share}%</span>
        <span className="u">of the bill of materials</span>
      </div>
      <div className="pbar"><div className="fill" style={{ width: (r.share / MAX_SHARE * 100) + "%" }}></div></div>

      <div className="block">
        <h4>Key components</h4>
        <div className="chips">{r.components.map((c, i) => <span key={i} className="chip">{c}</span>)}</div>
      </div>
      <div className="block">
        <h4>Leading suppliers</h4>
        <div className="chips">{r.suppliers.map((c, i) => <span key={i} className="chip">{c}</span>)}</div>
      </div>
      <div className="block">
        <h4>The bottleneck</h4>
        <div className="bottleneck"><p>{r.bottleneck}</p></div>
      </div>
      <div className="block" style={{ marginBottom: 0 }}>
        <h4>Who controls it — supply risk: {r.riskLabel}</h4>
        <span className="geo">
          <span className="riskdot" style={{ background: `rgba(32,64,223,${(0.3 + 0.7 * r.risk).toFixed(2)})`, boxShadow: r.risk > 0.8 ? "0 0 10px rgba(32,64,223,0.8)" : "none" }}></span>
          {r.geo}
        </span>
      </div>
    </div>
  );
}

function App() {
  const [selected, setSelected] = useState(() => localStorage.getItem("vce-sel") || null);
  const [lens, setLens] = useState(() => localStorage.getItem("vce-lens") || "cost");
  const [hovered, setHovered] = useState(null);

  useEffect(() => { selected ? localStorage.setItem("vce-sel", selected) : localStorage.removeItem("vce-sel"); }, [selected]);
  useEffect(() => { localStorage.setItem("vce-lens", lens); }, [lens]);
  useEffect(() => {
    const k = (e) => { if (e.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, []);

  const onSelect = useCallback((r) => setSelected((prev) => prev === r ? null : r), []);

  const lenses = [["cost", "Cost share"], ["risk", "Supply risk"], ["suppliers", "Suppliers"]];

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <span className="tick"></span>
          <h1>Value-Chain Explorer</h1>
          <span className="sub">The Humanoid Ascendancy</span>
        </div>
        <div className="lenswrap">
          <span className="lenslabel">Lens</span>
          <div className="seg">
            {lenses.map(([k, label]) => (
              <button key={k} className={lens === k ? "on" : ""} onClick={() => setLens(k)}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="main">
        <div className="stagewrap">
          <div className="hint" style={{ opacity: selected ? 0 : 0.8 }}>Click a subsystem · Esc to deselect</div>
          <Figure selected={selected} hovered={hovered} lens={lens} onSelect={onSelect} onHover={setHovered} />
        </div>
        <div className="panel">
          <div className="panel-inner">
            {selected ? <Detail region={selected} /> : <Intro />}
          </div>
        </div>
      </div>

      <div className="bom">
        <div className="bomhead">
          <span className="t">Bill of materials — share by subsystem</span>
          <span className="actu">Actuators (arms + legs + hands) = <b>{ACTUATOR_TOTAL}%</b></span>
        </div>
        <div className="bombar">
          {BOM_ORDER.map((id) => {
            const r = REGIONS[id];
            const a = 0.15 + 0.64 * (r.share / MAX_SHARE);
            const isSel = id === selected;
            return (
              <div key={id} className={"bomseg" + (isSel ? " sel" : "")}
                style={{ flexBasis: r.share + "%", background: `rgba(32,64,223,${a.toFixed(3)})`, opacity: selected && !isSel ? 0.45 : 1, outline: isSel ? "1px solid var(--accent-2)" : "none" }}
                onClick={() => onSelect(id)} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)}>
                <span className="pct">{r.share}</span>
                <span className="nm">{r.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="foot">
        <span>Tarry Singh — Embodied AI</span>
        <span>Source: Morgan Stanley “Humanoid 100” · figures illustrative, June 2026 · <a href="The Humanoid Ascendancy.html">← back to the deck</a></span>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
