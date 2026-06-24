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

        <P>
          The cost of the rulebook is most visible in the products Europeans simply do not get, or get
          late. <Sq>Apple Intelligence</Sq> was withheld from the EU at its 2024 launch over Digital
          Markets Act uncertainty; <Sq>Meta</Sq> delayed its AI assistant in the bloc for the same reason;{" "}
          <Sq>Google</Sq> geofenced its Gemini model out of several EU countries after a French-regulator
          challenge; and when the Chinese lab <Sq>DeepSeek</Sq> arrived, European data authorities moved to
          block it from training on EU data. Set aside whether each call was right &mdash; the cumulative
          signal to any company deciding where to launch is unmistakable: Europe is the market where the
          newest things show up last, wrapped in the most legal doubt. A continent that cannot reliably
          even <em>receive</em> the frontier, let alone build it, has quietly priced itself out of being a
          serious customer for the future.
        </P>

        <P>
          The machinery behind all this is genuinely vast. Under the Digital Markets Act the Commission
          formally designated <Sq>six gatekeepers</Sq> &mdash; Apple, Alphabet, Amazon, Meta, Microsoft and
          ByteDance &mdash; controlling some <Sq>two dozen &ldquo;core platform services&rdquo;</Sq>, each
          triggering its own compliance regime, audits and interoperability duties. It is, in the abstract,
          a serious and in places admirable attempt to discipline genuine market power. But step back and
          the shape is unmistakable: five of the six firms being regulated are American, one is Chinese,
          and <em>none</em> is European &mdash; because Europe has no platform large enough to need
          disciplining. The continent has built the world&rsquo;s most sophisticated apparatus for
          governing digital giants and has not produced a single one of its own to govern.
        </P>

        <P>
          The privacy regime has its own landmark, and it cuts the same way. In 2023 the Irish regulator
          fined <Sq>Meta &euro;1.2 billion</Sq> &mdash; the largest GDPR penalty ever &mdash; for shipping
          European users&rsquo; data to American servers, the climax of a decade-long saga driven by a
          single Austrian activist, Max Schrems, who twice toppled the legal frameworks governing
          EU&ndash;US data flows. It was, again, real enforcement of a real principle. And again the deeper
          picture is the trap: the data was crossing to American servers in the first place because the
          services Europeans use are American, hosted on American clouds &mdash; and the most a European
          regulator can ultimately do is fine the foreign company for the terms of a dependence it has no
          power to end. You cannot regulate your way out of not owning the infrastructure.
        </P>

        <P>
          And there is a final twist that complicates the whole picture, because the retreat from the
          rulebook is being authored partly by the very giants it was meant to constrain. The{" "}
          <Sq>Digital Omnibus</Sq> simplification of 2026 &mdash; the package that stopped the AI
          Act&rsquo;s clock and trimmed reporting duties &mdash; arrived after sustained lobbying from
          American big tech and its allies, who found Brussels suddenly receptive to the argument that its
          own rules were throttling competitiveness. So Europe spent a decade building the most ambitious
          digital rulebook in the world, then began dismantling parts of it under pressure from the firms it
          was written to discipline. Whether that is wise course-correction or regulatory capture depends on
          where you stand &mdash; but either way it is not the posture of a power that sets the terms. It is
          the posture of one that keeps revising them under pressure from somebody else.
        </P>

        <P>
          The enforcement, when it comes, lands on American and Chinese platforms because those are the only
          ones big enough to enforce against. In late 2025 the Commission fined <Sq>X</Sq> some
          &euro;120 million under the Digital Services Act over its &ldquo;blue check&rdquo; design and
          ad-transparency failures; in early 2026 it moved against <Sq>TikTok</Sq> for addictive design, the
          first action of its kind. These are, once more, real attempts to govern genuine harms. But notice
          the shape one final time: the regulator is European, the regulated are not, and the very existence
          of a sophisticated enforcement apparatus with no domestic platforms to enforce against is the
          cleanest possible statement of the chokepoint paradox. Europe has made itself the world&rsquo;s
          referee in a game it no longer fields a team in.
        </P>

        <P>
          The newest rules sharpen the irony to a point. The AI Act&rsquo;s toughest tier, its obligations
          for &ldquo;systemic-risk&rdquo; models, is triggered by a training-compute threshold so high that
          essentially <Sq>only American models</Sq> &mdash; GPT-class, Gemini, Claude &mdash; cross it;
          Europe is, in effect, writing the operating manual for machines it does not build. Meanwhile the
          compliance bill lands hardest on the small: cookie-consent and data rules can cost a European
          SME tens of thousands of euros a year, and enforcement keeps escalating &mdash; Google alone was
          fined another <Sq>&euro;325 million</Sq> in 2025 over its ad and cookie practices. The giants pay
          it as a toll and continue; the startup pays it as a tax it can barely afford, on its way to losing
          anyway. The rulebook is, with grim consistency, regressive at every level.
        </P>

        <P>
          Enrico Letta, asked to diagnose the same disease, put his finger on the deeper cost:{" "}
          <Sq>&ldquo;Fragmentation directly weakens Europe&rsquo;s innovative capacity and strategic
          autonomy.&rdquo;</Sq> The regulatory machine and the fragmented market are the same problem seen
          twice &mdash; a continent that produces rules faster than it produces companies, then wonders why
          the rules have no domestic champions to protect. The cure Letta and Draghi both prescribe is not
          less ambition but more <em>coordination</em>: one market, one rulebook, one set of forms. It is
          telling that the two most senior establishment figures Europe could commission to study itself
          both came back with the same answer &mdash; integrate or decline &mdash; and that the answer has,
          so far, mostly been filed under noted.
        </P>

        <P>
          By 2026 the friction had hardened into open refusal and visible deprivation. <Sq>Meta</Sq> simply
          <em>declined to sign</em> the AI Act&rsquo;s code of practice, betting that the cost of fighting
          the rules was lower than the cost of following them; <Sq>Apple</Sq> blocked its flagship AI
          assistant, the upgraded Siri, from the European Union indefinitely rather than reshape it to the
          Digital Markets Act, so that European iPhone owners simply <em>do not get</em> features their
          American counterparts take for granted. Set against that, the cookie banner that greets every
          European on every website &mdash; some two-thirds of major sites show one, and by one study only a
          sixth are actually compliant &mdash; is almost a comic emblem: a continent that experiences the
          internet as a daily obstacle course of consent pop-ups, having successfully regulated the user
          experience while regulating none of the platforms beneath it. The rules are felt everywhere. The
          power they were meant to check sits, untouched, in California.
        </P>

        <P>
          It would be unfair to end the chapter without conceding what the rulebook gets right, because the
          honest case is more damning than a one-sided one. When the EU mandated a single <Sq>USB-C
          charger</Sq> for all phones and laptops, it cut waste and saved consumers real money, and the rest
          of the world quietly followed; its <Sq>right-to-repair</Sq> rules and repairability labels are
          nudging an entire industry toward durability; the GDPR, for all its costs, genuinely raised the
          global floor on privacy. This is the Brussels Effect working as advertised &mdash; Europe setting
          standards the world adopts. The trouble is the asymmetry of what it has chosen to be good at.
          Europe has become the world&rsquo;s indispensable regulator of products and a negligible producer
          of them; it writes the rules of the digital economy with one hand and rents the digital economy
          with the other. Being the referee is an honourable job. It is simply not the same as being a
          player &mdash; and a continent cannot regulate its way back onto the field.
        </P>

        <P>
          For a single human-scale illustration, take <Sq>Bird</Sq> (formerly MessageBird), one of the
          Netherlands&rsquo; few homegrown tech unicorns. When it cut a fifth of its workforce, its chief
          executive did not blame the market or his own strategy first; he pointed at the compliance burden
          of operating across Europe&rsquo;s thicket of rules, and made plain that the next jobs would be
          created somewhere friendlier. Multiply that one founder&rsquo;s calculation across every scaling
          European company weighing where to put its next hundred engineers, and the regulatory reflex stops
          being an abstraction about sovereignty and becomes a steady, quiet export of exactly the
          high-growth employment Europe says it most wants to keep. The rulebook does not only fail to
          produce champions; it actively encourages the ones Europe already has to do their growing
          elsewhere.
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
