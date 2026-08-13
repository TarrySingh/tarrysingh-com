import type { ReactNode } from "react"

import { ChokepointParadox } from "./ChokepointParadox"
import { AmericanLeash } from "./AmericanLeash"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

/** A full-width slot for an instrument inside the essay flow. `.cp-gallery`
 *  cancels the PlateFrame blog-column breakout. */
function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * PROLOGUE: One Node. ~1,800 words. The single machine and its American
 * leash; the paradox stated; the four-stroke loop teased; the question (nerve,
 * not capability); the Netherlands set up as the canary. Every load-bearing
 * figure is in the Source Ledger at the foot, verified to July 2026.
 */
export function ChokepointPrologue() {
  return (
    <section id="prologue">
      <ChapterMark kicker="Prologue · One Node" title="The Machine in Veldhoven" />

      <Prose>
        <Lead>
          There is a building in the southern Netherlands, in a town most Europeans cannot place on a
          map, where the modern world is quietly manufactured. Veldhoven. Twenty minutes from the
          Belgian border, ringed by the kind of low brick and managed grass that announces nothing.
          Inside, in rooms cleaner than an operating theatre and stiller than a vault, a company called
          ASML builds the single most complicated machine the human species has ever made, and
          the only one of its kind on Earth.
        </Lead>

        <P>
          The machine is an extreme-ultraviolet lithography scanner. It is the size of a city bus, costs
          more than a wide-body jet, and there is a waiting list. To make the chips that run everything
          you will touch today (the phone, the car, the data centre answering your search, the
          insulin pump), you must, at the leading edge, print circuitry finer than a virus onto
          silicon. To do that you need light at thirteen-and-a-half nanometres, which no lamp emits, so
          ASML&rsquo;s machine makes it on purpose: it fires a laser at a falling droplet of molten tin
          fifty thousand times a second, twice per droplet, flashing it into a plasma that glows in a
          colour no human eye has seen. That light is then steered by mirrors so flat that, scaled to the
          size of Germany, their tallest imperfection would stand under a millimetre. This is not a
          flourish borrowed for effect. It is the specification.
        </P>

        <P>
          ASML makes <Lev>100% of the EUV scanners on Earth</Lev>. Not the lead. Not the plurality. All
          of them. Around <Lev>94% of every lithography system</Lev> sold at any node traces back to this
          one Dutch firm, and something close to <Lev>85% of advanced chip manufacturing</Lev> depends on
          its tools to exist at all. In 2025 it booked <Won>&euro;32.7 billion</Won> in revenue doing it,
          at a gross margin north of 50%. If you wanted to name the one place where Europe is
          not a follower, not a worthy fast-second, but the irreplaceable, sole, planet-wide monopolist
          of the thing the entire digital economy is built on, it is this town you cannot find on
          a map.
        </P>

        <P>
          Hold that for a moment, because the rest of this essay will be unkind, and you should know it
          begins from genuine wonder. Europe built this. European physicists, European engineers, a
          supply chain stitched across the continent solved a problem the United States looked at, with
          all its money, and decided was too hard. The machine in Veldhoven is one of the high-water
          marks of the civilisation. <em>Look at it.</em> Drag the slider below and watch the leverage
          radiate out from the node: every ray a thing the world cannot do without the Dutch.
        </P>
      </Prose>

      <Figure max={1160}>
        <ChokepointParadox />
      </Figure>

      <Prose>
        <P>Now drag it the other way.</P>

        <P>
          Because here is the part nobody in Brussels likes to say aloud. The most important machine on
          Earth does not, in any sense that matters, belong to the people who built it. The light source
          at its heart (the laser-and-droplet engine that makes the impossible colour)
          comes from a company called Cymer, in San Diego, California, and it is{" "}
          <Sq>100% American</Sq>. The optics come from Zeiss, a single German supplier with no
          redundancy. Pull either one and the machine is a sculpture. And sitting above all of it is a
          quieter dependency that appears on no bill of materials: American law. Because enough of the
          machine&rsquo;s content originates in the United States, Washington asserts the right
          (under what trade lawyers call the <Sq>Foreign Direct Product Rule</Sq>) to decide who
          ASML may sell to, and what it may service, anywhere on the planet.
        </P>

        <P>
          That reach is not theoretical, and in the last eighteen months it has hardened into
          architecture. The Netherlands began licensing ASML&rsquo;s exports to China in January 2025 and
          widened the net in June 2026 to cover the servicing and spare parts that keep installed
          machines alive: controls written in The Hague but unmistakably authored in Washington.
          Around them the United States assembled a multilateral export-control bloc the diplomats took
          to calling <Sq>&ldquo;Pax Silica&rdquo;</Sq>, launched in December 2025 and joined by the
          European Union itself in June 2026. Europe&rsquo;s crown jewel now runs under a coordinated
          foreign licence, and it negotiated its way into the cartel that holds the key.
        </P>

        <P>
          You can watch the cost in a single line on ASML&rsquo;s own income statement. For most of the
          decade China was its largest market: about <Sq>49% of sales</Sq> at the 2024 peak. Then
          the controls tightened, and the number fell off a cliff: 49% in 2024, about 36% by late 2025, then{" "}
          <Sq>19% by the first quarter of 2026</Sq> (an entire market not lost to a competitor or
          a better product, but deleted by a foreign-policy decision Europe did not make and could not
          veto). The record-revenue year and the structural amputation are the same year. They are the
          same chart. Raise the machine&rsquo;s American content past the rule&rsquo;s threshold below,
          and watch the leash from San Diego snap taut.
        </P>
      </Prose>

      <Figure>
        <AmericanLeash />
      </Figure>

      <Prose>
        <P>
          This is the paradox the essay is named for, and it is worth stating precisely because
          everything follows from it: <Won>the strength and the exposure are the same node.</Won> The
          thing that makes Europe indispensable is the thing that makes it controllable. There is no
          version of the ASML story where Europe holds enormous leverage <em>and</em> sits safely outside
          someone else&rsquo;s grip: the leverage <em>is</em> the grip, seen from the other end.
          Europe holds the key. Washington owns the lock. And (this is the part that should keep a
          European minister awake) Europe appears to have decided that this is fine.
        </P>

        <P>
          I have spent thirty years in and around this industry, on both sides of the Atlantic, watching
          European boards reassure themselves with the word <em>world-class</em>. Let me be careful,
          because the lazy version of this argument is a declinist sneer and I have no patience for it.
          Europe is not stupid and it is not poor. It is the richest pool of savings on the face of the
          Earth. It has the engineers, disproportionately so. It writes the papers. It built the machine
          in Veldhoven. The thesis here is not that Europe <em>cannot</em>. It is the far more
          uncomfortable claim that Europe <em>does not</em>: that with every structural advantage a
          continent could ask for, it has arranged its affairs so the value created here is
          systematically captured somewhere else, and that this is not bad luck or American cunning but a
          series of specific, nameable, repeated choices.
        </P>

        <P>
          The pattern is not abstract, and the proof is a roll-call of things you use every day. The
          World Wide Web was written at <Sq>CERN</Sq>, in Geneva, and given to the world for nothing; the
          MP3 was compressed into being at Germany&rsquo;s <Sq>Fraunhofer</Sq> institute; Skype was built
          by Estonian engineers for Scandinavian founders; the most important AI laboratory of the 2010s,{" "}
          <Sq>DeepMind</Sq>, was founded in London. Every one of them became someone else&rsquo;s franchise:
          an American platform, an American acquisition, an American market capitalisation. Europe
          has invented an astonishing share of the modern world and captured the returns on almost none of
          it, and the <em>regularity</em> with which this happens is the tell. Once is misfortune. A
          century of it is a machine.
        </P>

        <P>
          The roll-call is longer than the famous cases, and quieter. <Sq>Python</Sq>, the programming
          language that now runs a vast share of the world&rsquo;s data science and AI, was created by a
          Dutchman, Guido van Rossum, at a research institute in Amsterdam; <Sq>Linux</Sq>, the operating
          system underneath almost every server and cloud on Earth, was begun by a Finn, Linus Torvalds. The
          capacitive touchscreen that makes the smartphone possible was prototyped by a Danish engineer at
          CERN in the early 1970s, decades before Apple scaled it into the iPhone. Europe did not merely
          invent a few products it failed to keep; it invented several of the <em>foundations</em> the
          American technology economy is built on, let them go, and now rents the industry they made
          possible. The divergence that followed is brutal in the aggregate: European output per person has
          slipped from roughly three-quarters of the American level around 2008 toward something nearer half
          today, the compounding result of one economy that scaled its inventions and one that
          exported them.
        </P>

        <P>
          And the drift is not only of listings but of companies bodily. A steady trickle of European
          champions simply <em>moves</em>: the French data-science firm <Sq>Dataiku</Sq>, the search company{" "}
          <Sq>Algolia</Sq>, the treasury-software maker <Sq>Kyriba</Sq>, the telephony startup{" "}
          <Sq>Aircall</Sq> (all founded in France, all relocating their centre of gravity to the
          United States, most citing the same plain reason: it is simply easier to be an ambitious company
          there). The founders stay European, the first risk was European, and the headquarters, the cap
          table and the eventual windfall end up American. When the most ambitious version of a European
          company turns out to be an American one, the continent is not failing to <em>start</em> companies.
          It is failing to keep the ones it starts.
        </P>

        <P>
          Zoom all the way out and the scoreboard is stark. Of the fifty most valuable companies on Earth,
          something like <Sq>forty are American and fewer than ten European</Sq>; there is no European
          Google, no European Amazon, no European Apple, and the continent&rsquo;s most valuable company is a
          maker of the machines that <em>other people</em> use to build the future. Europe spends about{" "}
          <Sq>2.2% of its output on research and development</Sq> against America&rsquo;s 3.45%, and has for
          years: a gap that looks small in any single year and compounds into a chasm over a
          generation. None of this is destiny. It is the cumulative read-out of a thousand smaller choices,
          each individually defensible, which is exactly why the pattern is so hard to see and so hard to
          break: there is no single villain to point at, only a machine, running smoothly, in the wrong
          direction.
        </P>

        <P>
          And lest this seem like a story only about the AI age, recall that Europe has run this exact play
          before, at the top of the last technology wave, and lost. In May 2000 <Sq>Nokia</Sq> was worth
          some three hundred billion euros and Europe owned the mobile phone; Sweden&rsquo;s{" "}
          <Sq>Ericsson</Sq> held perhaps 40% of the world&rsquo;s handset market; the continent
          had written the global GSM standard. Within a decade it was gone. Nokia lost <Sq>98% of its
          value</Sq> and was sold for parts to Microsoft; Ericsson retreated to network gear; Siemens dumped
          its phone division on a Taiwanese firm that promptly went bankrupt. Europe did not lose mobile
          because its engineers were beaten on the hardware. It lost because, when the value migrated from
          the device to the software platform (the app store, the operating system, the ecosystem),
          the Americans built the platform and the Europeans kept polishing the handset. The
          chokepoint paradox is not a new affliction. It is a recurrence, and the AI age is merely its
          largest instance yet.
        </P>

        <P>
          The people running Europe&rsquo;s biggest companies see it clearly, and say so. Pascal Soriot,
          who runs AstraZeneca, one of the few European firms that can stand unembarrassed on a global
          stage, described the continent bluntly as <Sq>&ldquo;losing ground&rdquo;</Sq>: too focused,
          he said, on managing costs and distributing benefits, behaving &ldquo;like one company in
          decline.&rdquo; It is a striking thing for a European chief executive to say out loud, and a
          useful corrective to any suspicion that this essay is an outsider&rsquo;s sneer. The diagnosis
          here is not foreign and it is not new; it is the quiet consensus of the people closest to the
          machine, who have mostly concluded that saying it changes nothing, and gone back to managing the
          decline with the competence for which Europe remains, genuinely, world-class.
        </P>

        <P>
          And the abstraction has a price that lands in ordinary lives. The average American household now
          has a real income something like <Sq>a third higher</Sq> than the average European one, a gap that
          has widened steadily as the productivity lines diverged, which is to say that the chokepoint
          paradox is not only a story about companies and cap tables but about the slow erosion of what a
          European salary can buy relative to an American one. For now it is masked by Europe&rsquo;s genuine
          advantages: the healthcare, the cities, the security, the holidays, the sense that life is for more
          than work. Those are real, and worth defending. But a continent cannot indefinitely fund a superior
          quality of life on the proceeds of an economy it is steadily ceding, and the bill for choosing
          comfort over dynamism, decade after decade, does not disappear. It is merely deferred (and
          handed, with the rest of the ledger, to the next generation).
        </P>

        <P>
          The drift shows up most starkly where the money is finally counted: the stock exchange. Across
          the fifteen years to 2025, London hemorrhaged hundreds of listings toward New York and Nasdaq;
          when Sweden&rsquo;s <Sq>Klarna</Sq> finally went public in 2025 it chose the New York Stock
          Exchange, not Stockholm, and <Sq>Wise</Sq>, the British payments champion, began shifting its own
          primary listing across the Atlantic. The founders are European, the engineering is European, the
          first risk was European; and the equity, the liquidity and the compounding all come to
          rest on an American exchange. Europe builds the company; America banks it. That is the whole
          essay compressed into a single transaction, repeated until it is a structure.
        </P>

        <P>
          Those choices form a machine of their own, and this essay takes it apart stroke by stroke. It
          runs in four. Europe <strong>saves</strong> more than anyone, and routes the savings
          abroad. It <strong>funds</strong> the companies that will compete with it, through other
          people&rsquo;s venture funds, because its own will not. It <strong>trains</strong> the talent,
          and exports it to be paid three to five times as much elsewhere. And then it{" "}
          <strong>buys back</strong>, at retail, wearing an American logo, the very capabilities it
          invented and sold at wholesale. Save, fund, train, buy back: four strokes to a turn, and the
          wheel turns a little wider each cycle, because every rotation hands a rival the capital and the
          people to win the next one. By the time we reach the engine in full you will be able to put a
          hand on the flywheel and feel how smoothly it runs. It is, in its way, as well-engineered as
          the machine in Veldhoven. It is simply pointed the wrong way.
        </P>

        <PullQuote>
          If a continent owns the one irreplaceable machine, banks the deepest savings, and trains the
          best minds (and still ends each decade poorer, relative to its rivals, than it began),
          then the problem is not capability. It is nerve.
        </PullQuote>

        <P>
          Hold that as a question, not yet an accusation. It is not money, and it is not even, mostly,
          regulation, though the regulation is coming. It is the willingness to bank leverage instead of
          spending it, to fund the future at home instead of renting it from abroad, to insulate a
          forty-year strategy from a four-year electoral cycle. None of that requires a miracle. All of it
          requires a decision Europe has, so far, declined to make.
        </P>

        <P>
          We start small, and close to home, because the whole pattern shows up in miniature in one
          country before it shows up across the continent, and it happens to be the country that
          builds the machine. The Netherlands is the canary. It is Europe in high resolution: the same
          wealth, the same brilliance, the same quiet, polite, catastrophic refusal to back itself. If
          you want to know how a rich, clever, well-meaning continent talks itself into tenancy, watch a
          rich, clever, well-meaning country do it first. Veldhoven is where it starts. It is not where it
          has to end.
        </P>
      </Prose>

      <Sources
        items={[
          "ASML Q4 2025 results (asml.com, reported 28 Jan 2026): FY2025 revenue €32.7bn; net income €9.6bn; backlog €38.8bn; 2026 guidance €34–39bn.",
          "ASML Q1 2026 results (SEC Form 6-K, Apr 2026): China = 19% of system sales; trajectory ~49% (2024) → 36% (Q4 2025) → 19% (Q1 2026).",
          "ASML / Cymer bill-of-materials: Cymer (San Diego) sole EUV light-source supplier, 100% US-origin; Carl Zeiss SMT (Germany) sole optics supplier.",
          "US Foreign Direct Product Rule, extraterritorial re-export control over US-origin technology embedded in foreign-made goods.",
          "Netherlands tiered export controls on ASML lithography (in force 15 Jan 2025; amended 1 Apr 2025; expanded to service & spare-parts licensing, Jun 2026).",
          "“Pax Silica”, US-led multilateral export-control alliance (launched Dec 2025; EU joined 4 Jun 2026). US Department of State.",
          "Dutch Competitiveness Strategy, Part A (2026): “100% of EUV, 85% of global chip manufacturing relies on Dutch tech.”",
        ]}
      />
    </section>
  )
}
