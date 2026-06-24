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
