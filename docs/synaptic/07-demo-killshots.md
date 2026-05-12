# 07 · Demo kill-shots

The four moments on this site that will make a reviewer stop and screenshot. Engineer them deliberately. Everything else is supporting cast.

---

## Kill-shot 1 — The cover, in stillness

When the user lands on `/`, the two plate-cards must render **before any motion fires**. The first frame they see must already be the editorial composition. Then, ~400ms after paint:

- A single hairline rule appears at the top, animating in from a thin gradient (200ms, `ease-paper`).
- The italic captions beneath each card fade in last, with a 120ms stagger.

No bouncing, no zooming, no parallax. The page settles like a printed plate falling onto a desk.

**Test:** if you screenshot the page at exactly 300ms after load and at 1500ms after load, the two screenshots should differ only by the slow appearance of hairlines and captions. The hero content must be present at 300ms.

---

## Kill-shot 2 — The SYMPHONY task baton, swinging

On `/symphony`, the planisphere has the most demonstration value of any single element on the site. Engineer the interaction:

- Default state: baton points at LOCALISATION (sector 0). Three contiguous sectors glow amber.
- User clicks any other sector, e.g. REFACTORING.
- The amber "fan" *transitions* — not jumps — over ~800ms with `ease-baton`. The activation fan crossfades from the old position to the new while the dim nodes do nothing.
- The cross-ring filaments redraw smoothly.
- The side panel's "MOVEMENT" number updates with a `0.4s` crossfade.

The interaction must feel deterministic, not playful. Like watching a long-exposure photograph develop.

**Test:** the baton-swing should feel like an orchestra changing movements, not a slot-machine spinning.

---

## Kill-shot 3 — The MEMPHIS phase toggle

On `/memphis`, the AWAKE / SLEEP toggle is the single best summary of the entire proposal in one click. Engineer it like the closing line of a violin solo:

- AWAKE state: sparse, sharp amber spikes pulse asynchronously on the chip's CA3-CA1 module. The waveform below shows event-driven spikes.
- User clicks SLEEP.
- Over ~1s, the spike pattern slowly resolves into a smooth radial wave sweeping outward from the module's centre. The waveform crossfades to sinusoidal replay.
- The italic body copy under the toggle changes (with a 0.4s crossfade) from *"Sparse, salient spikes propagate through CA3 → CA1. Energy is spent only on novelty."* to *"Intrinsic dynamics replay and consolidate. The system learns without external input."*

This is the only interaction on the entire MEMPHIS page that earns this level of choreography. Don't dilute it by motion-decorating other elements.

---

## Kill-shot 4 — The print

A reviewer hits `⌘P` on `/memphis` or `/symphony`. The browser preview shows a clean three-page PDF, black-on-cream, the static plate at the top, prose flowing below, footnotes inline at the bottom. No nav, no footer-fluff, no hover effects, no half-cropped interactives.

This is the kill-shot that wins the silent vote in the panel meeting Tarry isn't in. **Build the print CSS in Phase 2, don't postpone it.**

**Test:** print MEMPHIS and SYMPHONY to PDF. Send the PDFs to a friend. If their reply is "wait, this came from a website?", the kill-shot landed.

---

## Anti-kill-shots (do not build these)

- Auto-rotating hero carousel.
- Particle-trail mouse cursor.
- Scroll-jacked sections.
- A loading screen with the brand name and a spinner.
- Any `<marquee>`-style scrolling text.
- Confetti, fireworks, or any congratulatory animation.
- A "we use cookies" banner. (We don't.)

---

## What success of the kill-shots looks like

After launch, ask Tarry to share two specific datapoints from inbound replies:

1. **Did anyone forward the URL with the phrase "this is the kind of thing I want to see more of"?** That is kill-shot 1 landing.
2. **Did anyone screenshot the SYMPHONY planisphere and reply with the screenshot attached?** That is kill-shot 2 landing.

If both happen within the first two weeks of soft-launch, the site has done its job.
