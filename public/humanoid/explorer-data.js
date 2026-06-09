/* ============================================================
   Value-Chain Explorer — data model
   Cost shares sum to 100. Actuators (arm+leg+hand) = 53%.
   risk = geographic / single-source supply dependency, 0–1.
   ============================================================ */
window.REGIONS = {
  brain: {
    id:"brain", cat:"The Brain · compute", name:"AI & semiconductors", share:9, risk:0.30,
    components:["VLA foundation models","Edge AI accelerators","Vision processors","HBM memory"],
    suppliers:["NVIDIA","Google DeepMind","Qualcomm","TSMC"],
    bottleneck:"Power-hungry GPUs cap real-time autonomy. Neuromorphic chips (Intel Loihi, IBM NorthPole) are the long-run fix.",
    geo:"US-led — NVIDIA & Google set the pace; China closing fast.", riskLabel:"Moderate"
  },
  sensors: {
    id:"sensors", cat:"The Body · perception", name:"Sensory system", share:9, risk:0.50,
    components:["RGB cameras","LiDAR","6-axis force/torque","Tactile skin (emerging)"],
    suppliers:["ATI / Novanta","Hypersen","Hesai (LiDAR)"],
    bottleneck:"High-resolution tactile 'skin' is still immature — the last gap before human-level dexterity.",
    geo:"Mixed — Western F/T sensing; LiDAR increasingly China-heavy.", riskLabel:"Elevated"
  },
  power: {
    id:"power", cat:"The Body · power", name:"Power & compute core", share:11, risk:0.40,
    components:["Battery pack","Onboard GPUs","Power electronics","Thermal management"],
    suppliers:["Varies by integrator","CATL / LG (cells)"],
    bottleneck:"Energy density limits uptime. Most platforms run 2–5 hours; battery-swap or docking is the workaround.",
    geo:"China leads cell manufacturing; compute is US-led.", riskLabel:"Moderate"
  },
  arm: {
    id:"arm", cat:"The Body · rotary actuators", name:"Arm actuators", share:16, risk:0.70,
    components:["Harmonic drives","Frameless torque motors","6-DoF wrists"],
    suppliers:["Harmonic Drive Systems (JP)","LeaderDrive (CN)","Kollmorgen"],
    bottleneck:"Zero-backlash harmonic drives are precise but costly; Japanese lead, Chinese rivals closing on price.",
    geo:"Japan-led, China rising — tariff-exposed if routed via China.", riskLabel:"High"
  },
  leg: {
    id:"leg", cat:"The Body · linear actuators", name:"Leg actuators", share:27, risk:0.90,
    components:["Planetary roller screws","Frameless torque motors","High-load bearings"],
    suppliers:["SKF","NSK","Hengli (CN)","Shanghai Beite (CN)"],
    bottleneck:"Planetary roller screws cost $1,350–2,700 each and are supply-constrained — the single biggest chokepoint.",
    geo:"China-dominated capacity — a direct dependency for the West.", riskLabel:"Critical"
  },
  hands: {
    id:"hands", cat:"The Body · dexterity", name:"Hand actuators", share:10, risk:0.60,
    components:["Coreless micro-motors","Tendon drives","Tactile fingertips"],
    suppliers:["In-house (Figure, Sanctuary)","Specialist motor makers"],
    bottleneck:"Fine manipulation in clutter remains unsolved; dexterity, not strength, gates home use.",
    geo:"Fragmented — much is integrator-proprietary.", riskLabel:"Elevated"
  },
  structure: {
    id:"structure", cat:"The Body · structure", name:"Frame & structure", share:18, risk:0.50,
    components:["Chassis & exoframe","Joints housing","Feet & end-stops","Wiring harness"],
    suppliers:["Die-cast / stamped (commoditizing)","Hyundai Mobis (integrated)"],
    bottleneck:"Lower-tech, but mass-manufacturable design (die-casting vs CNC) is where unit cost is being driven down.",
    geo:"Commoditizing — favors whoever owns the actuator chain.", riskLabel:"Moderate"
  }
};

window.RISK_STEPS = { Moderate:0.40, Elevated:0.58, High:0.74, Critical:0.92 };

// Figure layout — simple CSS primitives (rounded rects + circles). center x ≈ 200.
// Each shape belongs to a clickable zone (region id).
window.SHAPES = [
  // brain — head
  { region:"brain", r:"50%", style:{ width:96, height:96, top:6, left:152 } },
  // sensors — visor band over head
  { region:"sensors", r:"10px", style:{ width:78, height:18, top:56, left:161 } },
  // structure — neck
  { region:"structure", r:"5px", style:{ width:26, height:20, top:104, left:187 } },
  // power — torso
  { region:"power", r:"20px", style:{ width:150, height:194, top:122, left:125 } },
  // arm — shoulders
  { region:"arm", r:"50%", style:{ width:44, height:44, top:130, left:96 } },
  { region:"arm", r:"50%", style:{ width:44, height:44, top:130, left:260 } },
  // arm — upper arms
  { region:"arm", r:"19px", style:{ width:38, height:104, top:152, left:92 } },
  { region:"arm", r:"19px", style:{ width:38, height:104, top:152, left:270 } },
  // arm — forearms
  { region:"arm", r:"17px", style:{ width:34, height:100, top:252, left:94 } },
  { region:"arm", r:"17px", style:{ width:34, height:100, top:252, left:272 } },
  // hands
  { region:"hands", r:"50%", style:{ width:40, height:40, top:350, left:91 } },
  { region:"hands", r:"50%", style:{ width:40, height:40, top:350, left:269 } },
  // structure — pelvis
  { region:"structure", r:"14px", style:{ width:140, height:56, top:320, left:130 } },
  // leg — thighs
  { region:"leg", r:"24px", style:{ width:52, height:128, top:374, left:140 } },
  { region:"leg", r:"24px", style:{ width:52, height:128, top:374, left:208 } },
  // leg — shins
  { region:"leg", r:"22px", style:{ width:44, height:138, top:500, left:144 } },
  { region:"leg", r:"22px", style:{ width:44, height:138, top:500, left:212 } },
  // structure — feet
  { region:"structure", r:"8px", style:{ width:62, height:24, top:636, left:132 } },
  { region:"structure", r:"8px", style:{ width:62, height:24, top:636, left:206 } },
];

// display order for the BOM bar (head → toe)
window.BOM_ORDER = ["brain","sensors","power","arm","hands","leg","structure"];
