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
