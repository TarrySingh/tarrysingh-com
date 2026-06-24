import type { ReactNode } from "react"

import { KillSwitchTimeline } from "./KillSwitchTimeline"
import { TwentyPercentMirage } from "./TwentyPercentMirage"
import { FragmentedSubsidy } from "./FragmentedSubsidy"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * CHAPTER 4 — The Chokepoint We Spent: Semiconductors.
 * The one irreplaceable asset Europe owns — ASML/EUV — and how it spent that
 * chokepoint: a kill-switch it cannot cut, a 20% target it will miss, a flagship
 * fab it cancelled, a subsidy it fragmented. Figures verified to July 2026
 * (ASML filings; US BIS; EU Chips Act; ECA SR 12/2025; SEMI). V13/V14/V15.
 */
export function ChokepointChapterFour() {
  return (
    <section id="chapter-4">
      <ChapterMark kicker="Chapter Four · The Crown Jewel" title="The Chokepoint We Spent" />

      <Prose>
        <Lead>
          Everything so far has been about what Europe gives away. This chapter is about the one thing it
          truly owns &mdash; the single most strategic asset in the modern economy &mdash; and how it has
          managed to spend even that. The asset is the chokepoint we opened this essay with: ASML&rsquo;s
          extreme-ultraviolet lithography machine, the sole tool on Earth that can print the most advanced
          chips, built in Veldhoven and nowhere else. By every law of strategy a monopoly that absolute
          should be the most valuable bargaining chip a continent has held since the war. Watch, instead,
          how Europe has turned the crown jewel into a wealth pump for everyone but itself.
        </Lead>

        <P>
          Begin with the leash, because it has only tightened. The Prologue showed you the machine and the
          American hand on its triggers; here is that hand closing, click by click, over seven years. In{" "}
          <Sq>2019</Sq> the United States led the move that blocked EUV exports to China. In <Sq>2023</Sq>
          it reached down the product stack to restrict advanced DUV tools. In January <Sq>2025</Sq> the
          Netherlands wrote its own tiered controls; in December it joined the US-led{" "}
          <Sq>&ldquo;Pax Silica&rdquo;</Sq> export-control bloc, which the EU itself signed up to in June
          2026. That same month the Dutch extended the controls to cover servicing and spare parts &mdash;
          the umbilical that keeps installed machines alive &mdash; and in Washington a proposed{" "}
          <Sq>MATCH Act</Sq> would ban all DUV exports and servicing to China outright. You can read the
          cost in one line of ASML&rsquo;s accounts: China fell from about <Sq>49% of sales in 2024</Sq>
          to <Sq>36% by the end of 2025</Sq> to roughly <Sq>20% in 2026</Sq>. Scrub the timeline and watch
          the dial turn &mdash; it has only ever turned one way.
        </P>
      </Prose>

      <Figure max={1160}>
        <KillSwitchTimeline />
      </Figure>

      <Prose>
        <P>
          Note what this is and is not. It is not that Europe lacks leverage; it is that the leverage
          belongs, jurisdictionally, to someone else. ASML is a Dutch company, Euronext-listed, and the
          most valuable technology firm Europe has &mdash; its market capitalisation crossed{" "}
          <Won>$740 billion</Won> in mid-2026, up by a third in a single half-year on the back of the AI
          build-out. And yet a foreign government decides which of its customers it may serve, on penalty
          of losing access to the American technology embedded in the machine. Europe holds the asset and
          rents the authority over it. That is the chokepoint paradox in its purest form: the more
          indispensable the jewel, the more completely it is controlled from abroad.
        </P>

        <P>
          You might expect a continent sitting on this asset to have built a fortress around the rest of
          the chip supply chain. It announced one. The EU Chips Act set a clean, quotable target: Europe
          would reach <Won>20% of global semiconductor manufacturing by 2030</Won>, double its share. It
          is not going to happen. Europe&rsquo;s share sits near <Sq>10% today</Sq> and is projected to
          reach perhaps <Sq>11.7% by 2030</Sq> &mdash; and the European Court of Auditors, in a December
          2025 report, called even hitting the target <Sq>&ldquo;very unlikely&rdquo;</Sq>. The €43-billion
          Act did catalyse some &euro;80 billion of investment, but the rivals it was racing simply
          invested more, and faster. The flagship project meant to anchor the whole strategy &mdash;
          Intel&rsquo;s giant fab in Magdeburg, some <Sq>&euro;30 billion</Sq> backed by nearly{" "}
          <Sq>&euro;10 billion of German state aid</Sq> &mdash; was <Sq>cancelled in July 2025</Sq>. The
          site is reverting to a generic business park. Flip the toggle below between the press release and
          the field in Saxony-Anhalt.
        </P>
      </Prose>

      <Figure>
        <TwentyPercentMirage />
      </Figure>

      <Prose>
        <P>
          To be fair to the ambition, there is real building underway &mdash; TSMC&rsquo;s ESMC joint
          venture in Dresden topped out in January 2026 and will make mature 28-nanometre and 16-nanometre
          chips, useful and strategic ones, from late 2027. But notice the shape of even the success: the
          most important new fab on European soil is majority-owned by a Taiwanese company making
          trailing-edge nodes, years from output, on a continent that builds the machine the cutting edge
          depends on. Europe manufactures the tool that prints the future and imports the company that uses
          it.
        </P>

        <P>
          The deeper reason the 20% was always a mirage is the same disease as the capital chapter, in a
          different organ: fragmentation. The Chips Act&rsquo;s roughly <Sq>&euro;86 billion</Sq> is not a
          war chest; it is a scatter of national subsidies &mdash; a German cheque here, a French one there
          &mdash; with only a sliver, the Court of Auditors estimates on the order of <Sq>5%</Sq>, actually
          managed centrally by the Commission. Set that against rivals who move as one: cumulative
          semiconductor capital spending by the US, Taiwan, Korea, China and Japan ran to something like{" "}
          <Lev>$580 billion</Lev> across 2020&ndash;2023, behind coordinated public programmes &mdash; the
          US CHIPS Act&rsquo;s <Lev>$52.7 billion</Lev> in federal money, China&rsquo;s $40-billion-plus
          state funds. Twenty-seven national chip strategies do not add up to one industrial policy, and
          the gap shows.
        </P>
      </Prose>

      <Figure>
        <FragmentedSubsidy />
      </Figure>

      <Prose>
        <P>
          And the part of the chip stack where Europe was genuinely world-class &mdash; design &mdash; has
          quietly left the building too. <Sq>Arm</Sq>, the British architecture at the heart of nearly
          every phone on Earth, is owned by Japan&rsquo;s SoftBank and listed on Nasdaq. <Sq>Graphcore</Sq>,
          Britain&rsquo;s most promising AI-chip challenger, was absorbed by SoftBank in 2024. The pattern
          is by now familiar enough to be monotonous: Europe holds the irreplaceable physical tool, loses
          the authority over it to Washington, loses the leading-edge factories to Asia, loses the design
          IP to SoftBank and Nasdaq, and keeps &mdash; what, exactly? The wages of the engineers in
          Veldhoven, until the next acquisition. The compounding goes elsewhere.
        </P>

        <PullQuote>
          A monopoly this absolute should have been a fortress. Europe turned it into a tollbooth it does
          not own the road to &mdash; collecting the wages while someone else keeps the toll.
        </PullQuote>

        <P>
          This is what makes the semiconductor chapter the hinge of the whole argument. Everywhere else,
          you can at least tell a story about Europe being out-competed &mdash; out-funded, out-built,
          out-paid. Here it is not out-competed at all. It won. It holds the single un-substitutable node
          in the most important supply chain on the planet, and it has still contrived to capture a
          minority of the value, surrender the strategic control, miss its own target by half, and watch
          its flagship factory turn back into a field. If a continent can lose <em>with</em> the crown
          jewel, the problem was never the cards. It was the player.
        </P>

        <P>
          Look closely at what Europe is actually building with its chip money and the ambition shrinks
          further. The one major new fab to break ground is <Sq>ESMC in Dresden</Sq> &mdash; a
          ten-billion-euro joint venture led by Taiwan&rsquo;s TSMC with Bosch, Infineon and NXP &mdash;
          and it is slated to produce <Sq>28- and 22-nanometre</Sq> chips when it opens around 2027:
          competent, useful, and roughly a decade behind the leading edge ASML&rsquo;s own machines make
          possible elsewhere. Europe builds the tool that prints the most advanced chips on Earth, then
          builds itself a factory for the chips of 2015.
        </P>

        <P>
          And the money behind the ambition is a study in fragmentation. The Chips Act&rsquo;s headline is{" "}
          <Sq>&euro;86 billion</Sq>, but the European Commission directly controls only about{" "}
          <Sq>&euro;4.5 billion of it</Sq> &mdash; barely five per cent &mdash; with the rest scattered
          across member states under no obligation even to report progress on what they fund. A continental
          strategy run as twenty-seven national cheque-books is how you arrive at a 20%-of-the-world target
          that the Commission&rsquo;s own forecasts now expect to reach about <Sq>11.7%</Sq> by 2030.
        </P>

        <P>
          The cruelest irony of the crown jewel is that its very importance is what made it a hostage.
          Because ASML&rsquo;s machines are indispensable, controlling who may buy them became the single
          most powerful lever in the technology cold war &mdash; and that lever is pulled in Washington, not
          The Hague. The proof is written on ASML&rsquo;s own income statement: China, for years its largest
          market at close to <Sq>half of all sales</Sq>, was throttled by export controls to around{" "}
          <Sq>a fifth</Sq> in barely two years &mdash; an entire market amputated, not by competition or a
          better product, but by a foreign-policy decision the company could neither shape nor veto. Europe
          owns the most valuable chokepoint in the world economy and discovered, the moment it mattered,
          that owning the chokepoint and controlling it are two different things.
        </P>

        <P>
          Step back and the strategic picture is starker still: for all the Chips Act money and ambition,
          there is, as of 2026, <Sq>no leading-edge logic fab in Europe at all</Sq> &mdash; nothing making
          chips at the three-nanometre class that ASML&rsquo;s own machines enable in Taiwan, Korea and
          Arizona. Europe builds the irreplaceable tool and then buys back the finished chips it cannot make
          at home, at prices set by the firms that bought the tool. It is the four-stroke engine in silicon:
          invent the critical capability, sell it wholesale, and re-import the value-added at retail. The
          most advanced manufacturing <em>technology</em> on Earth is European; the most advanced
          manufacturing is somewhere else.
        </P>

        <P>
          The leverage runs in more than one direction, and 2026 made that vivid. ASML began shipping its
          next-generation <Sq>High-NA EUV</Sq> machines &mdash; at around <Sq>$350 million each</Sq>, the
          most expensive commercial tools ever built &mdash; deepening the dependence of every advanced
          chipmaker on one Dutch firm. But China answered the export controls with leverage of its own,
          throttling exports of <Sq>gallium and germanium</Sq>, raw materials the chip and defence
          industries cannot do without, until European prices spiked several-fold. The semiconductor war is
          a war of chokepoints, and Europe sits astride the single most important one &mdash; which is
          precisely why it has so little freedom to act. To hold the decisive node is also to become the
          decisive target.
        </P>

        <P>
          There is, in fairness, one corner of semiconductors where Europe is genuinely strong, and it is
          worth naming because it shows what holding on actually looks like. In <Sq>power electronics</Sq>
          &mdash; the unglamorous chips that manage electricity in cars, trains, motors and grids &mdash;
          Germany&rsquo;s <Sq>Infineon</Sq> and the Franco-Italian <Sq>STMicroelectronics</Sq> are world
          leaders, and Infineon is building a five-billion-euro fab in Dresden to press the advantage. This
          is the model that works: a real product, real customers, patient capital, kept at home. But notice
          where it sits &mdash; in the mature, industrial, slower-moving end of the business, not the
          bleeding-edge logic that runs AI &mdash; and notice that even here the share is slipping as Chinese
          rivals scale. Europe can hold a chokepoint when it builds in its own industrial heartland. The
          puzzle of the whole essay is how rarely it tries.
        </P>

        <P>
          The demand for the Dutch machines, meanwhile, has never been more naked. In 2026 the Korean
          memory-maker <Sq>SK hynix</Sq> placed what was reported as the largest EUV order in history
          &mdash; on the order of <Sq>eight billion dollars</Sq> for some thirty machines &mdash; a single
          foreign customer committing more to ASML&rsquo;s tools than the European Commission directly
          controls in its entire chip strategy. Brussels, for its part, answered the Chips Act&rsquo;s
          shortfall by drafting a <Sq>&ldquo;Chips Act 2.0&rdquo;</Sq> with another twenty-billion-euro
          ambition. The contrast is the chapter in miniature: the world bids billions for the European tool,
          and Europe answers its own strategic shortfall with another plan, another target, another round
          number, run through the same fragmented machinery that produced the shortfall in the first place.
        </P>

        <P>
          You do not have to take a critic&rsquo;s word for any of this; take ASML&rsquo;s. Peter Wennink,
          who ran the company until 2024, called the EU&rsquo;s flagship goal of <Sq>20% of global chip
          production by 2030</Sq> &ldquo;<Sq>totally unrealistic</Sq>,&rdquo; noting that Europe holds maybe
          eight per cent at best and that hitting the target would mean roughly quadrupling output while
          everyone else expanded too. When the chief executive of the single most important company in the
          entire supply chain publicly calls his own continent&rsquo;s strategy unattainable, the polite
          fiction that the plans merely need a little more time collapses. The people closest to the machine
          know exactly how far behind Europe is. It is the political class, drafting its targets in round
          numbers, that keeps insisting otherwise.
        </P>

        <P>
          And the pain is not confined to the cancelled mega-fabs; it is hitting the firms that stayed.{" "}
          <Sq>STMicroelectronics</Sq>, the Franco-Italian chipmaker, announced some five thousand job cuts
          over three years as it restructured against Asian competition; when Intel walked away from
          Magdeburg, it took with it not just three thousand promised jobs but an estimated{" "}
          <Sq>eighteen thousand</Sq> more in the supplier base that had begun to assemble around it. A
          semiconductor ecosystem is a delicate, decades-long thing to grow and a quick thing to lose, and
          Europe keeps discovering that announcing one is far easier than sustaining it. The strategy keeps
          mistaking the press release for the factory &mdash; and the factory, unlike the press release,
          demands patient capital, cheap power and political constancy that the continent has struggled to
          supply all at once.
        </P>

        <P>
          And in 2025 the chip dependence cut from the other direction, on European soil. <Sq>Nexperia</Sq>,
          a Dutch chipmaker spun out of Philips and now <em>Chinese-owned</em>, became the centre of a control
          fight: when export restrictions tangled its operations, the disruption rippled straight into
          European car factories that rely on its humble but essential components, briefly threatening to halt
          production lines across the continent. It was a small, sharp lesson in how many directions the
          vulnerability runs &mdash; a Dutch-made, Chinese-owned, export-controlled chip with the power to idle
          German assembly plants &mdash; and a reminder that Europe&rsquo;s semiconductor exposure is not only
          the glamorous matter of the leading edge but the unglamorous one of the ten-cent parts no car can be
          built without, and which it long ago stopped reliably making for itself.
        </P>

        <P>
          Which is the right moment to be fair to the other side of the ledger. Critics of an argument like
          this one always have a ready reply: but look at the bright spots &mdash; ASML, Arm, Mistral, Novo
          Nordisk, the defence-tech upstarts. Europe is not a museum; it makes world-beaters. That is true,
          and the next chapter takes the steelman seriously, jewel by jewel. It just turns out that every
          one of them, examined closely, has a foreign outlet, a foreign owner, or a foreign off-switch
          &mdash; that the bright spots are not counter-evidence to the thesis but its most polished proof.
        </P>
      </Prose>

      <Sources
        items={[
          "ASML: market capitalisation ~$743bn (companiesmarketcap.com, 22 Jun 2026); China share of sales ~49% (2024) → ~36% (Q4 2025) → ~20% (2026 guidance) (ASML filings).",
          "US export controls on lithography: EUV-to-China ban (2019); advanced DUV restrictions (2023); Netherlands tiered controls (Jan 2025) extended to servicing/spare-parts (Jun 2026); “Pax Silica” bloc (Dec 2025, EU joined Jun 2026); proposed US MATCH Act (Apr 2026). US BIS / Export Administration Regulations.",
          "EU Chips Act (€43bn): EU share of global semiconductor manufacturing ~10% (2022) → ~11.7% projected for 2030 vs the 20% target — “very unlikely” per European Court of Auditors, Special Report 12/2025; Chips Act 2.0 launched Jun 2026.",
          "Intel Magdeburg fab: ~€30bn investment + ~€9.9–10bn German state aid; cancelled 24 Jul 2025 (Intel); site reverting to a business park.",
          "ESMC (TSMC + Bosch/Infineon/NXP), Dresden: topping-out Jan 2026; 28/22nm + 16/12nm; ~40k wafers/month; production target late 2027; ~€10bn+ (€5bn state aid). TrendForce, Nov 2025.",
          "Chips Act fragmentation: ~€86bn mostly national subsidies; ~5% centrally EU-managed (ECA SR 12/2025). Rival semiconductor capex ~$580bn (2020–23); US CHIPS Act $52.7bn federal; China $40bn+ state funds (SEMI 2025).",
          "Design IP: Arm — SoftBank-owned, Nasdaq-listed; Graphcore — acquired by SoftBank, 2024.",
        ]}
      />
    </section>
  )
}
