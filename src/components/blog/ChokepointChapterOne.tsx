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
 * CHAPTER 1. The Canary: the Netherlands in High Resolution.
 * The country that builds the machine, read as Europe in miniature. Every
 * load-bearing figure is sourced to the Dutch Competitiveness deck (Part A,
 * 2026) and cross-checked to July 2026 (CBS, DNB, Dealroom/TechLeap, OECD,
 * Draghi 2024). V3/V4/V5 embedded in reading order; Source Ledger at the foot.
 */
export function ChokepointChapterOne() {
  return (
    <section id="chapter-1">
      <ChapterMark kicker="Chapter One · The Canary" title="The Netherlands in High Resolution" />

      <Prose>
        <Lead>
          The most damning document about the Netherlands was written by the Netherlands. It is a
          competitiveness strategy, hundreds of pages long, commissioned by people who love the country
          and know it intimately, and it reads less like a policy deck than a confession. The phrase it
          keeps circling is <Sq>&ldquo;research colony&rdquo;</Sq>: a place that generates
          world-class ideas and watches them get commercialised somewhere else. That is the diagnosis, in
          the country&rsquo;s own hand. The rest of this chapter is mostly evidence, and the evidence is
          unusually clean, because the Dutch did the unkind work themselves.
        </Lead>

        <P>
          Start with why the Netherlands is the right place to begin. It is not a poor country having a
          hard decade. It is one of the richest, best-educated, most open economies on Earth, sitting on
          the single most important machine in the global economy and a wall of savings most nations
          would envy. If <em>this</em> country, with every advantage loaded in its favour,
          systematically ships its value abroad, then the continent-wide version of the story cannot be
          blamed on poverty or bad luck. The Netherlands is Europe with the contrast turned up. It is the
          canary precisely because it should be the last one to faint.
        </P>

        <P>
          And yet the deck&rsquo;s own headline is a slow suffocation. If the current trajectory holds, it
          puts the cost of stagnation at <Sq>&euro;1,700 per citizen, per year</Sq> in forgone purchasing
          power: the compounding gap between the growth the Netherlands is managing and the growth
          it used to manage. Dutch labour-productivity growth averaged roughly <Sq>0.4% a year across
          2014&ndash;2024</Sq>, against a historic norm closer to <Lev>1.8%</Lev>. (2025 brought a
          cyclical rebound, which is welcome and does not undo a lost decade.) That sounds abstract until
          you turn it into money and let it run. Scrub the years below and watch the abstraction become a
          salary.
        </P>
      </Prose>

      <Figure>
        <SeventeenHundredMeter />
      </Figure>

      <Prose>
        <P>
          A productivity gap is not a number on a dashboard; it is the raise that never arrived, the
          public service that quietly thinned, the pension that will be a little lighter. Compounded over
          a decade and divided by a population, it is &euro;1,700 a head a year, and the
          uncomfortable thing about the figure is that nobody chose it. No minister announced a policy of
          national stagnation. It accreted, decision by avoided decision, in exactly the way the rest of
          this essay describes.
        </P>

        <P>
          And the country is not trying especially hard to reverse it, which is the part that turns
          sympathy into impatience. A nation that wants to out-grow its productivity problem invests in
          the future; the Netherlands spends only <Sq>2.23% of GDP on research and development</Sq>
          against a 3% target it set itself: a shortfall the deck puts at roughly{" "}
          <Sq>&euro;6.7 billion every year</Sq>, and which, closed properly across a decade, would run to
          something like <Lev>&euro;86&ndash;107 billion</Lev> in innovation funding alone. Under-
          investment is half of it. Under-<em>adoption</em> is the other half. Dutch manufacturing runs at
          a robot density of <Sq>209 machines per ten thousand workers</Sq>; South Korea runs at{" "}
          <Lev>1,012</Lev>. The deck draws the line in plain words: that automation lag correlates
          directly with the productivity stall. A rich country can fall behind not because it lacks the
          technology, but because it declines to install it, which, for the nation that builds the
          machines the technology runs on, is a particular kind of irony.
        </P>

        <P>
          So where does the value leak out? Not at the lab bench. Dutch science is genuinely excellent:
          Wageningen is the world&rsquo;s number-one agritech university, the photonics and
          quantum work is world-class, the citation counts are the envy of far larger nations. The leak
          is downstream, at the precise point where an idea is supposed to become a company. The deck
          calls it <Sq>the missing middle</Sq>, and the data behind it is brutal: <Sq>zero AI
          unicorns</Sq> founded in the Netherlands. Not few. Zero. Sweden, with roughly half the
          population, has minted dozens across its modern history (the figure the Dutch benchmark
          cites is <Lev>41</Lev>) and produces them at about <Lev>four times</Lev> the Dutch
          per-capita rate, off the back of the Spotify and Klarna founder-mafias that recycle capital and
          nerve into the next cohort. The Netherlands produced Adyen and Mollie, world-class payment
          companies both; and the deck&rsquo;s own verdict is that they succeeded <em>despite</em>
          the ecosystem, not because of it, often forced into early American exits to find the capital to
          grow.
        </P>

        <P>
          The kill happens earlier and more completely than most people imagine. New biotech company
          formation in the Netherlands collapsed from <Sq>48 firms in 2018 to 12 in 2024</Sq>: a
          three-quarters fall in the pipeline feeding the Leiden&ndash;Amsterdam life-sciences cluster. Of
          the research that does spin out, only a sliver ever reaches revenue. The picture is not a tidy
          bar chart of attrition; it is a haemorrhage, and it bleeds at one specific wound: the
          jump from prototype to pilot, where the cheque that should exist does not. Hover the gaps below
          and read the size of the cheque that was missing at each stage.
        </P>
      </Prose>

      <Figure>
        <ValleyOfDeath />
      </Figure>

      <Prose>
        <P>
          The Valley of Death is not a Dutch invention (every innovation economy has one),
          but the Netherlands has dug it unusually deep, and underneath the missing cheque sits a missing
          instinct. Dutch policy, the deck argues, is <Sq>corporatist by reflex</Sq>: it backs the
          incumbents it already knows (Shell, Unilever, Philips) over the challengers it
          does not, so generic support flows to exactly the firms least likely to build the next
          industry. The capital markets compound it. Where Israel and the United States run on venture
          equity that is <em>paid</em> to take risk, the Netherlands runs on <Sq>banking dominance over
          venture capital</Sq> (debt for the safe, subsidies for the rest) and
          subsidy-dependent start-ups do not become champions. Even the universities work against the
          grain: restrictive technology-transfer rules turn every spin-out into a negotiation, and the
          excellence at Delft and Wageningen stays <Sq>siloed</Sq>, never consolidating into the
          industrial clusters that turn a lab into a sector. Each of these is a decision about who gets
          the benefit of the doubt. The Netherlands keeps giving it to the past.
        </P>

        <P>
          And the most telling fact in the whole deck is the one place none of this happens. Dutch
          agritech is not a research colony. It is an empire. The Netherlands is the world&rsquo;s{" "}
          <Lev>second-largest agri-food exporter</Lev>, achieved on roughly <Lev>0.4% of global
          production volume</Lev>: a small, water-logged country that out-exports whole continents by
          turning Wageningen&rsquo;s science into greenhouses, seeds and systems it actually owns and
          scales at home. It is proof, in the country&rsquo;s own figures, that the Dutch <em>can</em>
          convert world-class research into a durable, home-grown, globe-leading industry, when
          they decide to. Which makes the failure to do the same in AI, biotech and deep tech not a
          ceiling but a choice, and the choice is most visible in where the money goes.
        </P>

        <P>
          Which brings us to the part that should be impossible to write with a straight face. The
          Netherlands has <Won>&euro;1.6 trillion</Won> in pension assets (one of the deepest pools
          of patient, long-horizon capital on the planet, money explicitly saved for the forty-year
          future) and it invests almost none of it at home. Dutch pension funds hold only around{" "}
          <Sq>6% of their assets in European equities</Sq>; the domestic allocation is a rounding error,
          parked instead in foreign sovereign bonds and, above all, US equities. Read the sequence slowly.
          The country starves its own scale-ups of late-stage capital, and then posts the savings
          of its workers to Wall Street, where a good deal of it funds the American firms that will
          acquire those same starved Dutch scale-ups. The capital that could have built the bridge across
          the Valley of Death is, instead, financing the far bank.
        </P>

        <P>
          The venture layer tells the same story in miniature. In the large, late-stage rounds that
          actually decide which companies scale (the &euro;50-million-plus raises), the share
          coming from domestic investors has collapsed from <Sq>61% to 15%</Sq>. The Dutch built a
          world-class research base and a world-class savings base and then routed the connection between
          them through San Francisco. A promising Dutch company that wants to grow does not find Dutch
          money; it finds American money, and American money, reasonably, wants the company near the rest
          of its portfolio. The relocation is not theft. It is the predictable physics of who showed up
          with the cheque, and the reason no Dutch trustee is ever punished for owning US Treasuries
          and never rewarded for backing a Delft spin-out.
        </P>

        <PullQuote>
          A nation can own the deepest savings on the continent and the best science in its weight class,
          and still be a research colony, if it insists on lending the savings to its rivals and
          giving the science away at the seed round.
        </PullQuote>

        <P>
          Why does the money not stay where it is needed? Part of the answer is structural cowardice
          dressed as prudence. But part of it is something the deck names with startling candour: the
          Netherlands is governed on the wrong clock. Strategic industries (chips, grids, biotech,
          energy) run on forty-year horizons. Dutch politics runs on four. And every time the
          political dial resets, the long-term strategy is knocked back toward zero. The clearest casualty
          is the <Sq>Nationaal Groeifonds</Sq>, the &euro;20-billion National Growth Fund built precisely
          to make forty-year bets (whose future rounds, some <Sq>&euro;6.8 billion</Sq>, were
          cancelled in 2024, barely a cycle into its life). Spin the political dial below and watch the
          forty-year asset refuse to move while the strategy resets around it.
        </P>
      </Prose>

      <Figure max={1160}>
        <TwoClocks />
      </Figure>

      <Prose>
        <P>
          The contrast the deck draws is with Denmark, which anchors thirty-year sectoral agreements its
          governments are bound to honour across electoral turns: the reason Vestas and
          &Oslash;rsted grew into global champions rather than promising pilots. The Dutch instrument for
          that kind of patience, the Growth Fund, was killed the moment it became politically convenient.
          You cannot build a forty-year capability on a four-year attention span, and the volatility
          premium, the compounding cost of every reset, is paid by exactly the deep-tech
          founders who most need a stable horizon and least control the political weather.
        </P>

        <P>
          Then there is the talent, which is the part that should make a Dutch reader wince, because it is
          the most self-inflicted. The Netherlands trains superb engineers and scientists and then prices
          them to leave. A Dutch AI lecturer earns on the order of <Sq>&euro;60,000</Sq>; the same person
          commands <Lev>&euro;120,000 to &euro;300,000 and more</Lev> in the United States or Switzerland.
          So they go: the deck&rsquo;s estimate is that <Sq>90% of Dutch AI PhDs leave
          academia</Sq>, many poached by Google, DeepMind and their peers before they have even finished.
          And the few foreign experts the country might import to replace them hit a wall that has nothing
          to do with science: a housing shortage of some <Sq>900,000 homes</Sq>, which makes relocating to
          the Randstad a punishing proposition. The Netherlands has built a talent machine that runs in
          reverse: an exporter of the one input it cannot afford to lose.
        </P>

        <P>
          The cracks reach further down than the salary scale. The foundational pipeline is thinning too:
          Dutch fifteen-year-olds have shed roughly <Sq>twenty points</Sq> across the PISA assessments in
          maths, reading and science: a quiet erosion of the very numeracy a high-tech economy runs
          on. And the firms that <em>do</em> manage to scale meet a second wall that has nothing to do
          with talent or capital: a power grid flashing <Sq>&ldquo;code red&rdquo; for congestion across
          nearly every province</Sq>, with industrial electricity priced some <Sq>65% above its 2021
          level</Sq> (reindustrialisation blocked at the socket). (That grid earns a chapter of its
          own, later; note here only that the foundations are cracking on more than one axis at once.)
        </P>

        <P>
          Underneath all of it sits a culture the deck is brave enough to name. <em>Doe maar gewoon, dan
          doe je al gek genoeg</em>: just act normal, that&rsquo;s already crazy enough. It is a
          genuinely lovely social ethic and a catastrophic industrial one: a quiet levelling instinct in
          which conspicuous ambition is faintly embarrassing and conspicuous success faintly suspect. It
          is the soft tissue around all the hard numbers: the reason a brilliant Delft postdoc
          starts a consultancy instead of a company, and the reason the trustee, the minister and the
          dean all find it easier to do the normal thing.
        </P>

        <P>
          It is worth dwelling on what the winners do instead, because the deck&rsquo;s own benchmark is a
          catalogue of roads not taken. Israel funds high-risk deep tech through an Innovation Authority
          on <Won>repay-on-success</Won> terms: the state carries the downside, takes royalties
          only if the venture works, and treats a failure like SpaceIL&rsquo;s crashed lunar lander as
          national pride rather than national embarrassment, on the way to a <Lev>6.3% R&amp;D
          intensity</Lev>, the highest in the world. Sweden routes <Lev>74% of its venture capital</Lev>
          into impact and sustainability and lets its Spotify and Klarna alumni recycle money and
          mentorship into the next cohort. Switzerland leans on pharma-scale corporate R&amp;D
          (Roche, Novartis) to top the global innovation index year after year. Denmark binds its
          governments to those thirty-year agreements. None of these is a secret, and none is beyond a
          country with the Netherlands&rsquo; resources. They are simply decisions the Dutch have watched
          others make.
        </P>

        <P>
          So this is not a mystery, and it is not a tragedy in the Greek sense: there is no flaw of
          the gods here, only a sequence of survivable decisions the country keeps declining to revisit.
          The science is there. The savings are there. The machine, literally, is there, an hour&rsquo;s
          drive from the pension funds that will not invest in the companies it could seed. What is
          missing is the willingness to point them at each other. The Dutch wrote that conclusion
          themselves, in a deck designed to be read by the people who could change it, which is
          either the most hopeful thing in this chapter or the most damning, depending on whether anyone
          acts on it.
        </P>

        <P>
          It would be dishonest to pretend the Netherlands never holds on to a winner, and the honest
          exceptions sharpen the rule rather than soften it. <Sq>Adyen</Sq>, the Amsterdam payments
          processor, listed on Euronext in 2018, kept its headquarters at home, and now moves more than a
          trillion euros a year: Europe&rsquo;s most valuable fintech, still European.{" "}
          <Sq>Booking.com</Sq>, Amsterdam-built, has kept its head office on the canal-ring for two decades
          even while listing in New York. These prove the outcome is not fated. But notice how the
          exceptions cluster in payments and travel, not in the frontier industries, AI and chips
          and foundational software, where the next two decades of value will be decided. Europe can keep
          the champions of the last era. It keeps losing the ones that will own the next.
        </P>

        <P>
          And the deeper trap is measurable, not anecdotal. The Netherlands ranks among the world&rsquo;s
          top ten for innovation <em>inputs</em> (R&amp;D spending reached <Sq>2.44% of GDP</Sq>,
          some &euro;12.5 billion, in 2023) yet slips toward the high teens on innovation
          <em>outputs</em>: the patents, the scale-ups, the commercial franchises that turn research into
          rent. The Brainport cluster around Eindhoven is a genuine marvel of roughly eleven hundred
          companies and a hundred thousand jobs, but some 70% of them sit in
          manufacturing and hardware and barely <Sq>8% in software</Sq>, against a third or more in
          Silicon Valley. It is a hardware powerhouse in a software century: world-class at building the
          tools, strangely unable to own the platforms those tools enable. The inputs are Dutch. The
          compounding is somewhere else.
        </P>

        <P>
          One number captures the whole Dutch paradox. The Netherlands has the{" "}
          <Sq>highest density of AI professionals in Europe</Sq> (nearly eleven for every ten
          thousand people) and almost no AI champions to show for it. A country that ranks sixth in
          the world for overall competitiveness and third for infrastructure also sits far down the table
          for the digital-skills depth and scale-up capital that turn dense talent into companies. The
          brilliance is present and measurable; the machine to compound it into ownership is the thing that
          is missing, and its absence is a choice, not a shortage of clever people.
        </P>

        <P>
          When a Dutch champion does try to conquer America head-on, the result is often a cautionary tale.{" "}
          <Sq>Just Eat Takeaway</Sq>, born of the Dutch food-delivery pioneer Takeaway.com, bought the
          American firm <Sq>Grubhub</Sq> in 2021 for around seven billion dollars at the pandemic peak,
          and offloaded it a few years later for a fraction of that, a multi-billion-dollar
          write-down that stands among the costliest European attempts to scale into the US market on
          American terms. The lesson Dutch boardrooms drew was not &ldquo;try harder&rdquo; but
          &ldquo;don&rsquo;t try&rdquo;, which is its own kind of defeat.
        </P>

        <P>
          Even the Dutch crown jewels are, on inspection, the children of a retreat. ASML, NXP and BE
          Semiconductor are all <Sq>spin-offs of Philips</Sq>, once the towering electronics giant of
          Europe: brilliant companies set free as their parent shrank from a global champion into a
          health-tech mid-cap. The cluster is real and world-beating. But it is a constellation thrown off
          by a contracting star, and nothing in the Dutch system has since assembled a new giant to replace
          the one that broke apart. Europe is unusually good at producing excellent fragments and unusually
          bad at keeping, or rebuilding, the whole.
        </P>

        <P>
          The exception that proves the rule is made of glass. In the <Sq>Westland</Sq>, a strip of South
          Holland carpeted with greenhouses, Dutch growers achieve tomato yields of around{" "}
          <Sq>ninety-five tonnes a hectare</Sq> against a world average near eighteen, and the country
          exports more food by value than almost anyone on Earth from a territory the size of a large city.
          It is one of the genuine wonders of applied science. And notice how it is organised: around{" "}
          <Sq>Wageningen</Sq>, the world&rsquo;s leading agricultural university, knowledge moves by
          licensing and operating expertise, by family firms and cooperatives refined over generations,
          not by venture capital and equity scaling. The Dutch are world-beaters precisely where the
          model is patient, rooted and incremental, and stranded precisely where it demands a founder, a fast
          cheque and a willingness to bet the company. The competence is total. It is simply sector-locked
          into the shape the chokepoint machine cannot capture, which is also, unfortunately, the
          shape that does not build the next trillion-dollar platform.
        </P>

        <P>
          Two final Dutch details complete the portrait. When a genuine Dutch deep-tech winner does emerge
          (<Sq>DataSnipper</Sq>, an Amsterdam document-automation company that found real
          product-market fit), its path to scale ran through acquisition by the American automation
          giant UiPath, its intellectual property consolidated into a New-York-listed group. And when the
          government finally answered the competitiveness alarm with a headline{" "}
          <Sq>&euro;2.8-billion</Sq> technology-and-talent fund, the first-year allocation arrived at around{" "}
          <Sq>&euro;340 million</Sq>: an 88% gap between the announcement and the
          cheque, the four-year political clock starving a forty-year bet before it began. The ambition is
          real and recurring. So is the under-execution. That, in one country, is the whole machine.
        </P>

        <P>
          The Dutch state knows exactly how exposed it is, because in 2024 it had to pay to keep its crown
          jewel from leaving. When ASML signalled it might expand abroad rather than at home, the government
          scrambled together a <Sq>two-and-a-half-billion-euro</Sq> package (nicknamed
          &ldquo;Operation Beethoven&rdquo;) to unblock the housing, grid and talent bottlenecks
          around Eindhoven and persuade the company to stay. A country does not improvise billions to retain
          a single firm unless it understands that the firm <em>is</em> the economy. And the pull the other
          way is relentless: foreign acquisitions of Dutch scale-ups roughly <Sq>doubled</Sq> between 2020
          and 2025, from sixty-six a year to a hundred and twenty-nine. The canary is not only singing. It
          is being carried, cage and all, out of the mine.
        </P>

        <P>
          Hold the Netherlands in your mind now as a high-resolution scan of the patient, because every
          symptom you have just seen (the savings that flee, the scale-ups that emigrate, the
          talent priced to leave, the strategy that resets every four years, the grid that cannot carry
          the load) recurs at continental scale, with more zeros on the end. The canary has
          fainted. The next chapter walks into the mine shaft to see why the whole of Europe breathes the
          same air: a standing order, signed by no one in particular, that wires a quarter-trillion euros
          a year out of the continent and has gone uncancelled for a decade.
        </P>
      </Prose>

      <Sources
        items={[
          "Dutch Competitiveness Strategy, Part A (2026), Executive summary & crisis dashboard: €1,700/citizen/yr stagnation cost; labour-productivity growth ~0.4% (2014–24) vs ~1.8% historic; R&D intensity 2.23% (target 3% GDP) = ~€6.7bn/yr shortfall, ~€86–107bn 10-yr innovation need; robot density 209 vs Korea 1,012; PISA −20pts (maths/reading/science); agritech the lone scaled success, world #2 agri-food exporter on ~0.4% of global production volume.",
          "Same, Transformation 1 (“the missing middle”): 0 AI unicorns; new biotech firm formation 48 (2018) → 12 (2024); domestic VC share 15% (was 61%) in €50M+ rounds; ~90% of AI PhDs leave academia; Adyen/Mollie “succeeded despite the ecosystem.” Root causes: corporatist incumbent bias (Shell/Unilever/Philips), banking dominance over VC, subsidy-dependent start-ups, restrictive TTO/spin-out rules, siloed research. Cited therein: Dealroom.co; TechLeap.nl, State of Dutch Tech 2024.",
          "Same, Benchmark matrix (sources: Draghi Report 2024; Dealroom.co; OECD): Israel, Innovation Authority, repay-on-success conditional grants, SpaceIL-as-national-pride, 6.3% R&D intensity; Sweden, 41 unicorns / ~4× Dutch per-capita, 74% of VC to impact, Spotify/Klarna alumni networks; Switzerland, Roche/Novartis corporate R&D, #1 innovation index; Denmark, 30-year sectoral agreements (Vestas/Ørsted); Netherlands = fragmented grants / ivory tower / NGF cancellation.",
          "Same, Transformation 2 (energy): grid congestion “code red” across nearly all provinces; industrial electricity prices ~65% above 2021 levels, a constraint on reindustrialisation (treated fully in a later chapter).",
          "Same, Human capital: Dutch AI-lecturer pay ~€60k vs €120k–€300k+ abroad; ~900,000-home housing shortage constraining STEM immigration; the “Doe maar gewoon” cultural diagnosis.",
          "CBS Netherlands / OECD: labour-productivity growth ~0.4%/yr decade average (2014–24); ~2.4% cyclical rebound in 2025; EU frontier ~1.4%/yr.",
          "De Nederlandsche Bank (Q1 2026): Dutch pension assets €1.624tn; domestic allocation ~6–10% (ABP ~6.5%); ~6% in EU equities.",
          "Nationaal Groeifonds (National Growth Fund): €20bn programme (2020); €6.8bn of future rounds (4–5) cancelled 16 May 2024; existing commitments honoured.",
        ]}
      />
    </section>
  )
}
