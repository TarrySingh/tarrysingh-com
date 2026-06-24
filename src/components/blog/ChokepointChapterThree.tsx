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
    <section id="chapter-3">
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
          Follow the cheques and the pattern is unmistakable. <Sq>Klarna</Sq> raised round after round from
          Sequoia and other American funds before listing in New York in 2025; <Sq>Revolut</Sq>, valued
          around thirty-three billion dollars, leaned on SoftBank&rsquo;s Vision Fund and General Catalyst
          and stayed private into 2026 on American late-stage money; <Sq>Graphcore</Sq>, once Britain&rsquo;s
          great hope to build an alternative to Nvidia&rsquo;s AI chips, ran short of European growth
          capital and was sold to Japan&rsquo;s SoftBank in 2024. The shortfall is structural, not
          anecdotal: the median European growth-stage round runs roughly{" "}
          <Sq>&euro;18&ndash;24 million</Sq> against <Sq>&euro;45&ndash;65 million</Sq> in the United
          States, and the missing middle &mdash; the Series B-to-C cheque that turns a promising company
          into a global one &mdash; is exactly where American capital steps in and takes the cap table.
        </P>

        <P>
          The deepest irony sits in the pension statements. European pension funds allocate a vanishingly
          small slice &mdash; on the order of <Sq>0.01% of their assets</Sq> &mdash; to domestic venture
          capital, roughly a third of the already-modest American rate, leaving a quarter-trillion euros a
          year of European retirement savings <em>not</em> backing European companies. Where does it go?
          Norway&rsquo;s sovereign wealth fund, the largest single pool of European capital on Earth, holds
          its biggest single positions in <Sq>Apple and Microsoft</Sq> &mdash; on the order of forty to
          fifty billion dollars each &mdash; and ranks among the larger holders of Nvidia besides. Which
          means a Dutch machine&rsquo;s biggest customers are funded, in part, by the pensions of Norwegian
          oil workers, whose returns then ride on American technology giants that depend on a Dutch
          monopoly the fund holds no special stake in. The savings are European. The equity is American.
          The circle closes on everyone except Europe.
        </P>

        <P>
          The cap-table capture has a flagship case, and it is the most valuable chip-design company
          outside the foundries. <Sq>ARM</Sq>, founded in Cambridge and the brains inside nearly every
          smartphone on Earth, was bought by Japan&rsquo;s SoftBank in 2016 and re-listed not in London but
          on Nasdaq in 2023 &mdash; every euro of value it has compounded since accruing on an American
          exchange under a Japanese owner. It is not the exception but the median: of European late-stage
          rounds large enough to build a global company, the clear majority are led or co-led by American
          investors, who set the terms, the domicile, and ultimately the destination of the exit.
        </P>

        <P>
          The failure has a precise location on the funding ladder, and European founders have a name for
          it: the <Sq>Series B cliff</Sq>. A European startup can raise a seed round and an A round at home
          well enough; the angels and early funds exist. It is the next cheque &mdash; the{" "}
          <Sq>twenty-five to a hundred million euros</Sq> that turns a promising company into a category
          leader &mdash; that goes missing, because Europe has too few funds large enough to write it. So at
          exactly the moment a company is proving it can scale, the only investors in the room with the
          chequebook to fund that scaling are American. They invest, and reasonably ask for what capital
          asks for: a board seat, a US holding company, a path toward a New York listing. The founder says
          yes, because the alternative is to stall &mdash; and another European company quietly becomes, in
          all the ways that matter, an American one. Not through failure. Through the precise absence of a
          single missing tier of domestic capital.
        </P>

        <P>
          Klarna is worth one last look, because its arc rehearses the whole machine in a single company. A
          Swedish founder built it on European soil; it scaled on American venture capital; in 2024 its
          chief executive boasted that AI had let it do the work of some <Sq>seven hundred</Sq> customer-
          service staff, a story that helped power the narrative toward a New York listing; and by 2026, with
          service quality slipping, it had quietly begun <Sq>rehiring humans</Sq> into a hybrid model. Read
          it slowly and every stroke is there: build in Europe, fund from America, optimise for the exit
          narrative rather than the durable business, and list in New York so the compounding accrues to US
          public markets. The founders bank the wealth; the value-creation machine itself ends up on the
          American side of the ledger.
        </P>

        <P>
          The aggregate scale of the shortfall is its own kind of indictment. Atomico&rsquo;s annual survey
          of European technology reckons the continent <Sq>underfunded its tech sector by some
          $375 billion</Sq> over the past decade relative to the United States, and would need a trillion
          dollars more in the next one merely to stop the gap widening. And the exits keep voting with their
          feet: <Sq>Klarna</Sq> finally went public on the New York Stock Exchange in September 2025 at about
          fifteen billion dollars &mdash; <em>down two-thirds</em> from its 2021 private peak, yet still
          chosen over any European venue &mdash; while <Sq>Wise</Sq> moved its primary listing to Nasdaq in
          2026, keeping London only as a secondary afterthought. Each is a small, rational decision by a
          single company; together they are a continent quietly conceding that the place where ambition gets
          financed and rewarded is somewhere else.
        </P>

        <P>
          The single starkest number in the whole capital story is the pension allocation, and it deserves
          to be stated baldly. European pension funds put on the order of <Sq>0.018% of their assets</Sq>
          into venture capital; American ones put closer to <Sq>1.9%</Sq> &mdash; a hundredfold difference,
          rooted in a 1979 American rule change that freed pensions to take the risk, which Europe never
          matched. The Netherlands&rsquo; ABP and APG between them steward over a trillion euros, much of it
          working in American markets. The good news is that the diagnosis has finally started producing
          instruments: France&rsquo;s <Sq>Tibi</Sq> programme has corralled tens of billions toward deep
          tech, and a European <Sq>Tech Champions Initiative</Sq> is assembling a fund-of-funds to write the
          big late-stage cheques Europe has always lacked. Whether these stay pilot-scale or become the new
          default is the hundred-billion-euro question on which the next decade turns.
        </P>

        <P>
          The founders themselves say it without euphemism. Pascal Gauthier, who runs the French
          crypto-security firm Ledger, put the capital problem in a single sentence: <Sq>&ldquo;Money is in
          New York today &mdash; it&rsquo;s nowhere else in the world, certainly not in Europe.&rdquo;</Sq>
          He was talking about his own sector, but the diagnosis generalises across the whole essay. The
          people who run European companies are not confused about where the capital is; they live the
          shortage daily, and a striking number quietly conclude that the rational response is not to fix
          Europe but to go where the money already sits. The capital drain is not, at bottom, an accident of
          policy. It is the aggregate of thousands of founders making the same clear-eyed, individually
          correct decision to follow the money west.
        </P>

        <P>
          London tells the same story in miniature, and faster. In the first half of 2025, companies raised
          a mere <Sq>&pound;160 million</Sq> in initial public offerings on the London market &mdash; the
          weakest in more than three decades &mdash; while a parade of its biggest names voted with their
          feet: Wise shifted its primary listing to Nasdaq, the gambling group Flutter moved to New York,
          and Arm, the Cambridge chip-design jewel, had already chosen New York over its home exchange. A
          half-per-cent stamp duty on UK share trades that New York does not levy, and fintech valuations
          that run a third to two-thirds higher on Nasdaq, make the arithmetic brutally simple: for a growth
          company, listing in London is, in the cold words of more than one adviser, &ldquo;not
          rational.&rdquo; The City that once financed the world now watches the world&rsquo;s ambition list
          somewhere else.
        </P>

        <P>
          Underneath the venture shortfall is a deeper, more cultural gap: Europeans simply do not own equity
          the way Americans do. Around <Sq>62% of American adults</Sq> hold stocks; in Germany the figure is
          closer to <Sq>15%</Sq>, in Britain a third. European companies raise some 85% of their financing
          from banks, against barely half in the United States &mdash; which means European capital is
          structurally biased toward the safe, collateralised loan and away from the risky equity stake that
          funds a frontier company. And where Europeans do invest in markets, they increasingly do it through
          American hands: US asset managers &mdash; BlackRock, Vanguard, State Street &mdash; now run close to{" "}
          <Sq>half of all European assets under management</Sq>. So the continent not only sends its savings
          to American markets; it increasingly pays American firms to manage the journey. The drain is not a
          single leak. It is the plumbing.
        </P>

        <P>
          Some of the drain is written directly into Europe&rsquo;s own rulebook. Under <Sq>Solvency II</Sq>,
          the regime governing the continent&rsquo;s vast insurance industry, holding equity &mdash; the
          patient, risk-bearing capital that builds companies &mdash; carries a punitive capital charge,
          while government bonds are treated as nearly free. So the very institutions that in America are
          among the largest backers of long-term innovation are, in Europe, regulated into parking their
          trillions in safe debt instead. It is the chokepoint paradox turning on itself: a continent that
          complains it lacks risk capital has built a prudential system that taxes risk and rewards the safe
          option, then acts surprised when its insurers and pension funds behave exactly as the rules
          instruct. The savings are not missing. They are being regulated into timidity.
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
