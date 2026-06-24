import type { ReactNode } from "react"

import { BrainDrainTide } from "./BrainDrainTide"
import { VanishingPaycheck } from "./VanishingPaycheck"
import { FinishingSchool } from "./FinishingSchool"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * CHAPTER 6 — The Brains We Rent Out: Talent.
 * The input underneath all the others — people — trained at Europe's expense
 * and rented to the firms that buy the rest. Figures verified to July 2026
 * (Stanford AI Index 2026; Atomico; Interface EU; WIPO/EPO; EC). V21/V22/V23.
 */
export function ChokepointChapterSix() {
  return (
    <section id="chapter-6">
      <ChapterMark kicker="Chapter Six · The Finishing School" title="The Brains We Rent Out" />

      <Prose>
        <Lead>
          Strip the savings, the companies and the machine away and you reach the input underneath all of
          them: people. This is the resource Europe is most lavishly endowed with &mdash; it educates,
          freely or nearly so, some of the finest scientific and engineering minds on the planet &mdash;
          and it is the one it exports most carelessly of all. Europe runs, in effect, the world&rsquo;s
          finishing school: it takes in the raw talent, polishes it to a global shine at public expense,
          and then watches it graduate to be paid, patented and capitalised somewhere else. You cannot
          lose a capital war and a talent war and expect to win anything in between.
        </Lead>

        <P>
          The mechanism is almost insultingly simple: money. A senior AI researcher in a European hub
          earns total compensation somewhere around <Sq>&euro;120,000 to &euro;180,000</Sq> &mdash; good
          money, a fine living. The same person at an American frontier lab earns <Lev>$600,000 to over
          $1,000,000</Lev>. Not a premium; a multiple &mdash; three to five times, and far more at the
          very top. There is no mystery about why the best leave; the only mystery is why anyone expects
          them to stay. Move the slider below and watch the paycheck multiply as the researcher crosses
          the Atlantic &mdash; same person, same skills, a different zero.
        </P>
      </Prose>

      <Figure>
        <VanishingPaycheck />
      </Figure>

      <Prose>
        <P>
          So they go, and the tide is measurable. Europe&rsquo;s net inflow of tech talent &mdash; the
          balance of who arrives versus who leaves &mdash; <Sq>halved in two years, from about +52,000 in
          2022 to +26,000 in 2024</Sq>, and on the AI frontier Europe remains a net <em>exporter</em> to
          the United States. The density gap underneath is even starker than the flow: the top American
          talent hubs run something like <Sq>five to ten times</Sq> the concentration of AI talent of the
          best European ones &mdash; San Francisco at roughly 23.9 specialists per thousand workers
          against Ireland&rsquo;s 4.2. Europe&rsquo;s strength is breadth, a thin even layer across a
          continent; America&rsquo;s is depth, a few places so dense they reach escape velocity. Scrub the
          tide below.
        </P>
      </Prose>

      <Figure>
        <BrainDrainTide />
      </Figure>

      <Prose>
        <P>
          And the loss is not only the people; it is what the people would have made. Here the
          create-versus-capture gap that haunts every chapter of this essay shows up in its purest form.
          Europe produces something like <Lev>17 to 20% of the world&rsquo;s most highly-cited
          research</Lev> &mdash; it writes the papers the future is built on. It then captures roughly{" "}
          <Sq>5% of the world&rsquo;s AI patents</Sq>. The ideas are European; the intellectual property
          is not. The same asymmetry runs through the founders: of the European company-builders who pulled
          up stakes and relocated, around <Sq>57% moved to the United States</Sq>. Europe teaches the
          class and America hands out the diplomas that pay. Watch the cohort flow through the finishing
          school below &mdash; in as ideas, out as someone else&rsquo;s product.
        </P>
      </Prose>

      <Figure max={1160}>
        <FinishingSchool />
      </Figure>

      <Prose>
        <PullQuote>
          Europe is the only education system in the world generous enough to train the global elite for
          free and humble enough to let someone else collect the tuition &mdash; in patents, in
          paychecks, in the companies its graduates build on the other side of an ocean.
        </PullQuote>

        <P>
          There is, for once, a flicker of better news in this chapter, and honesty requires reporting it.
          The drain is slowing &mdash; partly because America has spent 2025 and 2026 making itself harder
          to move to, with visa friction and rising costs, and partly because Europe has finally started
          to fight. The EU&rsquo;s &ldquo;Choose Europe for Science&rdquo; initiative, launched at around
          &euro;500 million in 2025, has grown to roughly <Won>&euro;900 million across some 101 national
          and regional schemes</Won> by early 2026, and it is drawing interest &mdash; applications from
          senior non-EU researchers have surged. For the first time in this essay, a door is visibly being
          propped open rather than left to swing shut. Whether it is wide enough, and whether it stays
          open past the next budget cycle, is exactly the test of nerve the whole essay is about.
        </P>

        <P>
          But a retention scheme, however welcome, treats a symptom. The disease is that Europe has built
          an economy where the rational move for its most talented person is to leave &mdash; where the
          pay is abroad, the capital is abroad, the scale is abroad, and the only thing reliably at home is
          the training that made them worth poaching. Fix the pay and the capital and the scale, and the
          talent stays without being begged. Beg the talent to stay while leaving the pay, capital and
          scale broken, and you are bailing a boat without finding the hole.
        </P>

        <P>
          Put names to it and the abstraction turns concrete. <Sq>Jan Leike</Sq>, who had led
          OpenAI&rsquo;s superalignment work, moved to Anthropic in 2024; <Sq>Yann LeCun</Sq>, the French
          Turing laureate who built Meta&rsquo;s AI research lab and personally anchored its Paris outpost,
          left in late 2025 to start his own world-model company. The pay gap underneath these moves is not
          subtle: a senior AI engineer who commands <Sq>&euro;120,000&ndash;180,000</Sq> in Western Europe
          can earn two to four times that, often far more once equity is counted, at a US lab. And the
          equity is the point &mdash; the European salary is a wage, the American package is a claim on the
          upside, and a decade of upside is what compounds into a house, a fortune, or the seed of the next
          company.
        </P>

        <P>
          The cruelest detail is geographic. The American labs no longer need Europeans to emigrate; they
          simply open an office down the road. <Sq>Anthropic</Sq> hired scores of staff in Ireland inside
          a single year and now runs research and operations out of London, Dublin, Zurich, Paris and
          Munich &mdash; European talent, European cities, American payroll and American equity, the
          continent reduced to a staging ground for someone else&rsquo;s firm. Europe&rsquo;s answer, the{" "}
          <Sq>&ldquo;Choose Europe for Science&rdquo;</Sq> programme launched in 2025, put about five
          hundred million euros on the table to lure researchers home &mdash; a real gesture, and roughly
          a fortieth of what the bloc proposes to spend on the AI gigafactories those researchers would
          work in. We will fund the machines. We are still pricing the people as an afterthought.
        </P>

        <P>
          The next chapter is about the most physical hole of all &mdash; the one you can measure at the
          electricity meter. Because a continent can train the engineers and bank the savings and still
          fail to build anything, if it has priced the electrons that everything runs on out of reach.
        </P>
      </Prose>

      <Sources
        items={[
          "AI compensation gap: senior AI researcher total comp ~€120k–180k (Europe) vs ~$600k–$1m+ (US frontier labs); enterprise ML ~$170k–245k (US). Stanford AI Index 2026; Levels.fyi (2026); Atomico, State of European Tech 2025.",
          "Talent flow: net tech-talent inflow to Europe ~+52,000 (2022) → ~+26,000 (2024); Europe a net exporter of AI talent to the US. Atomico 2025; Euronews (Jan 2026); Stanford AI Index 2026.",
          "Talent density: top US hubs ~5–10× the AI-talent density of top European ones (San Francisco ~23.9 vs Ireland ~4.2 per 1,000). Interface EU / Revelio Labs, Sept 2025.",
          "Create vs capture: Europe ~17–20% of the world's highly-cited research but ~5% of global AI patents; ~57% of relocating European founders moved to the US. WIPO / EPO / Clarivate; Atomico 2025.",
          "EU “Choose Europe for Science”: ~€500m (May 2025) → ~€900m across ~101 national/regional schemes (Jan 2026); surge in senior-researcher applications (e.g. +130% ERC Advanced from non-EU). European Commission, Jan 2026.",
        ]}
      />
    </section>
  )
}
