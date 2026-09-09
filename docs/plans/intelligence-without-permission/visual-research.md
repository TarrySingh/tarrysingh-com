# Scientific visualization benchmarks and the Synaptic instrument system

The most useful reference for this article is a scientific instrument embedded in a good explanation. A reader should be able to change an input, see which part of the object changes, inspect the corresponding measurement and understand the limits of the result. Rendering quality matters because it makes structure legible. It does not replace the underlying relationship.

This review combines primary documentation, original interactive publications and browser inspection. It is not a controlled usability study, a performance ranking or a claim that a small article-specific viewer replaces mature scientific software. Its purpose is to establish a demanding, practical standard for the ten 3D studies in *Intelligence Without Permission*.

## Reference systems

| Reference | Strength relevant to this article | Adaptation in the new instruments | Boundary |
|---|---|---|---|
| Bartosz Ciechanowski, *Airfoil* | A sequence of manipulable explanations makes an unfamiliar physical relationship approachable. Different visual encodings answer different questions. | Give each instrument one explicit question, three starting experiments and an observation connected to the current state. | The article’s vortex is parametric geometry, not Ciechanowski’s fluid demonstration and not a Navier–Stokes solver. |
| Ciechanowski, *Naval Architecture* | Physical objects become understandable through a carefully staged explanation. | Use an exploded assembly to expose interfaces; make the geological section a solid block that can be opened. | Do not add computed engineering performance without a suitable model. |
| Mol* Viewer | Selection, measurements, representations and saved states make a molecular scene useful beyond its initial appearance. | Link residue and ligand-atom selection to coordinates, a profile and exact readouts. Save settings and provide a link that restores them. | These are focused examples, not a replacement for Mol*’s molecular analysis capabilities. |
| Mol* Mesoscale Explorer | Camera, clipping, shading and label choices support the perception of complex spatial structure. | Offer named views, accessible zoom and rotation, optional scene labels and a restrained lighting treatment. | Avoid a wall of rendering controls that distracts from the scientific question. |
| VTK.js | Its examples expose clipping, reslicing and other spatial operations as explicit widgets. | Make a geological section and a zeta slice correspond to an adjacent chart. | A synthetic geological block is not a medical volume or a field-calibrated reservoir. |
| MathBox | Mathematical relationships, coordinate systems, labels and slices belong in the visualization itself. | Show the zeta domain, selected real coordinate, known zero locations and untransformed magnitudes together. | A finite numerical picture cannot establish a global theorem. |
| Distill, *Feature Visualization* | The explanation and the interactive evidence are closely connected. | Put the interpretation and method next to each instrument, rather than treating visuals as decoration between paragraphs. | An appealing visual pattern must not be presented as stronger evidence than its provenance permits. |
| Three.js official guidance | Rendering on demand and explicit resource disposal suit document-like applications. | Keep one active WebGL instrument, retain its camera and renderer during control changes, instance repeated primitives and dispose replaced scenes. | The final experience still requires browser testing on real hardware; source inspection alone does not establish responsiveness. |

