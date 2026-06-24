import type { ReactNode } from "react"

import { RegressiveTax } from "./RegressiveTax"
import { StopTheClock } from "./StopTheClock"
import { TwentySevenMaze } from "./TwentySevenMaze"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * CHAPTER 9 — The Moat With the Drawbridge Down: Regulation.
 * Europe's one reflex — the rulebook — and how it taxes its own challengers,
 * fragments its own market, and then retreats from its own law. Figures
 * verified to July 2026 (NBER WP 33909; Draghi; DIGITALEUROPE; Digital
 * Omnibus). V30/V31/V32 embedded.
 */
export function ChokepointChapterNine() {
  return (
    <section id="chapter-9">
      <ChapterMark kicker="Chapter Nine · The Moat" title="The Moat With the Drawbridge Down" />

      <Prose>
        <Lead>
          When Europe cannot spend and will not build, it does the one thing it is still unmatched at: it
          writes a rule. For a decade this was sold as a superpower &mdash; the &ldquo;Brussels
          Effect,&rdquo; the idea that the EU&rsquo;s vast single market lets it set the standards the
          whole world must follow, from privacy to AI. There is something to it. But the effect has
          curdled, and this chapter is about the curdling: a regulatory moat dug so deep, and policed by so
          many hands, that it no longer keeps the rivals out so much as it seals Europe&rsquo;s own
          challengers in &mdash; a fortress with the drawbridge stuck down, the garrison taxed for the
          privilege of defending it.
        </Lead>

        <P>
          The clearest evidence is the one regulation Europe is proudest of. The GDPR was a genuine moral
          achievement and a measurable economic own-goal: a 2025 study from the National Bureau of
          Economic Research found that, after it took effect, the number of EU venture deals led by US
          investors fell by about <Sq>20.6%</Sq>, and EU technology venture investment dropped roughly{" "}
          <Sq>26% relative to the United States</Sq>. The rule meant to protect Europeans from Big Tech
          also, quietly, made it harder for the next European challenger to Big Tech to get funded. And the
          pattern generalises through the compliance cost itself, because compliance is a <em>regressive
          tax</em>: the roughly <Sq>&euro;200,000 to &euro;600,000</Sq> a high-risk AI-Act provider must
          spend &mdash; on top of a quality-management system and per-model assessments &mdash; is a
          rounding error for a hyperscaler and an extinction event for a seed-stage startup. The total bill
          runs to an estimated <Sq>&euro;3.3 billion a year</Sq> across the EU. Scrub firm size below and
          watch the burden invert: heaviest where Europe can least afford it.
        </P>
      </Prose>

      <Figure>
        <RegressiveTax />
      </Figure>

      <Prose>
        <P>
          The burden is multiplied by the thing that should have been Europe&rsquo;s greatest asset and is
          instead its greatest tax: the market is not single. The Draghi report counted more than{" "}
          <Sq>13,000 EU legal acts</Sq> passed between 2019 and 2024 &mdash; against roughly 5,500 in the
          United States over a comparable span &mdash; and over <Sq>270 digital regulators</Sq> spread
          across the member states (and the true volume of implementing acts is almost certainly higher).
          A US startup writes its software once and sells it into one market of 340 million people. A
          European startup writes its compliance 27 times, threads 27 national interpretations, and
          answers to a constellation of overlapping authorities. The single market is, for a small company
          with no compliance department, twenty-seven mazes wearing one name. Run a founder through it
          below.
        </P>
      </Prose>

      <Figure max={1160}>
        <TwentySevenMaze />
      </Figure>

      <Prose>
        <P>
          And here is the confession, the moment the whole strategy looked in the mirror and flinched.
          Europe passed the most ambitious AI law in the world, the AI Act, with its toughest obligations
          for high-risk systems due to bite on <Sq>2 August 2026</Sq>. Then, with the deadline in sight and{" "}
          <Sq>some 78% of organisations</Sq> reporting they had taken no compliance steps at all, Brussels
          reached for a lever it had never publicly admitted owning: it stopped its own clock. Through the
          &ldquo;Digital Omnibus&rdquo; agreed in May 2026, the high-risk deadline was pushed back to{" "}
          <Sq>2 December 2027</Sq> &mdash; a sixteen-month reprieve from a rulebook the EU had written
          itself. It is hard to think of a more eloquent admission that the regime had outrun the economy
          it governs. Advance the clock below and watch Europe drag its own deadline backwards.
        </P>
      </Prose>

      <Figure max={1160}>
        <StopTheClock />
      </Figure>

      <Prose>
        <P>
          None of this means the targets of the rules are sympathetic, or that the rules do nothing. When
          the EU fined Apple <Won>&euro;500 million</Won> in 2025 for blocking developers from steering
          users to cheaper deals, and forced its App Store commissions down from the old 15&ndash;30% toward
          7&ndash;10%, that was a real win for a real abuse &mdash; the Brussels Effect doing exactly what
          it says. But notice the asymmetry even in victory: Apple appealed, kept collecting on the vast
          majority of the App Store economy, grew its services revenue anyway, and absorbed the fine as a
          cost of doing business. The giant pays the toll and walks on. It is the challenger, the one the
          rules were nominally meant to make room for, who finds the drawbridge in its face.
        </P>

        <PullQuote>
          A moat only protects you if the drawbridge goes up for your enemies and down for your friends.
          Europe built the deepest moat in the world and then lowered the bridge for the giants and raised
          it against its own.
        </PullQuote>

        <P>
          The deepest problem with the regulatory reflex is not any single rule; it is what the reflex
          reveals. Regulation is the tool of a power that has decided its job is to <em>govern</em> an
          economy someone else will build &mdash; to be the referee, the standard-setter, the conscience
          &mdash; rather than to build the economy itself. It is the posture of a landlord, not an owner;
          a regulator of other people&rsquo;s platforms, not a builder of its own. And a continent that
          regulates what it does not own ends up, by a slow and dignified route, owning nothing but the
          rulebook. Which brings us, at last, to the bill &mdash; the one chapter that totals the whole
          machine, in euros, and asks where a quarter of a trillion of them go every single year.
        </P>
      </Prose>

      <Sources
        items={[
          "GDPR effect on venture: ~20.6% fall in EU deals led by US investors; ~13% fall in deal amounts (~$1.6bn/yr); ~26% drop in EU tech VC relative to the US. NBER Working Paper 33909 (Jia et al., 2025).",
          "Regulatory volume: >13,000 EU legal acts (2019–24) vs ~5,500 US; ~100 tech-focused laws + 270+ digital regulators (Draghi report, Sept 2024) — likely a lower bound (implementing-act undercount).",
          "AI Act compliance: high-risk providers ~€200k–600k+ initial (QMS ~€193k–330k; ~€29k/yr per model); ~€3.3bn/yr EU-wide; ~78% of organisations had taken no compliance steps by Apr 2026; penalties up to €35m or 7% of global turnover. DIGITALEUROPE; CEPS.",
          "“Stop-the-Clock” / Digital Omnibus (provisional agreement 7 May 2026): AI Act high-risk (Annex III) obligations delayed from 2 Aug 2026 to 2 Dec 2027 (Annex I to 2 Aug 2028). Gibson Dunn / European Commission.",
          "Apple DMA fine: €500m (Apr 2025) for App-Store anti-steering, under appeal; EU commissions reduced from 15–30% toward ~7–10%; Apple's Services revenue continued to grow. European Commission.",
        ]}
      />
    </section>
  )
}
