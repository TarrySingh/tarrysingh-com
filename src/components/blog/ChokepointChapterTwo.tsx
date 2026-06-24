import type { ReactNode } from "react"

import { DraghiTracker } from "./DraghiTracker"
import { WideningGap } from "./WideningGap"
import { CompassThatSpins } from "./CompassThatSpins"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * CHAPTER 2 — The Map Out, Filed Under Noted.
 * The Draghi report as the most lucid diagnosis Europe ever commissioned of its
 * own decline — and the 18-month autopsy of the inaction that followed. Figures
 * verified to July 2026 (Draghi 2024; Letta 2024; CER/Commission tracking;
 * ITIF; Atomico; ECB; Synergy). V6/V7/V8 embedded; Source Ledger at the foot.
 */
export function ChokepointChapterTwo() {
  return (
    <section id="chapter-2">
      <ChapterMark kicker="Chapter Two · The Map Out" title="Filed Under Noted" />

      <Prose>
        <Lead>
          In September 2024, Europe was handed the most lucid diagnosis of its own decline it has ever
          commissioned, and it has spent the eighteen months since proving the diagnosis right by
          ignoring it. The document was Mario Draghi&rsquo;s report on European competitiveness &mdash;
          four hundred pages, written by a former central banker with no election to win and no incentive
          to flatter, at the request of the European Commission itself. It is not a pamphlet. It is the
          establishment&rsquo;s own verdict on the establishment, and its central finding is the one this
          essay keeps arriving at from every direction: Europe is falling behind, the gap is widening, and
          the cause is not bad luck but a failure to act.
        </Lead>

        <P>
          The prescription was specific and enormous. To stop the slide, Draghi argued, Europe needs an
          additional <Sq>&euro;750&ndash;800 billion of investment every year</Sq> &mdash; on the order of{" "}
          <Sq>4.4 to 4.7% of EU GDP</Sq>, the largest sustained investment surge since the post-war
          reconstruction, roughly twice the scale of the Marshall Plan relative to the economy. He broke it
          down to the euro: about &euro;450 billion a year for decarbonisation, &euro;150 billion for
          digitalisation, &euro;100&ndash;150 billion for breakthrough innovation, &euro;50 billion for
          defence. And he was explicit that perhaps <Lev>80% of it must come from private capital</Lev>
          &mdash; which, given that Europe is the richest savings bloc on the planet, ought to have been
          the easy part. The map out was not vague. It came with a budget, a timeline, and a list of 383
          specific recommendations.
        </P>

        <P>
          Before the autopsy of what was done with it, look at the diagnosis itself, because the gap
          Draghi measured is not closing while you read about it &mdash; it is opening, on every axis that
          compounds. Click through them below.
        </P>
      </Prose>

      <Figure max={1160}>
        <WideningGap />
      </Figure>

      <Prose>
        <P>
          Each of those is a different instrument reading the same disease. Europe deploys a fraction of
          the venture capital the United States does &mdash; the American market runs <Lev>four to five
          times larger</Lev>, and in the late-stage rounds that build giants the asymmetry is starker
          still: Europe accounts for around <Sq>9% of global late-stage funding against America&rsquo;s
          68%</Sq>. On the capital expenditure that is currently deciding the AI era, the gap is not a
          multiple but a chasm: America&rsquo;s big platforms are spending something like{" "}
          <Sq>$700 billion in 2026</Sq> on data centres and AI, against a sovereign European figure nearer{" "}
          <Sq>&euro;10.6 billion</Sq> &mdash; a ratio in the region of <Won>fifty-five to sixty to
          one</Won>. The continent that invented the technologies is now a rounding error in the build-out
          that will monetise them. Draghi&rsquo;s report did not predict this so much as see it arriving
          and name the cause.
        </P>

        <P>
          So what did Europe do with four hundred pages of correct, expensive, establishment-sanctioned
          advice? It noted them. Eighteen months on, the most generous accounting of the 383
          recommendations finds that only about <Sq>15% are fully binding law</Sq> &mdash; and that figure
          is the <em>improvement</em>, up from roughly <Sq>11% the previous autumn</Sq>. The crawl is the
          story: four points of progress across a year on a plan whose own logic was that the window was
          already closing. Whole domains &mdash; energy, defence, pharmaceuticals, the automotive sector
          &mdash; register essentially <Sq>zero</Sq> structural progress. Scrub the timeline below and
          watch the map sit on the table, drawn in full, almost entirely unwalked.
        </P>
      </Prose>

      <Figure>
        <DraghiTracker />
      </Figure>

      <Prose>
        <P>
          It would be easier to forgive if the problem were disagreement. It is not. Almost nobody of
          consequence in Brussels disputes the Draghi diagnosis; ministers cite it approvingly in the
          speeches where they announce that it will be considered. The blockage is not intellectual. It
          is the thing the report itself named, in a phrase that should be carved over the door of the
          Berlaymont: <Sq>inertia as a rule of law</Sq>. Europe has built a governance machine whose
          steady state is deliberation, in which the production of a strategy is treated as
          interchangeable with the execution of one, and in which any individual government can slow the
          whole convoy to the speed of its most reluctant member.
        </P>

        <P>
          The clearest case is the one most central to Draghi&rsquo;s fix: the single market for capital
          that would let Europe&rsquo;s &euro;33 trillion of private savings fund Europe&rsquo;s own
          future. A Capital Markets Union has been official EU policy since <Sq>2015</Sq>. It has been
          relaunched, rebranded, and re-committed to roughly once per Commission ever since &mdash; most
          recently as a &ldquo;Savings and Investments Union,&rdquo; with the bloc&rsquo;s six largest
          economies issuing a fresh call to accelerate in May 2026 and a legislative package now aimed,
          with a straight face, at <Sq>&ldquo;summer 2026&rdquo;</Sq>. Eleven years of summers. The compass
          below is the most honest possible diagram of European industrial strategy: a needle that spins
          with great energy, points authoritatively at each new deadline, and never once settles on a
          bearing.
        </P>
      </Prose>

      <Figure>
        <CompassThatSpins />
      </Figure>

      <Prose>
        <P>
          And here is the part that turns farce into something colder. As the action has deflated, the{" "}
          <em>rhetoric</em> has inflated to fill the vacuum. The word that now saturates every European
          tech communiqué is <Won>&ldquo;sovereignty&rdquo;</Won> &mdash; digital sovereignty,
          technological sovereignty, strategic autonomy. It is a fine word, and Europe has discovered it
          at precisely the moment it has the least of the thing. The continent talks sovereignty while
          running <Sq>70 to 85% of its cloud</Sq> on American hyperscalers, while its savers keep{" "}
          <Sq>34% of their wealth in bank deposits</Sq> earning nothing rather than funding European
          firms, while &euro;300 billion a year of that wealth flows out to capitalise the rivals. The
          vocabulary of independence is doing the work that independence will not.
        </P>

        <P>
          Letta&rsquo;s parallel report on the single market, published five months before Draghi&rsquo;s,
          had already supplied the most damning number of all: of Europe&rsquo;s vast savings, some{" "}
          <Sq>&euro;300 billion leaves the continent every year</Sq>, much of it to be intermediated by
          Wall Street and lent back to Europe at a markup, or invested in the American companies that will
          buy Europe&rsquo;s best startups. A continent that cannot fund itself is not sovereign in any
          sense the word has ever carried, however many times a press release uses it. Sovereignty is not
          a slogan you adopt. It is a set of cheques you are willing to write.
        </P>

        <PullQuote>
          A diagnosis filed under &ldquo;noted&rdquo; is not neutrality. It is a more articulate way of
          losing &mdash; the difference between a patient who never saw the doctor and one who read the
          chart, agreed with it, and changed nothing.
        </PullQuote>

        <P>
          None of this means the door is shut. Draghi&rsquo;s map is still on the table, and the striking
          thing about it is how much of the required capital already exists inside Europe &mdash; it is a
          problem of plumbing and nerve, not of poverty. The Savings and Investments Union, if it were
          ever actually built, would route the &euro;300 billion home. The 15% implemented could become
          50%. The summer that never comes could, in principle, arrive. But hope is not a plan, and the
          first eighteen months are not encouraging, because they revealed the true obstacle: not that
          Europe does not know what to do, but that knowing has become, for an entire governing class, a
          comfortable substitute for doing.
        </P>

        <P>
          The continent has not failed to notice, and the record of its attempts to answer is its own kind
          of evidence. <Sq>Gaia-X</Sq>, launched in 2019 as Europe&rsquo;s grand sovereign-cloud project,
          curdled into what one analysis called a &ldquo;paper monster&rdquo; &mdash; years of working
          groups and standards documents, little running infrastructure, and a fatal decision to welcome
          the very American hyperscalers it was meant to counter into the consortium. Meanwhile the
          European providers&rsquo; combined share of their own cloud market has slid from about{" "}
          <Sq>29% in 2017 to roughly 15%</Sq>, and stuck there &mdash; treading water in a market growing
          some 24% a year, which means losing ground in everything but the press release.{" "}
          <Sq>OVHcloud</Sq>, the French flag-carrier, only crossed a billion euros of revenue in 2025; the
          three American hyperscalers spend more than that on data centres in a good fortnight.
        </P>

        <P>
          The newest attempts are more serious and worth crediting. Deutsche Telekom&rsquo;s{" "}
          <Sq>T Cloud</Sq> went live in 2025 and is building a sovereign industrial-AI cloud on Nvidia
          silicon in Germany; <Sq>SAP</Sq> launched a sovereign cloud in France in 2026 through the
          Orange-and-Capgemini venture &ldquo;Bleu,&rdquo; chasing the French state&rsquo;s SecNumCloud
          qualification. These are real and they matter. But read the architecture closely and the
          dependency keeps reappearing one layer down &mdash; the chips are Nvidia&rsquo;s, the reference
          designs American &mdash; and &ldquo;sovereign&rdquo; increasingly means a European-run building
          full of someone else&rsquo;s technology, governed by a contract that <em>promises</em> Washington
          cannot reach inside. It is better than nothing. It is not yet ownership.
        </P>

        <P>
          And the dependence deepens precisely as it appears to localise. The American hyperscalers have
          learned to answer Europe&rsquo;s sovereignty worries by building on European soil &mdash; AWS,
          Microsoft and Google have committed tens of billions of euros to data centres and &ldquo;EU
          sovereign cloud&rdquo; regions across Germany, France and beyond. It sounds like reshoring. It is
          closer to the opposite: a European building, full of American servers, running American software,
          billed on a subscription that can be re-priced or, in the limit, switched off from abroad. The
          concrete is European; the control is not. And the gap in who actually <em>spends</em> tells the
          real story &mdash; American AI and data-centre capital expenditure runs into the hundreds of
          billions a year against a European sovereign-cloud figure still measured in low tens.
        </P>

        <P>
          And the legal foundation under all of it has never actually been made sound. Ever since the{" "}
          <Sq>Schrems II</Sq> ruling struck down the previous EU&ndash;US data deal, European data sitting
          on American clouds has lived in a state of permanent legal provisionality &mdash; patched by
          successive frameworks that the same Austrian litigant who toppled the last two is already
          challenging. The result is a quiet institutional doublethink: European bodies know the platforms
          they run on are governed, in the last instance, by American law, and use them anyway, because
          there is no European substitute at the scale they need. Industry analysts now write about
          hyperscaler &ldquo;permanence&rdquo; in Europe as a settled fact rather than an open question
          &mdash; the dependence hardened from a procurement choice into the assumed shape of the world.
        </P>

        <P>
          There are, to be fair, signs of a European cloud worth rooting for. <Sq>OVHcloud</Sq> has begun
          winning real public-sector and regulated-industry business on the explicit promise of immunity
          from foreign law; a coalition of European providers calling itself <Sq>Euclidia</Sq> emerged to
          argue, pointedly, that &ldquo;sovereign&rdquo; should mean European-owned and European-controlled,
          not merely American technology in a local building. These are the right arguments, made by the
          right people. But they are made from a market position of around fifteen per cent and slipping,
          against rivals who spend more on data centres in a quarter than the European challengers are worth.
          The will is finally there in places. The scale is not &mdash; and in cloud, as in chips, scale is
          the whole game.
        </P>

        <P>
          The most decisive counter-move so far came from Paris. In 2026 France&rsquo;s interministerial
          digital directorate, <Sq>DINUM</Sq>, issued a directive pushing every ministry and affiliated
          public body toward sovereign and open-source tools rather than the American defaults &mdash; an
          order touching the software of roughly two and a half million civil servants, and a direct
          challenge to the assumption that the dependence is permanent. It is the most concrete state-level
          attempt yet to cancel the standing order. Whether it survives the friction of actually migrating
          &mdash; the retraining, the integration, the thousand small reasons it is always easier not to
          &mdash; is the test that matters, and the one the rest of Europe will be watching.
        </P>

        <P>
          The price of lock-in became impossible to ignore the moment a vendor decided to test it. When
          Broadcom acquired VMware, the virtualisation software a great share of European data centres run
          on, it raised prices on some European cloud providers by figures variously reported between{" "}
          <Sq>eight hundred and a thousand per cent</Sq> &mdash; an increase you can only impose on
          customers who have nowhere else to go. The shock did, at least, concentrate minds: France moved its
          national <Sq>Health Data Hub</Sq> off Microsoft Azure to the homegrown provider Scaleway, and the
          German retail group Schwarz poured billions into its own sovereign cloud. The lesson European
          institutions are learning, expensively, is the oldest one in commerce: a supplier you cannot leave
          is not a supplier. It is a landlord.
        </P>

        <P>
          The race is now being run in concrete, and the scoreboard is instructive. On the European side,
          Deutsche Telekom is standing up an industrial-AI cloud in Munich, and the retail group Schwarz is
          pouring some eleven billion euros into <Sq>STACKIT</Sq>, complete with a planned cluster of a
          hundred thousand AI chips &mdash; serious, sovereign, German-owned bets. On the other side, Amazon
          alone committed nearly ten billion euros to a single expanded region around Frankfurt and launched
          a separate &ldquo;<Sq>European Sovereign Cloud</Sq>&rdquo; staffed by Europeans &mdash; a clever
          move that answers the sovereignty objection in marketing while keeping the technology, and the
          ultimate legal control, American. Both sides are building furiously. Only one of them can also,
          when it chooses, set the prices and write the terms for the other.
        </P>

        <P>
          And when Europe did try to write real sovereignty into its rules, it discovered who objects. The
          EU&rsquo;s cloud-security certification scheme, <Sq>EUCS</Sq>, originally proposed to require that
          the most sensitive European data sit only with providers immune from foreign law &mdash; which is
          to say, not the American hyperscalers. After sustained lobbying, those sovereignty requirements
          were quietly <Sq>stripped out</Sq>; and in early 2026 the US Secretary of State reportedly
          instructed American diplomats to press European governments to drop &ldquo;data sovereignty&rdquo;
          and data-localisation demands altogether. The dependence, in other words, is not passively accepted
          by Washington as a happy accident of market share. It is actively defended &mdash; because the
          tribute documented in this essay is, from the other side of the Atlantic, simply revenue worth
          protecting. Europe is not only failing to build the alternative. It is being lobbied, firmly, out
          of even requiring one.
        </P>

        <P>
          The market&rsquo;s response to all this has been a sudden proliferation of clouds wearing the word
          &ldquo;sovereign&rdquo; like a label of origin. Deutsche Telekom is building an industrial-AI cloud
          in Munich packed with Nvidia chips; Oracle and IBM have rushed out their own EU
          &ldquo;sovereign&rdquo; offerings; even AWS and Microsoft now sell European-staffed sovereign
          regions &mdash; the same firms that, in mid-2026, faced preliminary findings that their cloud
          businesses should be designated gatekeepers under the Digital Markets Act. The word has become a
          marketing category precisely because the underlying anxiety is real and unmet. But a label is not
          a guarantee, and most of these &ldquo;sovereign&rdquo; clouds still run on American silicon,
          American reference designs, or American corporate parents. Europe has discovered that it can buy
          the adjective off the shelf. The noun &mdash; actual, unconditional control &mdash; is the one
          thing that is not for sale.
        </P>

        <P>
          And the diagnosis sharpens to a single startling point. When economists decompose the widening gap
          in returns between European and American business, almost the entire difference &mdash; by one
          analysis <Sq>around 90%</Sq> &mdash; turns out to come from one place: the technology sector. Europe
          is not broadly less productive than America across the board; in many traditional industries it
          holds its own. It is being out-run almost entirely in the digital, software and AI economy that now
          drives growth everywhere &mdash; the gap showing up as labour-productivity growth of well under one
          per cent a year in the euro area against several times that in the United States over the same span.
          The continent did not fall behind at <em>everything</em>. It fell behind at the <em>one thing</em>
          that compounds into everything else, and then mistook a tech problem for a general malaise it could
          manage rather than a specific failure it had to fix.
        </P>

        <P>
          And the fragility of the arrangement was demonstrated, accidentally and globally, on a single
          morning in July 2024, when a faulty update from the American security firm <Sq>CrowdStrike</Sq>
          crashed some <Sq>eight and a half million Windows computers</Sq> at once. Across Europe, hospitals
          turned away non-emergency patients, airports ground to a halt, banks and broadcasters went dark
          &mdash; not because of an attack, but because of a botched software patch pushed from abroad to
          machines the continent does not control. The episode put a number on the dependence: something on
          the order of <Sq>ten billion dollars</Sq> in global losses from one bad file. A continent whose
          hospitals, airports and banks can be felled by an American vendor&rsquo;s routine Tuesday update
          has outsourced not just its convenience but its resilience &mdash; and resilience, unlike
          convenience, is the thing you only discover you have surrendered on the morning it fails.
        </P>

        <P>
          Which forces the question the rest of this essay exists to answer. If the savings are here, and
          the science is here, and the machine is here, and even the <em>plan</em> is here, correct and
          costed and signed by the establishment&rsquo;s own oracle &mdash; then where, precisely, does
          the money go instead? Not metaphorically. Mechanically. The next chapter opens the engine that
          carries Europe&rsquo;s wealth out of Europe, four strokes to a turn, and shows you the part no
          report quite says out loud: that the outflow is not a leak the continent is failing to plug. It
          is a standing order it has chosen, for ten years running, not to cancel.
        </P>
      </Prose>

      <Sources
        items={[
          "Mario Draghi, “The future of European competitiveness” (European Commission, Sept 2024): additional investment need ~€750–800bn/yr (4.4–4.7% of EU GDP), of which ~80% private; ~€450bn decarbonisation + €150bn digital + €100–150bn innovation + €50bn defence; 383 recommendations.",
          "Draghi implementation tracking (Centre for European Reform / Commission, to Jan 2026): ~15.1% of recommendations fully binding (up from 11.2%, Sept 2025); energy, defence, pharma, auto at ~zero structural progress.",
          "Enrico Letta, “Much more than a market” (EU Council, Apr 2024): €33tn EU private savings; ~€300bn/yr leaves the EU (largely to the US); 34.1% of EU household savings held in bank deposits (vs ~12% US).",
          "EU venture-capital gap (ITIF 2025; Atomico, State of European Tech 2025; Crunchbase): US VC ~4–5× the EU; EU ~9% of global late-stage funding vs US ~68%; EU 48 unicorns vs US 206.",
          "AI / data-centre capex (Euronews, Feb 2026; ECB, Mar 2026): US big-tech ~$700bn in 2026 vs EU sovereign cloud/AI ~€10.6bn — a ~55–60× gap.",
          "Capital Markets Union / Savings & Investments Union: EU policy since 2015; relaunched as the SIU; E6 acceleration call (May 2026) + Market Integration & Supervision Package targeting summer 2026 (Euronews, May 2026).",
          "European cloud market: US hyperscalers ~70–85% share; European providers ~15%, stable since 2022 (Synergy Research, 2025–26).",
        ]}
      />
    </section>
  )
}
