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
 * CHAPTER 6. The Brains We Rent Out: Talent.
 * The input underneath all the others, people, trained at Europe's expense
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
          them: people. This is the resource Europe is most lavishly endowed with (it educates,
          freely or nearly so, some of the finest scientific and engineering minds on the planet)
          and it is the one it exports most carelessly of all. Europe runs, in effect, the world&rsquo;s
          finishing school: it takes in the raw talent, polishes it to a global shine at public expense,
          and then watches it graduate to be paid, patented and capitalised somewhere else. You cannot
          lose a capital war and a talent war and expect to win anything in between.
        </Lead>

        <P>
          The mechanism is almost insultingly simple: money. A senior AI researcher in a European hub
          earns total compensation somewhere around <Sq>&euro;120,000 to &euro;180,000</Sq>: good
          money, a fine living. The same person at an American frontier lab earns <Lev>$600,000 to over
          $1,000,000</Lev>. Not a premium; a multiple (three to five times, and far more at the
          very top). There is no mystery about why the best leave; the only mystery is why anyone expects
          them to stay. Move the slider below and watch the paycheck multiply as the researcher crosses
          the Atlantic: same person, same skills, a different zero.
        </P>
      </Prose>

      <Figure>
        <VanishingPaycheck />
      </Figure>

      <Prose>
        <P>
          So they go, and the tide is measurable. Europe&rsquo;s net inflow of tech talent (the
          balance of who arrives versus who leaves) <Sq>halved in two years, from about +52,000 in
          2022 to +26,000 in 2024</Sq>, and on the AI frontier Europe remains a net <em>exporter</em> to
          the United States. The density gap underneath is even starker than the flow: the top American
          talent hubs run something like <Sq>five to ten times</Sq> the concentration of AI talent of the
          best European ones (San Francisco at roughly 23.9 specialists per thousand workers
          against Ireland&rsquo;s 4.2). Europe&rsquo;s strength is breadth, a thin even layer across a
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
          research</Lev>; it writes the papers the future is built on. It then captures roughly{" "}
          <Sq>5% of the world&rsquo;s AI patents</Sq>. The ideas are European; the intellectual property
          is not. The same asymmetry runs through the founders: of the European company-builders who pulled
          up stakes and relocated, around <Sq>57% moved to the United States</Sq>. Europe teaches the
          class and America hands out the diplomas that pay. Watch the cohort flow through the finishing
          school below: in as ideas, out as someone else&rsquo;s product.
        </P>
      </Prose>

      <Figure max={1160}>
        <FinishingSchool />
      </Figure>

      <Prose>
        <PullQuote>
          Europe is the only education system in the world generous enough to train the global elite for
          free and humble enough to let someone else collect the tuition: in patents, in
          paychecks, in the companies its graduates build on the other side of an ocean.
        </PullQuote>

        <P>
          There is, for once, a flicker of better news in this chapter, and honesty requires reporting it.
          The drain is slowing, partly because America has spent 2025 and 2026 making itself harder
          to move to, with visa friction and rising costs, and partly because Europe has finally started
          to fight. The EU&rsquo;s &ldquo;Choose Europe for Science&rdquo; initiative, launched at around
          &euro;500 million in 2025, has grown to roughly <Won>&euro;900 million across some 101 national
          and regional schemes</Won> by early 2026, and it is drawing interest: applications from
          senior non-EU researchers have surged. For the first time in this essay, a door is visibly being
          propped open rather than left to swing shut. Whether it is wide enough, and whether it stays
          open past the next budget cycle, is exactly the test of nerve the whole essay is about.
        </P>

        <P>
          The fight is real at the institutional level too, and worth naming. France&rsquo;s <Sq>Inria</Sq>
          has begun offering early-career AI chairs worth around <Won>&euro;1 million</Won> over four years;
          the <Sq>Max Planck</Sq> Society stood up a dedicated AI network with guaranteed compute and
          tenure-track posts; the European Innovation Council put some <Won>&euro;1.4 billion</Won> into its
          2026 programme with a new talent scheme attached. These are serious, well-designed instruments. But
          they compete on the same soil as the poachers: in 2026 <Sq>Anthropic</Sq> alone opened six European
          offices, including its first in London, and the American labs no longer need to lure Europe&rsquo;s
          researchers across an ocean; they can hire them down the street, on a European address, at an
          American package. The counter-offensive is genuine; it is also outspent and out-equitied by rivals
          who have simply moved into the building.
        </P>

        <P>
          But a retention scheme, however welcome, treats a symptom. The disease is that Europe has built
          an economy where the rational move for its most talented person is to leave: where the
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
          equity is the point: the European salary is a wage, the American package is a claim on the
          upside, and a decade of upside is what compounds into a house, a fortune, or the seed of the next
          company.
        </P>

        <P>
          The cruelest detail is geographic. The American labs no longer need Europeans to emigrate; they
          simply open an office down the road. <Sq>Anthropic</Sq> hired scores of staff in Ireland inside
          a single year and now runs research and operations out of London, Dublin, Zurich, Paris and
          Munich: European talent, European cities, American payroll and American equity, the
          continent reduced to a staging ground for someone else&rsquo;s firm. Europe&rsquo;s answer, the{" "}
          <Sq>&ldquo;Choose Europe for Science&rdquo;</Sq> programme launched in 2025, put about five
          hundred million euros on the table to lure researchers home (a real gesture, and roughly
          a fortieth of what the bloc proposes to spend on the AI gigafactories those researchers would
          work in). We will fund the machines. We are still pricing the people as an afterthought.
        </P>

        <P>
          The trend line is the alarming part, and it has already been measured: that net inflow, as we saw,
          has roughly <Sq>halved in just two years</Sq>, as the United States, Canada and Australia pulled
          harder while Europe&rsquo;s own friction (visa drag, equity gaps, regulatory uncertainty)
          pushed. A continent that educates its workforce at public expense and then watches
          the net flow run the wrong way is not suffering a talent shortage. It is quietly running a talent
          <em>export</em> business, and booking the loss as someone else&rsquo;s gain.
        </P>

        <P>
          Density is its own kind of destiny, and it is worth dwelling on why the concentration gap measured
          earlier (the top American hubs running five to ten times denser than the best European ones)
          matters so much more than the bare ratio suggests. Density is not vanity; it is the mechanism.
          It is how a researcher hears the unpublished result, how the second start-up gets founded by the
          first one&rsquo;s alumni, how capital and talent and ambition collide often enough to ignite.
          Europe&rsquo;s talent is real but diffuse, spread thin across twenty-seven national systems and as
          many languages; America&rsquo;s is concentrated to the point of criticality. You can hold the same
          number of brilliant people and get a fraction of the output, simply because they are too far apart
          to catch fire.
        </P>

        <P>
          The pipeline has a postcode. For two decades the route ran from Europe&rsquo;s great university
          towns (Cambridge, Oxford, Z&uuml;rich, Paris, Amsterdam) to a handful of square
          miles around San Francisco Bay, and the AI era has only widened it. The pattern is so consistent
          that scholars have a name for the arrangement: the <Sq>research colony</Sq>, a territory that
          supplies the raw intellectual material (the doctorates, the papers, the foundational ideas)
          to an imperial core that turns them into products, profits and equity. Europe educates the
          mind at public expense; America rents it, captures its output, and books the returns. It is a
          colonial relationship inverted into the knowledge economy, and the most uncomfortable part is how
          willingly, and how cheaply, the colony exports its most valuable crop.
        </P>

        <P>
          It would be too easy to make this only about money, and the deeper truth is worse for Europe. Ask
          the researchers who leave why they went, and the pay gap is rarely the first answer. They went
          because that is where the <em>work</em> is: the frontier models, the near-unlimited compute,
          the colleagues operating at the absolute edge, the sense that the most important problems in the
          field are being solved in that building and not this one. A continent can sometimes close a salary
          gap with a grant. It cannot close an <em>ambition</em> gap with one, because ambition follows the
          frontier, and the frontier followed the capital and the compute across the Atlantic years ago.
          Europe is not only out-paying its talent; it is, more damagingly, out-<em>inspiring</em> it.
        </P>

        <P>
          The machinery of retention is broken at both ends. Europe trains an enormous share of the
          world&rsquo;s science and engineering talent in superb public universities, and then makes
          it administratively harder to keep a brilliant non-European graduate than the United States makes
          it to recruit one, while offering a fraction of the pay and almost none of the equity upside. A
          doctorate earned in Delft or Z&uuml;rich or Munich is a globally portable asset, and its holder
          faces a calculation Europe loses at every term: more money, more compute, more ambitious
          colleagues, a faster path to a green card, all on the far side of the Atlantic. The continent
          subsidises the most expensive part of the pipeline (the education) and then declines
          to compete for the cheap part, the keeping. It is the most expensive imaginable way to run a
          talent policy: pay to grow it, pay nothing to hold it, and then call the loss a brain drain as
          though it were the weather.
        </P>

        <P>
          The poaching is not abstract; it has names and dates. In June 2025 Meta hired away three of the
          researchers who had built <Sq>OpenAI&rsquo;s Z&uuml;rich office</Sq>: Lucas Beyer, Alexander
          Kolesnikov and Xiaohua Zhai, themselves recruited out of Google DeepMind&rsquo;s Zurich lab months
          earlier. Anthropic, opening its own Zurich hub, hired the DeepMind veteran <Sq>Neil Houlsby</Sq> to
          run it. The American labs now wage their talent wars <em>inside</em> Europe, trading European
          researchers among themselves on European soil, with European institutions merely the venue. And
          the tax code holds the door open: a stock-option grant that a US engineer eventually pays
          capital-gains rates on, around 15-20%, a German engineer pays ordinary income
          tax on at exercise, north of forty. So even the equity meant to bind talent to a European
          startup is taxed as though it were a salary. Europe penalises the one instrument that might let it
          compete.
        </P>

        <P>
          The pattern even shapes Europe&rsquo;s rare successes. <Sq>Arthur Mensch</Sq>, the founder of
          Mistral (the closest thing the continent has to a frontier AI champion), did not
          build it straight out of a European lab. He spent years at <Sq>Google DeepMind</Sq> in Paris
          first, learning the craft inside an American hyperscaler, before leaving in 2023 to start
          something French. So even the bright spot runs on talent Europe first had to lose to the Americans
          and then win back; the training that mattered most happened on a US payroll, on European soil, in
          a lab Europe does not own. The continent can, occasionally, reclaim its people, but it does
          so one founder at a time, against a tide running the other way by the tens of thousands, and then
          calls the rare reversal a triumph rather than the exception that measures the scale of the loss.
        </P>

        <P>
          And then, in 2025, something genuinely new happened: for the first time in a generation the tide
          briefly slackened, not because Europe grew more attractive, but because America grew less
          so. As the new US administration cut research budgets and leaned on universities, applications
          from US-based scientists to European programmes surged: France&rsquo;s hastily-launched <Sq>&ldquo;Safe
          Place for Science&rdquo;</Sq> drew hundreds of American applicants in its first round, the European
          Research Council reported a sharp jump in interest from across the Atlantic, and Europe found
          itself, improbably, a refuge. It is the essay&rsquo;s most hopeful accident: proof that talent
          flows toward stability and freedom and funding, and that these are things Europe, when it chooses,
          can still offer better than almost anyone. The window is real. Whether Europe funds it at the scale
          required, or lets it close again as the American panic subsides, is exactly the test of nerve this
          essay keeps returning to.
        </P>

        <P>
          The composition of the workforce tells its own story. Europe&rsquo;s tech hubs increasingly run on
          imported talent (by one measure roughly <Sq>a quarter of Ireland&rsquo;s AI workforce</Sq>
          did its undergraduate degree in India) even as the continent&rsquo;s own graduates leave for
          America; Europe is, in effect, a transit lounge, drawing skilled people in from the developing
          world and losing them onward to the United States. And the pipeline is narrow where it should be
          widest: women hold only about <Sq>a quarter of AI roles worldwide</Sq>, and Europe does no better,
          leaving half its potential talent under-tapped at the exact moment it can least afford to. A
          continent serious about a talent shortage would be widening every intake it has. Europe treats its
          human capital the way it treats its financial capital: abundant, world-class, and quietly allowed
          to flow out faster than it is built up.
        </P>

        <P>
          The gap shows up before the first job, in what graduates even imagine doing. Only about <Sq>15% of
          European PhDs</Sq> go on to found or join a startup, against something like <Sq>45% in the United
          States</Sq>; the European doctorate still points, by default, toward the university, the public lab
          or the large incumbent, not the risky new company. And when Europeans do try to build, roughly{" "}
          <Sq>seven in ten founders</Sq> name the regulatory environment as a brake on expansion. So the loss
          compounds at every stage: a system that trains brilliantly, channels its brilliance away from
          enterprise, taxes the equity that would reward it, and regulates the scaling that would retain it;
          and then wonders where its founders went. They went to the place that does the opposite of
          all four things, and felt, on arrival, as though they had been let out of a smaller room.
        </P>

        <P>
          And the loss is not evenly spread; it hollows out whole regions. Dozens of European areas
          (much of Bulgaria and Romania, swathes of southern Italy and Portugal) are now caught in what
          demographers call a <Sq>&ldquo;talent development trap&rdquo;</Sq>: their young and educated leave for
          the richer cities or for America, the population ages and shrinks, and the conditions that might have
          kept the next cohort decay further with each departure. Across the EU, youth unemployment sits around{" "}
          <Sq>15%</Sq>, more than double the adult rate, even as firms complain they cannot find skilled
          workers: the paradox of a continent that cannot match its people to its opportunities because
          too few of the opportunities are being created at home. A brain drain, seen up close, is not an
          abstraction in a productivity table. It is a clever young person in Cluj or Catania doing the
          arithmetic of their own life and concluding, reasonably, that their future is somewhere else.
        </P>

        <P>
          The next chapter is about the most physical hole of all, the one you can measure at the
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
          "Counter-programs: Inria offers ~€1M four-year early-career AI chairs; the Max Planck AI network (MP-AIX) added guaranteed compute + tenure-track posts (2026); the EIC 2026 programme is ~€1.4bn with a new talent scheme, even as Anthropic opened six European offices (incl. its first London) in 2026. Inria; Max Planck; EIC; Anthropic.",
        ]}
      />
    </section>
  )
}
