import type { ReactNode } from "react"

import { ReArmamentLeak } from "./ReArmamentLeak"
import { SoftKillSwitch } from "./SoftKillSwitch"
import { DependencySpine } from "./DependencySpine"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * CHAPTER 8 — Paying for Dependence, Calling It Autonomy: Defence.
 * The largest re-armament since the Cold War is also the largest transatlantic
 * wealth transfer of the decade — with the first signs of resistance. Figures
 * verified to July 2026 (SIPRI; NATO; Draghi; Pentagon JPO). V27/V28/V29.
 */
export function ChokepointChapterEight() {
  return (
    <section id="chapter-8">
      <ChapterMark kicker="Chapter Eight · The Re-Armament" title="Paying for Dependence, Calling It Autonomy" />

      <Prose>
        <Lead>
          For the first time in a generation, Europe is spending on defence like it means it. Spooked by
          Russia and by an American administration that has made the old guarantees feel conditional, NATO
          allies pledged at the 2025 Hague summit to reach <Sq>5% of GDP</Sq> on defence by 2035, and the
          EU wrapped a roughly <Won>&euro;800-billion</Won> &ldquo;ReArm Europe / Readiness 2030&rdquo;
          ambition around the surge. After thirty years of under-spending, this is the right instinct,
          arguably the most decisive collective move the continent has made in the whole essay. And it is,
          by the machine&rsquo;s now-familiar logic, about to become the largest transatlantic wealth
          transfer of the decade. Europe is re-arming. It is mostly buying American.
        </Lead>

        <P>
          The numbers are not subtle. The United States supplied <Sq>64% of European NATO members&rsquo;
          arms imports</Sq> over 2020&ndash;2024 &mdash; up sharply from 52% in the prior five years. At
          the height of the post-invasion scramble, the Draghi report found that European governments
          spent some &euro;75 billion on defence equipment with about <Sq>78% going to non-EU
          suppliers</Sq> and roughly <Sq>63% of that to the United States</Sq>. So the historic surge of
          European money, the one meant to buy European autonomy, drains across the Atlantic almost as
          fast as it is appropriated &mdash; into American jets, American missiles, American systems. The
          EU knows it, and has set targets to claw the share back (no more than 45% bought outside the EU
          by 2030, 40% jointly procured by 2027). Whether the targets survive contact with the urgency is
          the open question. Trace the leak below, and pull the &ldquo;buy European&rdquo; lever.
        </P>
      </Prose>

      <Figure max={1160}>
        <ReArmamentLeak />
      </Figure>

      <Prose>
        <P>
          The flagship purchase is also the sharpest illustration of why the dependence matters beyond the
          money. European NATO states have ordered something like <Sq>630 to 670 F-35 fighters</Sq> &mdash;
          the finest combat aircraft in the Western inventory, and also one whose continued operation runs
          through American hands. There is, the Pentagon insisted in March 2025, no literal{" "}
          <Sq>&ldquo;kill switch&rdquo;</Sq> &mdash; no secret line of code that bricks the jet. But there
          does not need to be. The spare parts, the mission-data files, the ODIN software-update pipeline,
          the maintenance &mdash; all of it flows from the United States, and any of it can be slowed. As
          defence analysts put it through the 2025 controversy, logistical control is operationally
          equivalent to a switch; you do not need to disable the aircraft if you can simply decline to keep
          it flying. Two NATO partners, Portugal and Canada, publicly reconsidered their F-35 commitments
          on exactly this fear. Turn the dependency dial below and watch the fleet go dark.
        </P>
      </Prose>

      <Figure>
        <SoftKillSwitch />
      </Figure>

      <Prose>
        <P>
          Run a finger down the spine of the European defence stack and the same vertebra keeps coming up
          American. The aircraft are largely US. The munitions, at the surge, were largely US. And the
          software brain &mdash; the AI-enabled battle-management layer that increasingly runs modern war
          &mdash; arrived in the form of Palantir&rsquo;s <Sq>Maven Smart System</Sq>, adopted by NATO in
          March 2025 and rolled out across its commands. A continent that worried about depending on
          American chips and American clouds is now wiring its command-and-control through an American
          defence-software company. Autonomy, bought on a foreign platform, is not autonomy. It is a
          subscription.
        </P>

        <P>
          And yet &mdash; for the second time in two chapters, and it is worth marking &mdash; this is the
          place where Europe has actually started to push back. Germany <Won>rejected Palantir</Won> in
          April 2026 over precisely these sovereignty concerns; France, the Netherlands and Denmark are
          building and testing European alternatives. The defence chapter, alone among the chapters of
          loss, contains a genuine countercurrent: a continent that, confronted with dependence at its most
          existential &mdash; the ability to defend itself &mdash; has finally found the nerve to flinch.
          Click down the spine below; the gold marks where the resistance has begun.
        </P>
      </Prose>

      <Figure max={1160}>
        <DependencySpine />
      </Figure>

      <Prose>
        <PullQuote>
          You cannot buy strategic autonomy from a single foreign supplier who keeps the spare parts, the
          software keys, and the right to say no. That is not sovereignty. It is a very expensive lease on
          someone else&rsquo;s permission.
        </PullQuote>

        <P>
          The lesson of the defence chapter is double-edged, and both edges matter. The first edge is the
          familiar one: even when Europe finally spends &mdash; decisively, urgently, at historic scale
          &mdash; the machine routes the money and the control westward, and re-armament becomes one more
          tribute. The second edge is the hopeful one, and the whole essay turns on whether it can be
          generalised: that <em>fear</em> finally did what a decade of competitiveness reports could not.
          The threat of being switched off concentrated minds that the threat of being out-competed never
          did. Germany did not reject Palantir because of a Draghi recommendation; it rejected it because
          it suddenly, viscerally understood what a foreign off-switch on its own military meant.
        </P>

        <P>
          The defence surge is, at least, beginning to grow a European industry to spend into. The
          EU&rsquo;s <Sq>SAFE</Sq> instrument &mdash; a hundred-and-fifty-billion-euro loan pot agreed in
          2025 &mdash; carries a rule with real teeth: at least <Sq>65% of a funded weapon&rsquo;s
          value</Sq> must come from European or allied suppliers, an explicit attempt to keep the
          re-armament money on the continent. <Sq>Rheinmetall</Sq>, the German munitions maker, expects to
          roughly quintuple sales toward fifty billion euros by 2030; <Sq>Helsing</Sq>, a Munich
          defence-AI company backed by Spotify&rsquo;s Daniel Ek, is raising at around eighteen billion.
          These are real green shoots in the one field where fear has concentrated minds. But the
          counter-example is just as instructive: the Franco-German <Sq>FCAS</Sq> next-generation fighter,
          nine years and billions of euros in, produced no flying prototype and effectively stalled in
          2026 &mdash; the old European disease of a flagship programme dissolving into national
          in-fighting, even as the urgency screams.
        </P>

        <P>
          The scale of the aircraft dependence alone is worth spelling out, because it is a continent-wide
          commitment, not a one-off. The United Kingdom plans some <Sq>138 F-35s</Sq>; Finland{" "}
          <Sq>64</Sq>; Italy ninety-odd; the Netherlands, Norway, Belgium, Denmark, Poland and the Czech
          Republic filling in behind &mdash; on the order of <Sq>six hundred</Sq> of the jets across
          European NATO, each one flying on American spare parts, American software updates and American
          mission data. Poland took its first airframes in 2026; deliveries run well into the 2030s. This
          is not a procurement a country unwinds in a budget cycle. It is a thirty-year structural
          dependence, signed willingly, by almost every air force on the continent at once.
        </P>

        <P>
          And the spending is real and historic: NATO&rsquo;s European members pushed collective defence
          investment past <Sq>a hundred and thirty billion euros</Sq> in 2025, a record, with the pledge to
          reach 5% of GDP by 2035 still ahead of them. The question the chapter keeps pressing is simply
          <em>where it lands</em>. Some, encouragingly, lands at home &mdash; Rheinmetall&rsquo;s order
          book, Helsing&rsquo;s valuation, the SAFE content rules. But the marquee capabilities &mdash; the
          fifth-generation jet, the battle-management software, the precision munitions in the quantities a
          real war consumes &mdash; still run substantially through American suppliers, which means the
          largest European rearmament since the Cold War is also, in its opening years, one of the largest
          single transfers of European money into American defence revenue on record.
        </P>

        <P>
          And the soft kill-switch stopped being hypothetical in March 2025, in the most literal way
          imaginable. For a few days, amid a diplomatic rupture, the United States <Sq>suspended
          intelligence-sharing with Ukraine</Sq> &mdash; degrading, at a stroke, the targeting and
          early-warning picture Ukrainian forces depended on. The feed was restored within about a week,
          but the demonstration was total: the most important input to a modern military can be switched
          off from Washington, on a political whim, with no notice. Every European capital watching
          understood that the same hand rests on the same kind of switch over its own American-supplied
          systems.
        </P>

        <P>
          The legal architecture makes it concrete. American components inside European weapons fall under{" "}
          <Sq>ITAR</Sq>, the US arms-export regime, which hands Washington a veto over the re-export &mdash;
          and sometimes the very use &mdash; of any system containing US-origin technology, a constraint
          that has repeatedly complicated European deliveries of missiles and aircraft to third countries.
          So even the weapons Europe builds for itself often carry an American licence buried in the bill of
          materials. The continent is spending its historic defence surge to acquire capability and, baked
          invisibly into much of it, a foreign permission slip it cannot revoke.
        </P>

        <P>
          And there is one corner of the defence build-out where the gap is not large but near-total. Modern
          war is becoming software &mdash; drones that target autonomously, battle-management systems that
          fuse a thousand feeds, the AI layer that increasingly decides faster than any human staff can.
          American firms are pouring hundreds of billions into the underlying AI; Europe&rsquo;s defence-AI
          spending, the figure that may matter most by 2035, rounds to a small fraction of that. The
          continent that worried about depending on American chips and clouds is now, by inattention, on
          track to depend on American military <em>intelligence</em> software too &mdash; which is exactly
          why Germany&rsquo;s rejection of Palantir and the rise of Helsing matter far more than their euro
          values suggest. They are the first refusal to outsource the brain of European defence.
        </P>

        <P>
          And here, more than anywhere in the essay, a genuine European industry is being born in real time.
          A wave of defence-technology start-ups has erupted out of Germany in particular: <Sq>Helsing</Sq>
          raising at around eighteen billion dollars, <Sq>Quantum Systems</Sq> and the drone-maker{" "}
          <Sq>Stark</Sq> and the autonomous-vehicle firm <Sq>ARX</Sq> all scaling fast, many of them
          explicitly engineering their supply chains to be free of American components so they qualify under
          the &ldquo;buy European&rdquo; rules. The procurement decisions are starting to follow: Denmark
          chose the Franco-Italian <Sq>SAMP/T</Sq> air-defence system over the American Patriot in 2025, and
          the Franco-German land-systems giant <Sq>KNDS</Sq> lined up a twenty-billion-euro listing. None of
          this undoes the F-35 dependence or the software question. But it is the most convincing evidence in
          the whole essay that, when the fear is sharp enough and the money real enough, Europe can still
          grow champions of its own &mdash; which only sharpens the question of why it does so almost nowhere
          else.
        </P>

        <P>
          The procurement map is starting, in places, to redraw itself. The Franco-German land-systems
          champion <Sq>KNDS</Sq> &mdash; maker of the Leopard tank and the Caesar howitzer &mdash; lined up a
          listing reportedly valuing it around twenty billion euros, and Germany ordered its first
          domestically-built tanks and artillery in a generation. France&rsquo;s <Sq>Rafale</Sq> fighter
          carries an order backlog of more than two hundred aircraft, much of it export, as buyers seek an
          alternative to the American jet and its strings; and even American primes are adapting, building{" "}
          <Sq>ITAR-free</Sq> European production bases specifically so their kit can qualify for &ldquo;buy
          European&rdquo; contracts. The continent is discovering, under the pressure of a real war on its
          border, that an industrial base is not a thing you can summon in a crisis. It is a thing you
          either kept, or did not.
        </P>

        <P>
          The most encouraging movement is in the unglamorous business of actually making things. Stung by
          the discovery that it could not produce artillery shells fast enough to sustain Ukraine,{" "}
          <Sq>Rheinmetall</Sq> is racing toward <Sq>1.5 million 155-millimetre shells a year</Sq> by 2027;
          Norway&rsquo;s Nammo is restarting mothballed lines; two dozen nations have signed up to a European
          air-defence initiative. And Ukraine has become, grimly, Europe&rsquo;s defence-tech proving ground:
          a swarm of new drone makers &mdash; Germany&rsquo;s Quantum Systems and Stark, Croatia&rsquo;s
          Orqa, a dozen others &mdash; are iterating weapons in a live war at a speed no peacetime
          procurement system could match, and scaling toward millions of units a year. This is what an
          industrial base looks like when it is finally allowed, or forced, to grow. The tragedy threaded
          through the whole essay is that it took a war on the continent&rsquo;s edge to permit it.
        </P>

        <P>
          And beneath the spending lies a set of capability gaps so specific they are almost embarrassing.
          For all its wealth, Europe can deploy only a handful of its own heavy strategic-airlift aircraft
          and air-to-air tankers, leaning on a literal <Sq>three shared C-17s</Sq> and a small pooled fleet
          for the basic job of moving an army; its civilian <Sq>Copernicus</Sq> satellites see the ground at
          a resolution too coarse to identify a military vehicle, leaving it dependent on American imagery to
          know what is happening on its own frontier; and no European air force maintains a credible capacity
          to suppress enemy air defences &mdash; the dangerous first task of any modern air campaign &mdash;
          without the United States. These are not luxuries. They are the load-bearing capabilities of an
          autonomous military, and a continent of four hundred and fifty million people, spending hundreds of
          billions, still cannot field them alone. That dependence is not a line in a budget. It is the
          difference between an alliance and a protectorate.
        </P>

        <P>
          Which raises the question the back half of this essay keeps circling: if existential fear is what
          it takes to make Europe act, does the economic version of the same threat &mdash; the slow,
          bloodless capture documented in every other chapter &mdash; register as fear at all? Or does it
          take a fighter jet going dark to make a continent feel what a closed factory and an emigrated
          founder never could? The next chapter looks at the one weapon Europe has reliably reached for
          instead of spending or building &mdash; the rulebook &mdash; and asks whether the drawbridge it
          keeps raising is keeping anyone out, or only sealing itself in.
        </P>
      </Prose>

      <Sources
        items={[
          "NATO 5%-of-GDP defence pledge (Hague summit, 2025): 3.5% core + 1.5% infrastructure/cyber by 2035; European allies +20% vs 2024 (>$574bn in 2025). NATO.",
          "EU defence surge: the ~€800bn “ReArm Europe / Readiness 2030” plan (2025) — note the discrete EU instrument (European Defence Fund) is ~€8bn; the ~€800bn is a mobilisation ambition (SAFE loans + national fiscal space). European Commission.",
          "US share of European arms imports: ~64% of European NATO members' major-arms imports (2020–24), up from 52% (2015–19). SIPRI (Mar 2025).",
          "Procurement leakage (Draghi report, 2024, citing Feb 2022–Jun 2023): ~€75bn EU defence equipment spend, ~78% to non-EU suppliers, ~63% of that to the US; EU targets ≤45% extra-EU by 2030, 40% joint procurement by 2027.",
          "F-35: ~630–668 ordered by European NATO members (~180–200 delivered, 2026). No literal “kill switch” (Pentagon JPO, Mar 2025), but US logistical/software control (spares, ODIN/ALIS, maintenance) is the functional equivalent; Portugal & Canada reconsidered F-35 buys. SIPRI/Lockheed; Breaking Defense.",
          "Software: Palantir Maven Smart System adopted by NATO (Mar 2025); Germany rejected Palantir (Apr 2026); France/Netherlands/Denmark developing European alternatives. SHAPE/NATO; German MoD.",
        ]}
      />
    </section>
  )
}