Sources: [Airfoil](https://ciechanow.ski/airfoil/), [Naval Architecture](https://ciechanow.ski/naval-architecture/), [Mol* common actions](https://molstar.org/viewer-docs/common-actions/), [Mol* viewer controls](https://molstar.org/viewer-docs/), [Mol* viewport settings](https://molstar.org/me-docs/viewport/), [VTK.js examples](https://kitware.github.io/vtk-js/examples/), [MathBox](https://github.com/unconed/mathbox), [Distill: Feature Visualization](https://distill.pub/2017/feature-visualization/), [Three.js: rendering on demand](https://threejs.org/manual/en/rendering-on-demand.html), [Three.js: disposal](https://threejs.org/manual/en/how-to-dispose-of-objects.html).

## Findings

### A control needs a consequence

Ciechanowski’s *Airfoil* distinguishes arrows that describe a field, markers that follow motion and colours that encode magnitude. This is an example of choosing a representation for a question, rather than making every available representation visible at once. Its prose also explains the simplifying assumptions around the demonstrations. The relevant lesson is editorial discipline: a control should change something the reader is prepared to interpret. [Airfoil](https://ciechanow.ski/airfoil/)

For this article, a knob marked “viscosity” would be misleading on a decorative spiral. Twist and contraction are honest controls for a parametric curve. Likewise, a generic motor may expose a winding or rotate a rotor, but it cannot honestly report efficiency without an electromagnetic and loss model. The visual upgrade therefore expands the number of meaningful investigations without inventing scientific results to populate a dashboard.

The selected controls fall into three categories. Data selection chooses a residue, atom, interval or section from a declared dataset. Scenario inputs change an explicitly stated assumption, such as checking capacity. Presentation controls change framing, separation, visibility or exaggeration. These categories should remain distinguishable in the labels and methods even when they share the same interface.

### Selection should travel across views

Mol* documents structural selection, clipping, transparency and session/state saving. Its viewer also identifies molecular features under the pointer. These functions turn a rendering into an environment for inspection. The value is the connection between a visible part, its identity and a question about it. [Mol* common actions](https://molstar.org/viewer-docs/common-actions/), [Mol* viewer controls](https://molstar.org/viewer-docs/)

The protein study adopts a deliberately narrow version of that pattern. The selected residue appears in the molecular scene, on the displacement profile and in a four-part readout. The experimental-versus-predicted displacement is calculated from aligned coordinates. The confidence score is displayed separately because it answers a different question. The binding study connects a ligand-atom selection to its nearest stored protein neighbour and the selected proximity threshold.

Selection must also work without a pointer. A labelled native range input supplies the same residue or atom selection as the 3D picking interaction. The chart is an additional route into the data, not the only accessible route. This matters on a long publication where readers arrive with different devices and different levels of familiarity with spatial viewers.

### A section is more revealing than another camera angle

The VTK.js gallery includes clipping and reslice-cursor examples. MathBox provides primitives for coordinates, slices and labels. Both support a useful distinction: moving the camera changes how an object is seen; changing a section changes which part of its data is being examined. [VTK.js examples](https://kitware.github.io/vtk-js/examples/), [MathBox primitives](https://github.com/unconed/mathbox/blob/master/docs/primitives.md)

The geological study therefore has an actual section position, with its unexaggerated profile beside the 3D block. The zeta study selects a real coordinate and plots magnitude over the selected imaginary interval. The crystal study reveals a partial block while keeping the periodic site count distinct from the visible boundary-inclusive count. These are three different operations; using the same visual vocabulary does not make their scientific meanings interchangeable.

For the zeta figure, the 3D height transform helps show the landscape, but the linked chart retains the original magnitude. The display exaggeration never changes the reported values. The dense critical-line samples and the coarser surface samples are also identified separately. This prevents a visually smooth surface from quietly implying more numerical resolution than was calculated.

### Realistic geology needs a distinction between surface and subsurface

Cesium can render terrain and drape imagery over it. Its broader 3D ecosystem can also host supplied 3D content. Those capabilities are useful when a publication has a real location, surface model and spatial dataset. A terrain layer alone does not specify the strata underneath it. [Cesium terrain](https://cesium.com/learn/cesiumjs-learn/cesiumjs-terrain/), [Cesium 3D tiling](https://cesium.com/learn/3d-tiling/)

USGS describes three-dimensional geological models as representations of subsurface bodies and maintains an inventory of published models. The agency’s examples make clear why provenance matters: such models encode geological interpretations and supporting information, rather than simply extending the colours of a basemap downwards. [USGS inventory](https://www.usgs.gov/tools/usgs-3d-geologic-model-inventory), [USGS report](https://pubs.usgs.gov/publication/dr1183/full)

The current essay does not name a field or supply borehole and seismic data. Its geological instrument therefore retains the existing synthetic horizon equation. The upgrade closes the surfaces into a sedimentary block, adds procedural grain and bedding, exposes the cut faces and draws the well intersection. Sandstone, shale and limestone appearances are illustrative material treatments. They do not identify a measured formation, location, age, porosity or fluid content.

That decision keeps the scene visually convincing without borrowing authority from an unrelated real place. A later field-specific edition could replace the synthetic geometry with a licensed, documented model. The interface would still be useful: a section, a well trajectory, units, linked profiles and an explicit distinction between observations and interpretation.

### Lighting should clarify the object

Mol*’s viewport documentation treats ambient occlusion, shadows, outlines, projection and clipping as separate choices, with quality and performance tradeoffs. That is a better model than applying every cinematic effect simultaneously. The aim is to make the form understandable at the scale at which it is read. [Mol* viewport settings](https://molstar.org/me-docs/viewport/)

The Synaptic instruments use a dark scientific workspace, warm/cool directional lighting, restrained glow, a quiet spatial reference plane and projected labels. Molecules need separation between nearby elements. A solid geological block needs material and face definition. A function surface needs a legible highlighted slice. The same lighting family ties the publication together, but the geometry and annotations remain specific to the question.

There is no automatic camera spin. Readers control the object. Named front, top and isometric views give them an immediate route back to a useful orientation. An expanded view creates room for inspection, while the default scene remains part of the surrounding essay.

### The article needs reproducibility and an exit

Saved states are valuable because a reader can preserve the exact question they were exploring. The new tools export settings, readouts, method and source information as JSON. Shared links restore the control state. Image export provides a useful picture, while the companion settings file preserves what the picture means. Camera orientation is deliberately excluded from the shared-state claim and disclosed as such.

A reader must also be able to leave the instrument and continue the essay. At the author’s request, the active canvas captures ordinary wheel scrolling for zoom; moving the pointer outside the canvas restores article scrolling. Only one 3D scene is active at a time. Source-derived preview images show the default view without allocating ten simultaneous renderers. A static explanation remains available for printing and for devices that cannot create a WebGL context.

These choices follow the document-like use cases discussed in the Three.js rendering-on-demand guide. Explicit disposal matters when readers move between instruments, because a JavaScript object becoming unreachable is not by itself a complete GPU resource-management strategy. [Rendering on demand](https://threejs.org/manual/en/rendering-on-demand.html), [Resource disposal](https://threejs.org/manual/en/how-to-dispose-of-objects.html)

## Implementation contract

| Instrument | Investigations | Linked evidence |
|---|---|---|
| Permission boundary | Select a stage; expose dependency paths; separate the stages | Stage-specific explanation and obligations; no invented quantitative output |
| Vortex | Change twist and contraction; move a section; change displayed filament density | Radius profile, section radius, exit/entry area ratio and number of turns |
| Zeta landscape | Select σ; isolate an interval; inspect mesh and height exaggeration | Untransformed magnitude profile, sample count and known zeros in the selected interval |
| Protein comparison | Superimpose or separate; select residue; change confidence/displacement colour; inspect atoms and vectors | Aligned RMSD, residue identity, local coordinate difference and prediction confidence |
| Molecular contact | Select atom; tighten the contact threshold; isolate ligand or neighbourhood | Nearest stored-neighbour distance and visible-neighbour count |
| Crystal | Replicate cells; reveal a partial block; show boundaries and neighbour links | Periodic site count, displayed site count, measured cell length and derived nearest-neighbour distance |
| Agent laboratory | Change population, distinctness, checking capacity and assumed acceptance | Checking plateau, provisional output and candidates waiting beyond the day’s capacity |
| Metrology | Change synthetic translation, rotation and distortion; apply a known-error correction | Before/after displacement profiles and RMS over the same sample grid |
| Motor assembly | Separate parts; rotate rotor; remove housing, cutaway and windings | Explicit component obligations and the statement that performance is not calculated |
| Geological section | Blend alternative geometries; move section and well; reveal the block; adjust exaggeration | Four unexaggerated horizon profiles and the change in well intersection |

Every instrument also receives three guided starting states, a reset, view controls, optional labels, an expanded inspection mode, saved-readout comparison, shareable controls, settings export and an image export. These are acceptance requirements, not a count of decorative interface elements.

## Review standard

Completion requires a rendered review of all ten instruments; a check that controls change the intended object or measurement; a mobile pass; keyboard operation; no page-level hydration or runtime errors attributable to this work; readable labels and legends; and a documented production build. Tests must cover numerical invariants and meaningful boundaries, including the checking-capacity ceiling, coordinate-distance calculations, crystal periodicity and the distinction between display exaggeration and geological measurements.

The appropriate comparative claim is a stronger article-specific experience than the earlier rotation-only studies. Whether readers find it exceptional needs reader evidence. The implementation should earn that response through coherent experiments, visible craftsmanship and an argument whose figures can be interrogated.

## Review provenance

Primary documentation and publications were reviewed on 9 September 2026. Browser inspection included the *Airfoil* opening demonstration and the Mol*/VTK page layouts. The Mol* initial page had no structure loaded, and the VTK reslice demonstration did not render data in that inspection; those two systems’ capabilities above are attributed to their documentation, not claimed as independently benchmarked. No peer images or code were copied into the article. The new cover is original AI-generated conceptual artwork; scientific scenes and geological textures are generated from the documented coordinates or equations.

## Additional visual reference: OpenAI’s Navier–Stokes article

The requested reference is [OpenAI’s 8 September 2026 publication](https://openai.com/index/navier-stokes-solution/). Its caption explicitly assigns orange to faster angular rotation and teal to slower rotation; it also distinguishes angular rotation from circulating speed, which depends on radius. That is a useful standard for meaningful colour. The browser showed an access-check page, so the reference’s visual encoding was assessed through the available article text, not a completed interactive inspection.

The Synaptic revision adds stronger spectral encodings to the zeta landscape, parametric vortex, molecular comparison and synthetic metrology field. Their scales name what is encoded. The vortex’s colour describes a geometric coordinate or filament family, not angular velocity: the instrument does not solve the fluid equations. The crystal can distinguish its two carbon sublattices without implying two chemical species. All ten studies expose keyboard zoom buttons, magnification from 50–200%, and touch pinch zoom; ordinary wheel scrolling zooms an active scene without a modifier key, and scrolling outside the scene moves through the essay.
