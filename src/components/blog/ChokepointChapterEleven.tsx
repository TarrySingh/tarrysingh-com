import type { ReactNode } from "react"

import { LLMflationCurve } from "./LLMflationCurve"
import { CapexCanyon } from "./CapexCanyon"
import { AccelerantEngine } from "./AccelerantEngine"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * CHAPTER 11 — Software 3.0: The Accelerant.
 * The technology that multiplies every gap in the essay, because it rewards
 * exactly what Europe lacks. Figures verified to July 2026 (a16z; Epoch AI;
 * Goldman Sachs; CNBC/filings; Stanford AI Index 2026). V37/V38/V39.
 */
export function ChokepointChapterEleven() {
  return (
    <section id="chapter-11">
      <ChapterMark kicker="Chapter Eleven · The Accelerant" title="Software 3.0" />

      <Prose>
        <Lead>
          Everything you have read so far is the <em>before</em>. Ten chapters of gaps &mdash; capital,
          companies, talent, energy, scale, the quarter-trillion tribute &mdash; measured in a world that
          was, by the standards of what is coming, standing still. This chapter is about the multiplier.
          Artificial intelligence is not just another industry Europe is losing; it is a general-purpose
          accelerant that rewards, with brutal precision, exactly the five things Europe has spent this
          whole essay not having: scale, capital, cheap energy, data, and frontier compute. Pour it over a
          continent that is winning, and it compounds the lead. Pour it over a continent that is losing,
          and it compounds the loss. Software 3.0 is the foot going down on the pedal &mdash; and the car
          is pointed the wrong way.
        </Lead>

        <P>
          Start with the deflation, because it is genuinely one of the most astonishing facts in the
          modern economy and it is almost universally misread. The cost of a unit of AI capability is
          falling by roughly <Won>an order of magnitude every year</Won>. A task that cost thirty dollars
          per million tokens on a GPT-4-class model in 2023 can be served by a &ldquo;good enough&rdquo;
          model for a few cents today &mdash; a fall of around <Won>1,000&times; in three years</Won> at
          the cheap end, and still some 60&times; at the frontier. The instinctive read is that this
          democratises intelligence, hands it to the small and the scrappy, levels the field. It does the
          opposite, and the reason is Jevons&rsquo; paradox: when something essential gets radically
          cheaper, you do not use less of it, you use vastly more. Token demand is forecast to grow some{" "}
          <Sq>24&times; by 2030</Sq>; enterprise AI budgets have risen nearly <Sq>six-fold</Sq> even as
          per-token prices fell about 65%. Cheap intelligence does not shrink the prize. It explodes it.
          Watch the two curves cross below.
        </P>
      </Prose>

      <Figure>
        <LLMflationCurve />
      </Figure>

      <Prose>
        <P>
          And an exploding prize is won by whoever can pay to serve it &mdash; which turns the whole game
          into a contest of raw capital intensity, the one contest Europe has structurally opted out of.
          In 2026 the four largest American hyperscalers will spend, between them, on the order of{" "}
          <Sq>$725 billion</Sq> on AI and data-centre capital expenditure &mdash; up about 77% in a single
          year, and closer to <Sq>$755 billion</Sq> once you fold in xAI and the Stargate build-out. The
          whole of Europe&rsquo;s comparable capex is around <Sq>$60 billion</Sq>. That is not a gap; it is
          a <Sq>canyon &mdash; roughly twelve to one</Sq>, and widening. Europe&rsquo;s flagship answers
          are real and earnest and an order of magnitude too small: the EU&rsquo;s &ldquo;AI
          Gigafactories&rdquo; initiative at around &euro;20 billion, and the heroic, lonely figure of{" "}
          <Won>Mistral</Won> &mdash; France&rsquo;s genuine frontier lab, valued at perhaps $23 billion in
          its 2026 raise. Mistral is the best Europe has, and it is roughly <Sq>forty times smaller</Sq>
          than Anthropic, whose valuation crossed <Sq>$965 billion</Sq> in 2026, or OpenAI at $852 billion.
          Set the canyon to scale below; the European ledge all but disappears.
        </P>
      </Prose>

      <Figure max={1180}>
        <CapexCanyon />
      </Figure>

      <Prose>
        <P>
          The capital gap becomes a capability gap with a short lag, and the capability numbers are the
          starkest in the essay. Of the notable frontier AI models released in 2025, the United States
          produced around <Sq>fifty</Sq> and China about thirty; <Sq>Europe produced roughly three</Sq>.
          The United States commands an estimated <Sq>74% of the world&rsquo;s high-end AI compute</Sq>;
          Europe holds something like <Sq>5 to 6%</Sq>, and that share is falling, not rising. Every
          frontier-leading model since 2023 has come out of an American lab. This is what it looks like to
          be absent from the defining technology of the age not as a consumer &mdash; Europe consumes AI
          voraciously, mostly American AI &mdash; but as a <em>producer</em>. And it matters precisely
          because of the accelerant logic: a continent that does not make the frontier models pays rent on
          everyone else&rsquo;s, forever, on terms it does not set.
        </P>

        <P>
          Now put the two halves together, because this is the chapter&rsquo;s whole argument. AI rewards
          scale &mdash; Europe is fragmented. It rewards capital &mdash; Europe exports its capital. It
          rewards cheap energy &mdash; Europe&rsquo;s power costs double. It rewards data and frontier
          compute &mdash; Europe has little of either. Every single input that AI turns into compounding
          advantage is an input this essay has already shown Europe lacks. So the technology does not open
          a new front in the competition; it takes every existing gap &mdash; the capital drain, the
          brain-drain, the energy premium, the scale deficit &mdash; and runs a multiplier over it. Pull
          the accelerant lever below and watch the gaps you have already read about widen in real time.
        </P>
      </Prose>

      <Figure max={1160}>
        <AccelerantEngine />
      </Figure>

      <Prose>
        <PullQuote>
          A tide that lifts all boats still leaves you behind if your boat is tied to the dock. AI is not
          a rising tide. It is a current, and it runs toward scale, capital and cheap power &mdash; away
          from a continent that rationed all three.
        </PullQuote>

        <P>
          It would be easy to end the diagnosis here, on the bleakest possible note: the machine has been
          handed a turbocharger and bolted it to the side that was already winning. And as description,
          that is correct. But the accelerant cuts both ways, and this is the hinge the final chapters
          turn on. A multiplier applied to a deficit widens it &mdash; but a multiplier is also the only
          thing that can close a gap fast, <em>if</em> you can get on the right side of it. The same
          deflation that lets a US hyperscaler serve a billion users cheaply also lets a five-person
          European startup do what once took five hundred people. The same Jevons explosion that rewards
          the compute-rich also creates more demand than any one bloc can serve. Europe is losing the AI
          race for reasons that are, every one of them, choices &mdash; and a technology that multiplies
          outcomes is, by definition, the most powerful tool ever invented for reversing a position fast.
        </P>

        <P>
          There is a particularly cruel edge to this for Europe, because the one corner of software the
          continent genuinely leads is exactly the corner the accelerant threatens first.
          Europe&rsquo;s enterprise-software champions &mdash; <Sq>SAP</Sq>, the German giant, and the
          per-seat business model it exemplifies &mdash; sell software by the user, by the month. But when a
          frontier model can do the data extraction, the support reply or the junior-developer task for a
          few cents of tokens, the per-seat fee starts to look like a toll the customer can route around,
          and the defensible ground migrates up to the things Europe does <em>not</em> own: the frontier
          model, the chips, the distribution. To feel the asymmetry that enforces it, hold one number in
          mind &mdash; a single US hyperscaler&rsquo;s annual capital budget now exceeds the entire yearly
          wage bill of a mid-sized European country&rsquo;s AI workforce. You cannot out-hire, out-build or
          out-spend that from a standing start, not without first deciding to try.
        </P>

        <P>
          Put the capital gap in named-company terms and it stops being an abstraction. In a single year{" "}
          <Sq>Microsoft</Sq> alone is spending something like eighty to a hundred-and-twenty billion dollars
          on AI and cloud infrastructure; <Sq>Amazon</Sq> on the order of two hundred; <Sq>Google</Sq> and{" "}
          <Sq>Meta</Sq> tens of billions each; and the <Sq>Stargate</Sq> venture alone proposes to spend up
          to half a trillion dollars on data centres over a few years. Any one of those line items dwarfs
          the whole of Europe&rsquo;s coordinated AI-infrastructure ambition. This is what it means to say
          the contest is decided by capital intensity: the unit of American investment is one
          company&rsquo;s quarterly capex, and the unit of European investment is the multi-year,
          twenty-seven-country, much-debated programme. They are not the same kind of number &mdash; and
          pretending they are is how a decade goes missing.
        </P>

        <P>
          There is one more turn of the screw, and it is the lane Europe most conspicuously left empty. As
          frontier models grew ruinously expensive, a parallel world of <Sq>open-weight</Sq> models &mdash;
          freely downloadable, cheap to run, good enough for most tasks &mdash; exploded to capture roughly{" "}
          <Sq>half of enterprise inference</Sq>. This was, in principle, Europe&rsquo;s natural territory:
          open, sovereign, deployable on your own hardware, the very antidote to renting intelligence from a
          foreign hyperscaler. Instead the open-weight flood was led from China, by DeepSeek and
          Alibaba&rsquo;s Qwen, and from American challengers like Meta&rsquo;s Llama &mdash; and even the
          open models run overwhelmingly on American and Chinese cloud infrastructure. Europe had the
          strongest possible case for an open, sovereign-inference strategy, and the talent to execute it,
          and watched two other powers fill the lane while it debated the rules of the road.
        </P>

        <P>
          The window in which this could be reversed cheaply is also closing, which is the part that should
          frighten European policymakers most. Each generation of frontier model costs more to train than
          the last &mdash; tens, then hundreds of millions of dollars, soon billions &mdash; and the set of
          organisations that can afford to sit at the very edge is narrowing toward a handful, all of them
          American or Chinese. A challenger two years behind today may be structurally unable to catch up
          tomorrow, not because its researchers are worse but because the price of a ticket to the frontier
          has risen past what any European entity will fund. The deflation makes intelligence cheap to{" "}
          <em>use</em> and ruinously expensive to <em>make</em> &mdash; and Europe, with all its savings,
          has so far chosen to be a buyer.
        </P>

        <P>
          Europe is not doing nothing. The <Sq>EuroHPC</Sq> programme has stood up some of the world&rsquo;s
          fastest public supercomputers &mdash; Germany&rsquo;s exascale <Sq>Jupiter</Sq> among them &mdash;
          and the gigafactory plan would add five more. It is real, sovereign, publicly-owned compute, and it
          deserves credit. But weigh it honestly against the private American build-out and the scale problem
          reappears: a single US hyperscaler brings more accelerated compute online in a quarter than
          Europe&rsquo;s flagship public machines hold in total, and it does so every quarter, funded by cash
          flows no public budget can match. Public supercomputers are necessary and they are not sufficient.
          The question is never whether Europe can build <em>some</em> sovereign compute. It is whether it
          can build enough, fast enough, to matter &mdash; and on current trajectories the honest answer is
          not yet.
        </P>

        <P>
          And the binding constraint, underneath the capital and the chips, turns out to be the most
          physical thing of all: <em>power</em>. Training a frontier model is, in the end, a question of how
          many megawatts you can point at a data centre for months on end &mdash; and on that axis
          Europe&rsquo;s two-to-threefold electricity-cost disadvantage from Chapter Seven becomes an AI
          disadvantage directly. The Chinese lab <Sq>DeepSeek</Sq> stunned the field in late 2025 by
          training a competitive model for a reported few million dollars and releasing it open-weight,
          proof that the frontier is not <em>only</em> about brute spend. But the broader trend runs the
          other way: training compute is scaling more than fivefold a year, and the three leading American
          labs alone command something like <Sq>sixty per cent of the world&rsquo;s frontier compute</Sq>.
          The accelerant&rsquo;s fuel is electricity and silicon, and Europe rationed its access to both.
        </P>

        <P>
          Europe is, to its credit, finally trying to build models of its own. <Sq>EuroLLM</Sq>, trained on
          Barcelona&rsquo;s MareNostrum supercomputer to speak all the EU&rsquo;s languages, and the{" "}
          <Sq>OpenEuroLLM</Sq> consortium spanning nine countries, are genuine attempts at a sovereign,
          open, multilingual alternative to the American and Chinese frontier. They are also, by the
          standards of the firms they mean to answer, tiny &mdash; tens of millions of euros against
          training runs that cost hundreds. And the constraint bites deeper down the chain than money: the
          advanced <Sq>packaging</Sq> that stitches AI chips together, TSMC&rsquo;s so-called CoWoS capacity,
          is sold out into 2027, the overwhelming majority pre-bought by American firms. You cannot rent your
          way to the frontier when the queue for the only factory that can build it is already full, and you
          are nowhere near the front.
        </P>

        <P>
          Reduce the whole contest to one ratio and it is brutal. The United States commands roughly{" "}
          <Sq>74% of the world&rsquo;s high-end AI compute</Sq>; Europe holds about <Sq>4.8%</Sq> &mdash;
          some seventeen times less &mdash; and even the optimistic projections have that share peaking near
          eight per cent later this decade before sliding back. Europe is responding at the only scale it can
          muster collectively: EuroHPC has announced something like <Sq>thirty-five new AI
          supercomputers</Sq> across twenty-three nations. It is a real and serious effort, and it is still
          being lapped, because the American build-out is private, profit-funded and relentless while the
          European one is public, budgeted and negotiated. Compute has become the new oil, and Europe is
          bringing a carefully-costed national programme to a market the hyperscalers are flooding with
          their own cash.
        </P>

        <P>
          The scale of the appetite is hard to hold in the mind. Global data centres are on course to
          consume more than <Sq>a thousand terawatt-hours</Sq> of electricity in 2026 &mdash; about as much
          as the whole of Japan &mdash; and the curve bends sharply upward from there. Satya Nadella,
          Microsoft&rsquo;s chief executive, drew the conclusion bluntly: economic growth, he said, will be
          &ldquo;directly correlated&rdquo; to the cost of the energy that powers AI. Read that sentence from
          a European chair and it is a verdict. The continent has chosen, through Chapter Seven&rsquo;s long
          list of decisions, to make its energy among the dearest in the developed world &mdash; which means
          it has chosen, without ever quite saying so, to make itself one of the most expensive places on
          Earth to build the defining industry of the century. The accelerant runs on watts, and Europe
          rationed its own.
        </P>

        <P>
          To feel how far the frontier has run, look at a single American cluster. Elon Musk&rsquo;s xAI
          built a data centre in Memphis it calls <Sq>Colossus</Sq>, scaled toward two gigawatts of power
          and on the order of <Sq>half a million Nvidia GPUs</Sq> &mdash; one company, one site, commanding
          more concentrated AI compute than entire European nations, stood up in months. There is nothing in
          Europe remotely like it, and on current trajectories there will not be: the continent&rsquo;s
          flagship answer, Mistral&rsquo;s sovereign cloud outside Paris, is measured in tens of megawatts
          and thousands of chips &mdash; a creditable startup against an industrial juggernaut. The gap is
          not that Europe lacks AI ambition. It is that its largest ambition is roughly the size of an
          American afterthought.
        </P>

        <P>
          The cruelest statistic in the whole essay may be this one. Europe has more monthly users of
          large-language-model chatbots than the United States does &mdash; some <Sq>133 million</Sq>,
          roughly twice the American base &mdash; and almost every model they use was built in America.
          Europeans are, per head, among the most enthusiastic <em>consumers</em> of AI on Earth and among
          the most negligible <em>producers</em> of it: the continent files perhaps <Sq>3% of the
          world&rsquo;s new AI patents</Sq> against America&rsquo;s seventy. This is the chokepoint paradox
          rendered in a single behaviour &mdash; a market that adopts the technology avidly, pays for it
          eagerly, generates the data that improves it freely, and owns none of it. To be the best customer
          of an industry you hold no stake in is not a position of strength. It is the very definition of a
          market, as opposed to a competitor.
        </P>

        <P>
          And the frontier is already moving past the screen into the physical world, where Europe is, if
          anything, further behind. The race to build <Sq>humanoid robots</Sq> &mdash; general-purpose
          machines that could transform manufacturing and logistics &mdash; is being run by America&rsquo;s
          Figure and Tesla and a phalanx of Chinese firms; Figure&rsquo;s robots have already logged months
          on a <Sq>BMW</Sq> production line, which is to say that the German carmaker&rsquo;s glimpse of the
          robotic future runs on American hardware and American AI. There is no European entrant of
          comparable scale. The same holds in AI-for-science: the protein-folding breakthroughs that will
          reshape medicine came out of a London lab &mdash; owned, as ever, by Google. Whichever way the
          technology turns next, from chatbots to robots to drug discovery, Europe keeps arriving as the
          customer, the test site, or the acquired &mdash; almost never the owner.
        </P>

        <P>
          One pair of numbers captures the whole asymmetry. In 2025 American private investment in AI reached
          some <Sq>$286 billion</Sq>; the entire European venture-capital industry &mdash; not its AI
          spending, its <em>whole</em> annual venture pool, across every sector &mdash; deploys roughly{" "}
          <Sq>fifty billion dollars a year</Sq>. America invests more in artificial intelligence in a single
          year than Europe&rsquo;s venture industry deploys, across every sector, anywhere, full stop. You cannot compete for the
          defining technology of the century out of a venture industry a fraction the size of your
          rival&rsquo;s spending on that one technology alone. It is not that European investors are timid,
          though some are; it is that the pool they draw from is structurally too shallow, because the savings
          that should fill it are, as the capital chapter showed, parked in deposits and bonds and American
          markets instead. The accelerant runs on capital, and Europe brought a teaspoon to a flood.
        </P>

        <P>
          That is the knife-edge on which this essay now balances, and it is the right place to turn from
          diagnosis to prescription. The machine is real, the tribute is real, the accelerant is real. But
          nothing in any of these eleven chapters was an act of God. It was capital that chose safety,
          regulators who chose process, governments who chose fragmentation, and a continent that chose,
          again and again, to manage its decline with dignity rather than risk an undignified attempt to
          reverse it. The last question is the only one that matters: what would Europe have to actually
          <em>do</em> &mdash; not resolve, not report, but do &mdash; to take the key it is holding and
          change the lock?
        </P>
      </Prose>

      <Sources
        items={[
          "LLMflation: cost of a unit of LLM capability falling ~10×/yr (~1,000× over 3 years at the budget tier; ~60× at the frontier; GPT-4-class $30/Mtok → cents). a16z (“LLMflation”); Epoch AI (inference price trends).",
          "Jevons / token demand: ~24× token-demand growth by 2030; enterprise AI budgets ~5.8× even as per-token prices fell ~65%; agentic tasks 50k–500k+ tokens (1–3.5M for full coding workflows). Goldman Sachs; Stanford Digital Economy Lab.",
          "AI capex canyon: four US hyperscalers ~$725bn AI/data-centre capex in 2026 (+~77% YoY; ~$755bn incl. xAI/Stargate) vs ~$60bn for Europe (~12–13×). EU “AI Gigafactories” ~€20bn. CNBC / company filings (2026).",
          "Lab scale: Mistral (France) ~€11.7bn (Sep 2025) → ~€20bn/$23bn (2026 talks), ~$0.4bn ARR; vs OpenAI ~$852bn and Anthropic ~$965bn (2026; ~$47bn ARR) — Europe's best lab ~40× smaller. TechCrunch; company announcements.",
          "Frontier concentration: US ~50 notable AI models (2025) vs Europe ~3 and China ~30; US ~74% of high-end AI compute vs Europe ~5–6% (falling); every frontier-leading model since 2023 from a US lab. Stanford AI Index 2026; Epoch AI.",
        ]}
      />
    </section>
  )
}
