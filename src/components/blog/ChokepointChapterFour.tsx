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
    <section>
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
