import type { ReactNode } from "react"

import { LockAndKey } from "./LockAndKey"
import { ReversalLevers } from "./ReversalLevers"
import { GreenShoots } from "./GreenShoots"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * CHAPTER 12 — The Key Europe Holds (the constructive turn) + the Coda.
 * Europe is not poor or weak; it holds the most irreplaceable chokepoint asset
 * on Earth and a written, costed plan — and has never turned the key. Figures
 * verified to July 2026 (ASML/IMEC; ECB/BCG; Letta; Draghi audits; Mistral).
 * V40/V41/V42, then the Coda.
 */
export function ChokepointChapterTwelve() {
  return (
    <section id="chapter-12">
      <ChapterMark kicker="Chapter Twelve · The Turn" title="The Key Europe Holds" />

      <Prose>
        <Lead>
          After eleven chapters of loss it would be reasonable to expect this one to be a eulogy. It is
          not, and the reason is the single most important fact in the entire essay: Europe is not poor,
          and it is not weak, and it is not, whatever the figures suggest, out of the game. It is a
          continent that holds a genuinely extraordinary hand and has spent fifteen years declining to
          play it. The tragedy of the chokepoint paradox was never that Europe lacks the cards. It is that
          it holds the one card no one else can replace &mdash; and keeps it in its pocket. This chapter is
          about the card, the moves, and the first real signs that the continent has finally started to
          reach for the table.
        </Lead>

        <P>
          Begin with the card itself, because it is almost absurdly good. In the small Dutch town of
          Veldhoven sits <Won>ASML</Won>, a company worth around <Sq>&euro;677 billion</Sq> that holds a{" "}
          <Sq>100% monopoly</Sq> on extreme-ultraviolet lithography &mdash; the machines without which no
          advanced chip on Earth can be made. Not most chips: <em>none</em> of the leading-edge ones. TSMC
          cannot print a 3-nanometre processor without ASML; neither can Samsung, nor Intel, nor anyone in
          China, at any price, because there is no substitute and no second source. This is not a
          vulnerability. It is the most concentrated point of leverage in the entire global technology
          supply chain, and it is European. Around it Europe holds the rest of a formidable hand:{" "}
          <Sq>&euro;33.5 trillion</Sq> in household savings, a single market of <Sq>450 million</Sq>
          people, <Sq>22% of the world&rsquo;s scientific papers</Sq>, and &euro;2.5 trillion of
          manufacturing. The title of this essay is not a metaphor. Europe holds the key. Turn it below.
        </P>
      </Prose>

      <Figure max={1160}>
        <LockAndKey />
      </Figure>

      <Prose>
        <P>
          So if the assets are real, the obvious question is what to <em>do</em> with them &mdash; and
          here is the part that should be either infuriating or liberating, depending on the hour: there is
          no mystery. The plans are written, costed, and in several cases already signed. Mobilise the
          savings through a real Savings and Investments Union, and the <Sq>&euro;10-11 trillion</Sq>
          sitting in low-yield deposits &mdash; and the roughly <Sq>&euro;300 billion a year</Sq> that
          currently leaks abroad &mdash; could fund European companies instead of American ones. Complete
          the single market, whose internal barriers still amount to tariff-equivalents of around{" "}
          <Sq>54% on goods and 95% on services</Sq>, and the prize is on the order of{" "}
          <Won>&euro;2.8 trillion</Won> of GDP; Enrico Letta&rsquo;s &ldquo;One Europe, One Market&rdquo;
          roadmap has even put a deadline on it &mdash; December 2027. Back the frontier through InvestAI&rsquo;s{" "}
          <Sq>&euro;200 billion</Sq> mobilisation and its five planned AI gigafactories. Fix the grid and
          the power price. Buy and build European. Pull the levers below &mdash; and then look at the gauge
          that matters.
        </P>
      </Prose>

      <Figure max={1160}>
        <ReversalLevers />
      </Figure>

      <Prose>
        <P>
          That gauge is the whole problem in one number. As of early 2026, barely <Sq>11 to 15%</Sq> of
          the Draghi report&rsquo;s recommendations had been fully implemented. The savings-union measures
          are mostly non-binding suggestions to member states; the single-market roadmap is a list of
          intentions with a deadline it is already behind. This is the chokepoint paradox in its purest
          form: the diagnosis is correct, the prescription is written, the patient has the money for the
          medicine &mdash; and the prescription sits un-filled on the counter, because filling it requires
          twenty-seven governments to act together against their own short-term incentives, and that is the
          one thing the machine is built to prevent. The levers are not missing. The hand on the levers is.
        </P>

        <P>
          And yet &mdash; and this is why the chapter is not a eulogy &mdash; something has changed in the
          last eighteen months that fifteen years of competitiveness reports never managed. The continent
          has started, haltingly and unevenly, to move. Germany <Won>rejected Palantir</Won> over
          sovereignty. A sovereign software suite, Euro-Office, launched; Denmark, Austria and France began
          migrating their public sectors off Microsoft. Mistral raised three billion euros at a twenty-
          billion valuation and crossed four hundred million in revenue. Europe pledged to spend like it
          means it on defence. Letta&rsquo;s roadmap got signed. None of these is sufficient. All of them
          are real. Walk the field below and watch when it came alive.
        </P>
      </Prose>

      <Figure max={1160}>
        <GreenShoots />
      </Figure>

      <Prose>
        <P>
          Read those green shoots carefully, though, because they share a single, sobering root: almost
          every one was watered by <em>fear</em>, not foresight. Germany did not reject Palantir because of
          an economic argument; it did so because an American administration had made the cost of
          dependence suddenly, viscerally real. Europe is re-arming because Russia is on its border and the
          American guarantee feels conditional. The data-sovereignty awakening followed a war-crimes
          prosecutor&rsquo;s email going dark. The recurring, uncomfortable finding of this entire essay is
          that the slow economic version of the threat &mdash; the bloodless capture documented in every
          chapter &mdash; never moved Europe at all; only the sharp, frightening version did. The open
          question, the one the next five years will answer, is whether a continent can learn to act on the
          quiet emergency before it becomes a loud one.
        </P>
      </Prose>

      <Prose>
        <P>
          Return, finally, to the savings, because they are the whole argument in microcosm. Of
          Europe&rsquo;s household wealth, something like <Sq>&euro;10 to 11 trillion</Sq> sits in bank
          deposits earning next to nothing &mdash; not invested, not at risk, not building anything, simply
          parked. In the same years, the continent&rsquo;s own competitiveness reports put the annual
          investment shortfall at <Sq>&euro;800 billion and climbing toward &euro;1.4 trillion</Sq>. The
          money to close the gap is not missing; it is sitting in current accounts, and a third of a
          trillion euros of it leaks abroad every year to be invested by someone else, in someone
          else&rsquo;s companies, for someone else&rsquo;s returns. A continent does not get more
          self-evidently rich, or more self-evidently timid, than that: the deepest savings pool on Earth,
          declining to fund its own future, then wondering why the future is owned elsewhere.
        </P>
      </Prose>

      <Prose>
        <P>
          None of which means the only move is to out-spend the un-out-spendable. The smarter prescriptions
          aim not at matching America gigafactory for gigafactory but at the lanes where Europe could
          actually win. <Sq>Edge inference</Sq> &mdash; running AI cheaply on local, low-power chips rather
          than in vast foreign data centres &mdash; plays to European strengths in semiconductors and
          embedded systems; companies like the Dutch-founded <Sq>Axelera</Sq> are already chasing it.
          Open-weight, sovereign models hosted on European soil answer the dependence head-on. And the
          single most powerful lever requires no new technology at all: redirect even a fraction of the{" "}
          <Sq>&euro;33 trillion</Sq> in European savings &mdash; through a pension-allocation rule, a public
          guarantee, a Savings and Investments Union with actual teeth &mdash; and the missing growth
          capital appears, because it was never truly missing. It was parked.
        </P>
      </Prose>

      <Prose>
        <P>
          It would be dishonest to end on easy optimism, because the obstacle is real and it is structural.
          The reason the savings stay parked and the single market stays fragmented is not that no one has
          noticed; it is that every fix requires <Sq>twenty-seven governments</Sq> &mdash; each with its own
          banks to protect, its own champions to favour, its own electorate to answer to &mdash; to
          surrender a piece of control at the same moment. A genuine capital-markets union threatens national
          financial centres; a real single market threatens protected national firms; a serious industrial
          policy means picking winners across borders. Each is individually rational to block, and
          collectively catastrophic to keep blocking. That is the true lock on the door &mdash; not American
          power but European collective inaction &mdash; and it is the one no foreign capital can pick for
          Europe, and none can keep shut either.
        </P>
      </Prose>

      <Prose>
        <P>
          And there are real things to back, named and fundable today, if the capital would only turn up.
          Draghi&rsquo;s own report called for a <Sq>&euro;50-billion European Deep Tech Fund</Sq>; the seeds
          it would water already exist. <Sq>Axelera</Sq> and Germany&rsquo;s <Sq>Black Semiconductor</Sq> are
          building European AI silicon; <Sq>IQM</Sq> in Finland and <Sq>Pasqal</Sq> in France are among the
          world&rsquo;s leading quantum-computing firms; a <Sq>EuroStack</Sq> movement has published a
          manifesto for a modular, Europe-owned computing stack from chips to cloud to applications. None of
          these is a fantasy; each is a company or a coalition with customers and a roadmap, starved only of
          the patient, late-stage capital Europe exports by the hundreds of billions every year. The way out
          is not a mystery waiting to be discovered. It is a decision, already drafted and costed, waiting to
          be funded from savings that already exist.
        </P>
      </Prose>

      <Prose>
        <P>
          One reform in particular has gathered momentum because it attacks the fragmentation head-on:{" "}
          <Sq>&ldquo;EU Inc&rdquo;</Sq>, a proposed pan-European legal entity &mdash; a single, optional
          &ldquo;28th regime&rdquo; company form a founder could incorporate under once and operate across
          all twenty-seven member states, instead of refounding in each. Thousands of European founders and
          investors have signed on, because it targets the precise friction that sends them to Delaware: not
          a lack of talent or ideas, but the absurdity of a &ldquo;single market&rdquo; in which building a
          company that works everywhere means complying everywhere. It is small, technical and unglamorous,
          and it is exactly the kind of fix that matters &mdash; because the chokepoint was never built by
          one grand decision, and it will not be dismantled by one either. It will be dismantled, if at all,
          by a hundred boring reforms enacted with unfamiliar urgency.
        </P>
      </Prose>

      <Prose>
        <P>
          And the roster of fundable European deep tech is longer and stranger than the gloom suggests.{" "}
          <Sq>Isar Aerospace</Sq> is building rockets in Germany; <Sq>The Exploration Company</Sq>, split
          between Munich and Bordeaux, is building reusable space capsules; <Sq>Proxima Fusion</Sq> is
          chasing a working fusion stellarator with German state money behind it; <Sq>IQM</Sq> and{" "}
          <Sq>Pasqal</Sq> are selling real quantum computers to real customers. None is a sure thing;
          several will fail. But the seedbed is not empty &mdash; it is, if anything, unusually rich &mdash;
          and what these companies share is not a shortage of ambition or engineering but the same missing
          input as everyone else in this essay: the patient, scaled, late-stage European capital that would
          let them grow up at home instead of being bought, or starved, before they can. The way out is
          standing right there, incorporated and pitching. It is waiting to be funded.
        </P>
      </Prose>

      <Prose>
        <P>
          It helps to be honest about the size of what would be required, because it is the part the
          green-shoot stories tend to skate over. Draghi&rsquo;s own figure for the investment Europe needs
          is around <Sq>&euro;800 billion a year</Sq> &mdash; close to <Sq>5% of the continent&rsquo;s
          GDP</Sq>, sustained for years. To feel the scale: the Marshall Plan ran at roughly one per cent of
          American output; the Apollo programme peaked near half a per cent; what Draghi asks for is several
          times the intensity of either, not for a few years but indefinitely. That sounds impossible until
          you remember that Europe has already done the once-unthinkable thing the plan requires: in 2020 it
          agreed to <Sq>borrow jointly</Sq>, some &euro;750 billion through NextGenerationEU, breaking a
          taboo that had stood for the union&rsquo;s entire history. The machinery for collective ambition
          exists. It has been switched on exactly once, in a pandemic, and switched off again. The question
          the next decade answers is whether it takes a catastrophe to turn it on &mdash; or whether, just
          this once, foresight might be enough.
        </P>
      </Prose>

      <Prose>
        <P>
          And the templates for what such a mobilisation looks like are not exotic; America itself built
          them. The <Sq>Interstate Highway System</Sq> wired a continent together with public money over a
          decade; <Sq>DARPA</Sq> seeded the internet, GPS and a dozen foundational technologies by funding
          the research private capital would not touch; the whole American semiconductor and internet edge
          was, at root, a story of patient public investment that private dynamism then compounded. Europe
          keeps imagining that sovereignty is something you legislate. The American example says it is
          something you <em>build</em> &mdash; with state money, at national scale, over decades, accepting
          the failures along the way &mdash; and then let the market run with. Europe has the savings to fund
          a dozen DARPAs. What it has lacked is the conviction that the future is worth buying outright
          rather than renting by the year.
        </P>
      </Prose>

      <Prose>
        <P>
          France is the test case for whether ambition is enough, and the early returns are sobering. No
          government has tried harder: the <Sq>Tibi</Sq> programme has corralled some thirteen billion euros
          of institutional money toward European tech; <Sq>Mistral</Sq> is building a sovereign AI cloud
          outside Paris; <Sq>Hugging Face</Sq>, the Paris-founded &ldquo;GitHub of machine learning,&rdquo;
          hosts millions of open models as a genuine counterweight to the American labs; the country runs on
          cheap, clean nuclear power that ought to be a decisive AI advantage. And yet French startup
          funding still <Sq>roughly halved</Sq> in the first half of 2025 after a snap election spooked
          investors, and the flagship champions remain a fraction of their American rivals. If the European
          country doing the most can be knocked off course by a single election, the lesson is not that the
          strategy is wrong. It is that the strategy needs to be bigger, steadier, and shared across the
          whole continent &mdash; immune to any one nation&rsquo;s politics &mdash; or it will keep being
          undone faster than it can compound.
        </P>
      </Prose>

      {/* ───────────────────────── CODA ───────────────────────── */}
      <ChapterMark kicker="Coda" title="Europe Holds the Key" />

      <Prose>
        <P>
          We opened with a paradox and we can now close it. Europe is the richest savings bloc on the
          planet and Wall Street&rsquo;s most reliable source of capital. It trains the engineers, writes
          a fifth of the science, and owns the one machine in the entire chip supply chain that cannot be
          replaced. By every measure of raw capacity it should be a peer of the United States and a rival
          to China. And instead it ships its savings, its founders, its companies and a quarter-trillion
          euros a year to the firms that out-compete it, and calls the arrangement stability. This was
          never a failure of genius. Europe has the genius. It is a failure of nerve, and across twelve
          chapters the failure turned out to have names, dates, and line items &mdash; every one of them a
          choice, which means every one of them reversible.
        </P>

        <P>
          The cost of continuing as we are is not abstract, and Draghi named it plainly: without radical
          change, he warned, Europe faces a <Sq>&ldquo;slow agony&rdquo;</Sq> of decline, an
          &ldquo;existential challenge&rdquo; to the European model itself. The arithmetic agrees. On current
          trajectories Europe&rsquo;s share of world output, already down to around a seventh, slides{" "}
          <Sq>below a tenth by 2050</Sq> &mdash; a continent shrinking from a pole of the world economy into
          a museum of it, prosperous and admired and increasingly beside the point. Jean Monnet, who built
          the union out of the rubble of the last time Europe destroyed itself, left a line that reads
          differently now: there is, he wrote, &ldquo;no future for the people of Europe other than in
          union.&rdquo; He meant it as the path out of war. It is turning out to be the path out of decline
          as well &mdash; and Europe keeps, politely, declining to take it.
        </P>

        <PullQuote>
          A key in the pocket opens nothing. The whole of Europe&rsquo;s tragedy, and the whole of its
          hope, is that the lock was never the problem. The hand was.
        </PullQuote>

        <P>
          That is, in the end, the strange consolation of the chokepoint. A continent that had simply been
          out-built could do nothing but try to build faster and lose. But Europe has not been out-built;
          it has been out-<em>nerved</em>. It holds ASML, the savings, the market, the science &mdash; the
          key is real and it is in European hands. Turning it does not require a miracle, a new technology,
          or American permission. It requires twenty-seven governments and a few hundred million people to
          decide, just once, that managing a dignified decline is the more frightening option. Washington
          owns the lock. But the lock is useless to everyone, including Washington, if the key is never
          turned &mdash; and the key, the one no one else on Earth can cut, has been European all along. The
          only question left in the whole affair is the one this essay cannot answer, because it is not a
          question of data: will Europe turn it?
        </P>
      </Prose>

      <Sources
        items={[
          "ASML: ~€677bn market cap; ~100% monopoly on EUV lithography (no substitute — no leading-edge chip is made without it); IMEC/Zeiss High-NA EUV (2026). ASML; IMEC. NB: ARM is not European (SoftBank-owned, run from Tokyo).",
          "Structural strengths: ~€33.5tn EU household savings (~€61tn net wealth, euro area); single market of ~450m; ~22% of global scientific publications (Elsevier, 2025); ~€2.5tn manufacturing value-added. ECB/BCG; Eurostat; Elsevier.",
          "Savings & Investments Union: ~€10–11tn in idle deposits; ~€300bn/yr capital outflow; measures (Savings & Investment Accounts, securitisation) largely non-binding/in trilogue (2025–26). European Commission.",
          "Single market: internal barriers ≈ 54% (goods) / 95% (services) tariff-equivalents (ECB, Jan 2026); ~€2.8tn potential GDP gain (2022–32); Letta “One Europe, One Market” roadmap, deadline Dec 2027. ECB; Letta report; European Parliament.",
          "Frontier build & implementation: InvestAI ~€200bn mobilisation / €20bn facility → 5 AI gigafactories; Mistral ~€3bn raise at ~€20bn, ARR past $400m (Jun 2026). Only ~11–15% of Draghi recommendations fully implemented (early 2026). European Commission; TechCrunch; Draghi implementation audits.",
          "Green shoots (2026): Germany rejected Palantir (Apr); Euro-Office launched (Jun); Denmark/Austria/France migrating off Microsoft; ~€800bn ReArm Europe; Letta roadmap signed (Apr). German MoD; European Commission.",
        ]}
      />
    </section>
  )
}
