import type { ReactNode } from "react"

import { SeventeenHundredMeter } from "./SeventeenHundredMeter"
import { ValleyOfDeath } from "./ValleyOfDeath"
import { TwoClocks } from "./TwoClocks"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * CHAPTER 1 — The Canary: the Netherlands in High Resolution.
 * The country that builds the machine, read as Europe in miniature. Every
 * load-bearing figure is sourced to the Dutch Competitiveness deck (Part A,
 * 2026) and cross-checked to July 2026 (CBS, DNB, Dealroom/TechLeap, Draghi
 * 2024). V3/V4/V5 embedded in reading order. Source Ledger at the foot.
 */
export function ChokepointChapterOne() {
  return (
    <section>
      <ChapterMark
        kicker="Chapter One · The Canary"
        title="The Netherlands in High Resolution"
      />

      <Prose>
        <Lead>
          The most damning document about the Netherlands was written by the Netherlands. It is a
          competitiveness strategy, hundreds of pages long, commissioned by people who love the country
          and know it intimately, and it reads less like a policy deck than a confession. The phrase it
          keeps circling is <Sq>&ldquo;research colony&rdquo;</Sq> &mdash; a place that generates
          world-class ideas and watches them get commercialised somewhere else. That is the diagnosis,
          in the country&rsquo;s own hand. The rest of this chapter is just the evidence, and the
          evidence is unusually clean, because the Dutch did the unkind work themselves.
        </Lead>

        <P>
          Start with why the Netherlands is the right place to begin. It is not a poor country having a
          hard decade. It is one of the richest, best-educated, most open economies on Earth, sitting on
          the single most important machine in the global economy and a wall of savings most nations
          would envy. If <em>this</em> country &mdash; with every advantage loaded in its favour &mdash;
          systematically ships its value abroad, then the continent-wide version of the story cannot be
          blamed on poverty or bad luck. The Netherlands is Europe with the contrast turned up. It is the
          canary precisely because it should be the last one to faint.
        </P>

        <P>
          And yet the deck&rsquo;s own headline number is a slow suffocation. If the current trajectory
          holds, it puts the cost of stagnation at <Sq>&euro;1,700 per citizen, per year</Sq>, in
          forgone purchasing power &mdash; the compounding gap between the growth the Netherlands is
          managing and the growth it used to manage. Dutch labour-productivity growth averaged roughly{" "}
          <Sq>0.4% a year across 2014&ndash;2024</Sq>, against a historic norm closer to{" "}
          <Lev>1.8%</Lev>. (2025 brought a cyclical rebound, which is welcome and does not undo a lost
          decade.) That sounds abstract until you turn it into money and let it run. Scrub the years
          below and watch the abstraction become a salary.
        </P>
      </Prose>

      <Figure>
        <SeventeenHundredMeter />
      </Figure>

      <Prose>
        <P>
          A productivity gap is not a number on a dashboard; it is the raise that never arrived, the
          public service that quietly thinned, the pension that will be a little lighter. Compounded over
          a decade and divided by a population, it is &euro;1,700 a head a year &mdash; and the
          uncomfortable thing about the figure is that nobody chose it. No minister announced a policy of
          national stagnation. It accreted, decision by avoided decision, in exactly the way the rest of
          this essay describes.
        </P>

        <P>
          So where does the value leak out? Not at the lab bench. Dutch science is genuinely excellent
          &mdash; Wageningen is the world&rsquo;s number-one agritech university, the photonics and
          quantum work is world-class, the citation counts are the envy of far larger nations. The
          leak is downstream, at the precise point where an idea is supposed to become a company. The
          deck calls it <Sq>the missing middle</Sq>, and the data behind it is brutal:{" "}
          <Sq>0 AI unicorns</Sq> founded in the Netherlands. Not few. Zero. Sweden, with roughly half
          the population, has minted dozens of unicorns across its modern history &mdash; the figure the
          Dutch benchmark cites is <Lev>41</Lev> &mdash; and produces them at about <Lev>four times</Lev>{" "}
          the Dutch per-capita rate, off the back of the Spotify and Klarna founder-mafias that recycle
          capital and nerve back into the next cohort. The Netherlands produced Adyen and Mollie, world-
          class payment companies both &mdash; and the deck&rsquo;s own verdict is that they succeeded{" "}
          <em>despite</em> the ecosystem, not because of it, often forced into early American exits to
          find the capital to grow.
        </P>

        <P>
          The kill happens earlier and more completely than most people imagine. New biotech company
          formation in the Netherlands collapsed from <Sq>48 firms in 2018 to 12 in 2024</Sq> &mdash; a
          three-quarters fall in the pipeline feeding the Leiden&ndash;Amsterdam life-sciences cluster.
          Of the research that does spin out, only a sliver ever reaches revenue. The picture is not a
          tidy bar chart of attrition; it is a haemorrhage, and it bleeds at one specific wound &mdash;
          the jump from prototype to pilot, where the cheque that should exist does not. Hover the gaps
          below and read the size of the cheque that was missing at each stage.
        </P>
      </Prose>

      <Figure>
        <ValleyOfDeath />
      </Figure>

      <Prose>
        <P>
          The Valley of Death is not a Dutch invention &mdash; every innovation economy has one &mdash;
          but the Netherlands has dug it unusually deep and then declined to build the bridge, even
          though it is sitting on more bridge-building material than almost anyone alive. Which brings us
          to the part that should be impossible to write with a straight face.
        </P>

        <P>
          The Netherlands has <Won>&euro;1.6 trillion</Won> in pension assets &mdash; one of the deepest
          pools of patient, long-horizon capital on the planet, money explicitly saved for the
          forty-year future. And it invests almost none of it at home. Dutch pension funds hold only
          around <Sq>6% of their assets in European equities</Sq>; the domestic allocation is a rounding
          error, parked instead in foreign sovereign bonds and, above all, US equities. Read that
          sequence slowly. The country starves its own scale-ups of late-stage capital &mdash; and then
          posts the savings of its workers to Wall Street, where a good deal of it funds the American
          firms that will acquire those same starved Dutch scale-ups. The capital that could have built
          the bridge across the Valley of Death is, instead, financing the far bank.
        </P>

        <P>
          The venture layer tells the same story in miniature. In the large, late-stage rounds that
          actually decide which companies scale &mdash; the &euro;50-million-plus raises &mdash; the
          share coming from domestic investors has collapsed from <Sq>61% to 15%</Sq>. The Dutch built a
          world-class research base and a world-class savings base and then routed the connection between
          them through San Francisco. A promising Dutch company that wants to grow does not find Dutch
          money; it finds American money, and American money, reasonably, wants the company to move to
          where the rest of its portfolio lives. The relocation is not theft. It is the predictable
          physics of who showed up with the cheque.
        </P>

        <PullQuote>
          A nation can own the deepest savings on the continent and the best science in its weight class,
          and still be a research colony &mdash; if it insists on lending the savings to its rivals and
          giving the science away at the seed round.
        </PullQuote>

        <P>
          Why does the money not stay? Part of the answer is structural cowardice dressed as prudence
          &mdash; the pension trustee who is never punished for owning US Treasuries and never rewarded
          for backing a Delft spin-out. But part of it is something the deck names with startling candour:
          the Netherlands is governed on the wrong clock. Strategic industries &mdash; chips, grids,
          biotech, energy &mdash; run on forty-year horizons. Dutch politics runs on four. And every time
          the political dial resets, the long-term strategy is knocked back toward zero. The clearest
          casualty is the <Sq>Nationaal Groeifonds</Sq>, the &euro;20-billion National Growth Fund built
          precisely to make forty-year bets &mdash; whose future rounds, some &euro;6.8 billion, were
          cancelled in 2024, one cycle into its life. Spin the political dial below and watch the
          forty-year asset refuse to move while the strategy resets around it.
        </P>
      </Prose>

      <Figure max={1160}>
        <TwoClocks />
      </Figure>

      <Prose>
        <P>
          The contrast the deck draws is with Denmark, which anchors thirty-year sectoral agreements its
          governments are bound to honour across electoral turns &mdash; the reason Vestas and
          &Oslash;rsted exist as global champions rather than promising pilots. The Dutch instrument for
          this, the Growth Fund, was killed the moment it became politically convenient. You cannot build
          a forty-year capability on a four-year attention span, and the volatility premium &mdash; the
          compounding cost of every reset &mdash; is paid by exactly the deep-tech founders who most need
          a stable horizon and least control the political weather.
        </P>

        <P>
          Then there is the talent, which is the part that should make a Dutch reader wince, because it
          is the most self-inflicted. The Netherlands trains superb engineers and scientists and then
          prices them to leave. A Dutch AI lecturer earns on the order of <Sq>&euro;60,000</Sq>; the same
          person commands <Lev>&euro;120,000 to &euro;300,000 and more</Lev> in the United States or
          Switzerland. So they go &mdash; the deck&rsquo;s estimate is that <Sq>90% of Dutch AI PhDs
          leave academia</Sq>, many poached by Google, DeepMind and their peers before they have even
          finished. And the few foreign experts the country might import to replace them run into a wall
          that has nothing to do with science: a housing shortage of some <Sq>900,000 homes</Sq>, which
          makes relocating to the Randstad a punishing proposition. The Netherlands has built a talent
          machine that runs in reverse &mdash; an exporter of the one input it cannot afford to lose.
        </P>

        <P>
          Underneath all of it sits a culture the deck is brave enough to name. <em>Doe maar gewoon, dan
          doe je al gek genoeg</em> &mdash; just act normal, that&rsquo;s already crazy enough. It is a
          genuinely lovely social ethic and a catastrophic industrial one: a quiet levelling instinct in
          which conspicuous ambition is faintly embarrassing and conspicuous success is faintly suspect.
          The benchmark economies the deck admires run on the opposite wiring &mdash; Israel&rsquo;s{" "}
          <em>chutzpah</em> and its Innovation Authority that funds founders on repay-on-success terms and
          treats a failed venture as experience rather than disgrace, on the way to a <Lev>6.3% R&amp;D
          intensity</Lev>; Sweden&rsquo;s serial-founder mafias. The Netherlands, by the deck&rsquo;s own
          scorecard, lands in the column marked <Sq>gap</Sq>: fragmented grants, an ivory-tower divide
          between universities and industry, a growth fund cancelled, productivity flat, and the talent
          draining west.
        </P>

        <P>
          None of these is a mystery, and none is a tragedy in the Greek sense &mdash; there is no flaw
          of the gods here, only a series of survivable decisions that the country keeps declining to
          revisit. The science is there. The savings are there. The machine, literally, is there, an
          hour&rsquo;s drive from the pension funds that will not invest in the companies it could seed.
          What is missing is the willingness to point them at each other. The Dutch wrote that conclusion
          themselves, in a deck designed to be read by the people who could change it.
        </P>

        <P>
          Hold the Netherlands in your mind now as a high-resolution scan of the patient, because every
          symptom you have just seen &mdash; the savings that flee, the scale-ups that emigrate, the
          talent priced to leave, the strategy that resets every four years &mdash; recurs at continental
          scale, with more zeros on the end. The canary has fainted. The next chapter walks into the mine
          shaft to see why the whole of Europe breathes the same air: a standing order, unsigned by
          anyone in particular, that wires a quarter-trillion euros a year out of the continent and has
          gone uncancelled for a decade.
        </P>
      </Prose>

      <Sources
        items={[
          "Dutch Competitiveness Strategy, Part A (2026) — Executive summary: €1,700/citizen/yr stagnation cost; labour-productivity growth ~0.4% (2014–24) vs ~1.8% historic; €1.6T pension assets largely undeployed domestically; R&D intensity 2.23% (target 3%); robot density 209 vs Korea 1,012.",
          "Same — Transformation 1 (“the missing middle”): 0 AI unicorns; new biotech firm formation 48 (2018) → 12 (2024); domestic VC share 15% (was 61%) in €50M+ rounds; ~90% of AI PhDs leave academia; Adyen/Mollie “succeeded despite the ecosystem.” Cited therein: Dealroom.co; TechLeap.nl, State of Dutch Tech 2024.",
          "Same — Benchmark matrix (sources: Draghi Report 2024; Dealroom.co; OECD): Sweden 41 unicorns, ~4× Dutch per-capita rate (Spotify/Klarna founder networks); Israel Innovation Authority, repay-on-success grants, 6.3% R&D intensity; Denmark 30-year sectoral/energy agreements (Vestas/Ørsted); Netherlands = fragmented grants / ivory tower / NGF cancellation.",
          "Same — Human capital: Dutch AI-lecturer pay ~€60k vs €120k–€300k+ abroad; ~900,000-home housing shortage constraining STEM immigration; the “Doe maar gewoon” cultural diagnosis.",
          "CBS Netherlands / OECD: labour-productivity growth ~0.4%/yr decade average (2014–24); ~2.4% cyclical rebound in 2025; EU frontier ~1.4%/yr.",
          "De Nederlandsche Bank (Q1 2026): Dutch pension assets €1.624tn; domestic allocation ~6–10% (ABP ~6.5%); ~6% in EU equities.",
          "Nationaal Groeifonds (National Growth Fund): €20bn programme (2020); €6.8bn of future rounds (4–5) cancelled 16 May 2024; existing commitments honoured.",
        ]}
      />
    </section>
  )
}
