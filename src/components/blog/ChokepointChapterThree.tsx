import type { ReactNode } from "react"

import { FourStrokeEngine } from "./FourStrokeEngine"
import { TheReservoir } from "./TheReservoir"
import { CapitalCliff } from "./CapitalCliff"
import { ExitValueScissors } from "./ExitValueScissors"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * CHAPTER 3 — The Standing Order: How Europe Funds Its Own Defeat.
 * The spine chapter: capital flight as the engine. The four-stroke loop, the
 * idle reservoir, the late-stage cliff, the exit-value scissors, the pension
 * paradox. Figures verified to July 2026 (Letta 2024; ECB 2026; Invest
 * Europe/Dealroom 2025; company filings). V9/V10/V11/V12 embedded.
 */
export function ChokepointChapterThree() {
  return (
    <section>
      <ChapterMark kicker="Chapter Three · The Standing Order" title="How Europe Funds Its Own Defeat" />

      <Prose>
        <Lead>
          A standing order is the quietest instrument in finance. You authorise it once, and it pays out
          forever &mdash; no decision, no signature, no meeting &mdash; until someone actively cancels it.
          Europe has one. It wires a few hundred billion euros a year to the United States, it has been
          running for at least a decade, and no one in Brussels has cancelled it, partly because no one
          quite admits it is there. Every symptom in this essay &mdash; the scale-ups that emigrate, the
          champions that list in New York, the pension funds that won&rsquo;t back their own economy
          &mdash; is a withdrawal from the same account. This chapter is about the engine beneath the
          symptoms: the machine that carries European wealth out of Europe, and runs a little wider every
          year.
        </Lead>

        <P>
          The mechanism turns in four strokes, and once you see them you cannot unsee them. Europe{" "}
          <Lev>saves</Lev> more than almost anyone &mdash; and routes the savings abroad. It{" "}
          <Lev>funds</Lev> the early life of its best companies &mdash; then hands the profitable
          adulthood to foreign capital. It <Lev>trains</Lev> the talent &mdash; and exports it to be paid
          three to five times more elsewhere. And then it <Sq>buys back</Sq>, at retail and wearing an
          American logo, the cloud, the chips and the models it could have owned. Save, fund, train, buy
          back: four strokes to a turn, and each rotation hands a rival the capital and the people to win
          the next one. Step through the engine below; there is a toggle to run it backwards, which is the
          whole argument of the essay in one switch.
        </P>
      </Prose>

      <Figure max={1160}>
        <FourStrokeEngine />
      </Figure>

      <Prose>
        <P>
          Begin with the first stroke, because it is the one that should be impossible. Europe is not
          capital-poor; it is the most capital-rich bloc on the planet. Households and institutions across
          the European Union hold something like <Won>&euro;33 trillion</Won> in private financial wealth,
          of which roughly <Sq>&euro;10 trillion sits idle in bank deposits</Sq>, earning next to nothing
          &mdash; about 70% of household savings parked in cash, against closer to 30% in the United
          States. This is a reservoir of patient money the size of the entire EU economy and then some.
          And every year, instead of irrigating the firms next door, around <Sq>&euro;300 billion of it
          flows over the dam</Sq> to be invested in foreign &mdash; overwhelmingly American &mdash;
          markets. The continent that saves the most has built its plumbing so the water runs uphill, away
          from its own fields. Move the valve below and watch how little it would take to turn the flow
          around.
        </P>
      </Prose>

      <Figure>
        <TheReservoir />
      </Figure>

      <Prose>
        <P>
          The second stroke is subtler and crueller, because here Europe does show up &mdash; just never
          when it counts. European capital is present at the birth of its companies and absent at their
          adolescence. It leads roughly <Lev>78% of early-stage rounds</Lev>, the seed cheques that get an
          idea off the ground. But by the late-stage rounds &mdash; the large raises that actually build a
          global company &mdash; the European share of lead investment collapses to about <Sq>18%</Sq>.
          Put the other way: some <Sq>82% of European scale-up rounds are led by foreign capital</Sq>,
          mostly American, and that capital comes with a quiet, reasonable condition &mdash; move closer to
          where the rest of the portfolio lives, to the deeper market, to the New York listing. Europe
          pays for the childhood and signs the adoption papers at adolescence. Scrub the funding stages
          below and watch the domestic money fall off the cliff exactly where the company needs it most.
        </P>
      </Prose>

      <Figure>
        <CapitalCliff />
      </Figure>

      <Prose>
        <P>
          The continent is dimly aware of this one. Its answer, announced in 2025, is the{" "}
          <Sq>Scaleup Europe Fund</Sq> &mdash; some &euro;5 billion, managed by EQT, with a first close
          pencilled in for autumn 2026: a single fund to patch a structural hole through which tens of
          billions drain every year. It is a thimble bailing a reservoir, and the fact that it counts as
          bold tells you how low the bar has sunk.
        </P>

        <P>
          The third and fourth strokes show up on the cap table, and this is where the abstraction becomes
          a row of names. Europe&rsquo;s champions are conceived in Europe and captured in America, and the
          captures are recent, dated, and verifiable. <Sq>Klarna</Sq>, the Swedish fintech, listed not in
          Stockholm or Amsterdam but on the New York Stock Exchange in September 2025. <Sq>Wise</Sq>, the
          British money-transfer company, moved its primary listing to Nasdaq in May 2026, keeping London
          only as a secondary. <Sq>Arm</Sq>, the crown jewel of British chip design, is SoftBank-owned and
          Nasdaq-listed. <Sq>DeepMind</Sq>, the most important AI lab Europe ever produced, is a division
          of Google. Adyen and Mollie took American capital to grow. The blades of the scissors are value
          created on one side and value captured on the other, and they open a little wider with every
          champion. Click through them below.
        </P>
      </Prose>

      <Figure>
        <ExitValueScissors />
      </Figure>

      <Prose>
        <P>
          And then there is the detail that turns the whole chapter from negligence into something
          stranger &mdash; the sight of Europe funding the very firms that buy its children, with its own
          retirement money. <Won>Norway&rsquo;s sovereign wealth fund</Won>, the &euro;1.7-trillion pension
          pot built on Norwegian oil, is a multi-billion-euro shareholder in exactly the American giants at
          the centre of this story: on the order of <Sq>$49 billion of Apple</Sq> and <Sq>$42 billion of
          Microsoft</Sq>, around 1.3% of each. (It is not, contrary to the easy line, a top-five holder of
          any of them &mdash; that tier belongs to Vanguard, BlackRock and State Street &mdash; but it is a
          major one.) A European nation took the windfall under the North Sea and used it to become a
          landlord of Silicon Valley. There is nothing wrong with the investment; Apple and Microsoft are
          fine assets. There is something deeply wrong with a continent that can find tens of billions for
          American incumbents and almost nothing for its own challengers.
        </P>

        <P>
          Which is the purest expression of the whole machine: the European pension system, sitting on the
          deepest retirement savings in the world, allocates a vanishing fraction of it to the venture
          capital that builds the future. The European figure is around <Sq>0.01% of assets</Sq>; the
          American figure is roughly <Lev>0.03%</Lev> &mdash; three times as much from a system that is
          itself far from generous. A hundredth of a percent. The savers&rsquo; own money, managed in the
          savers&rsquo; own name, declines to back the economy the savers will retire into &mdash; and
          flows instead to the firms that will sell that economy its software at a markup. The standing
          order does not need a villain. It needs only a thousand prudent people each doing the normal,
          defensible, individually-blameless thing.
        </P>

        <PullQuote>
          No one is stealing Europe&rsquo;s wealth. Europe is wiring it out, on a standing order it set up
          itself, renews by default, and has decided &mdash; for ten years running &mdash; not to cancel.
        </PullQuote>

        <P>
          That is also the good news, such as it is. A standing order is cancellable. Nothing in this
          chapter is a law of physics; every stroke of the engine is a policy, a default, a habit of mind
          that could be changed by people who are still alive and still in office. The €33 trillion is
          real and it is here. The plumbing that sends it west is plumbing, not destiny. What it would take
          to reverse the flow is not genius or money &mdash; Europe has both in surplus &mdash; but the
          nerve to point its own savings at its own future, and to keep pointing them there across the
          four-year cycles that keep resetting the aim.
        </P>

        <P>
          The next chapter is where the cost of <em>not</em> doing so stops being a financial abstraction
          and becomes a physical one. Because the same continent that exports its capital also owns the
          single most strategic asset in the modern economy &mdash; the machine in Veldhoven &mdash; and
          has spent that chokepoint as carelessly as it spends everything else. We turn to the
          semiconductor, the crown jewel Europe holds and somehow still manages to lose.
        </P>
      </Prose>

      <Sources
        items={[
          "Enrico Letta, “Much more than a market” (EU Council, Apr 2024): €33tn EU private financial wealth; ~€300bn/yr leaves the EU (largely to the US).",
          "EU Savings & Investments Union (European Commission, Mar 2025): ~€10tn of household savings in bank deposits; ~70% of EU household savings in cash/deposits (vs ~30% US).",
          "European scale-up funding cliff (Invest Europe / Dealroom 2025; Letta report): European capital leads ~78% of early-stage but ~18% of late-stage rounds; ~82% of scale-up rounds foreign-led. Scaleup Europe Fund (~€5bn, EQT-managed, first close autumn 2026).",
          "Champion captures (company filings/announcements): Klarna NYSE listing, Sept 2025; Wise primary listing moved to Nasdaq, May 2026 (LSE secondary retained); Arm — SoftBank-owned, Nasdaq-listed; DeepMind — a Google division.",
          "Norway Government Pension Fund Global (NBIM, 2026): ~€1.7tn fund; ~$49bn in Apple, ~$42bn in Microsoft (~1.3% each) — a major but not top-5 holder.",
          "Pension-fund venture allocation (ECB, May 2026): EU pension funds ~0.01% of assets to venture capital vs US ~0.03% — a ~3× gap.",
        ]}
      />
    </section>
  )
}
