import type { ReactNode } from "react"

import { TwoLedgers } from "./TwoLedgers"
import { EuroCostTax } from "./EuroCostTax"
import { FrozenGrid } from "./FrozenGrid"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * CHAPTER 7. The Electrons We Priced Out: Energy.
 * One kWh failure in two costumes: the old economy switched off, the new one
 * un-buildable. Figures verified to July 2026 (Eurostat/IEA; Cefic; BASF;
 * TenneT; Draghi). V24/V25/V26 embedded.
 */
export function ChokepointChapterSeven() {
  return (
    <section id="chapter-7">
      <ChapterMark kicker="Chapter Seven · The Electrons" title="The Electrons We Priced Out" />

      <Prose>
        <Lead>
          You can train the engineers, bank the savings, own the machine, and still build nothing,
          if the electricity that everything runs on costs two or three times what your rivals pay. This
          is the most physical chapter in the essay, the one you can read off a meter, and it is in some
          ways the most damning, because energy is not a matter of culture or nerve or cap tables. It is
          arithmetic. A factory either makes money at the local power price or it does not, and across much
          of European heavy industry, increasingly, it does not. The same failure shows up twice:
          as the old economy switching off, and as the new one quietly choosing to build somewhere else.
        </Lead>

        <P>
          Take the old economy first, because the damage is already booked. European industrial
          electricity runs at roughly <Sq>2.5 times the US price</Sq> (about &euro;0.199 per
          kilowatt-hour against &euro;0.075) and around <Sq>2.4 times China&rsquo;s</Sq>. Gas is
          worse: the European wholesale benchmark has traded near <Sq>five times America&rsquo;s</Sq>. For
          an industry like chemicals, where energy <em>is</em> the feedstock, that is not a headwind; it is
          a verdict. Europe has lost something like <Sq>37 million tonnes of chemical capacity</Sq> since
          2022 (close to <Sq>9% of the total</Sq>), with output down 11 to 15% from
          pre-crisis levels and on the order of <Sq>109,000 jobs</Sq> gone or at risk. Nearly half of the
          announced closures cite energy costs as the reason. The new economy&rsquo;s ledger is the mirror
          image: the AI build-out needs vast, cheap power, and a continent whose electricity costs double
          forecloses on the data centres before they are drawn, which is why Europe&rsquo;s AI
          capital spending runs a fraction of America&rsquo;s. Toggle the two ledgers below; they are
          charged to the same account.
        </P>
      </Prose>

      <Figure>
        <TwoLedgers />
      </Figure>

      <Prose>
        <P>
          The single most eloquent fact in the chapter is corporate, not statistical. <Won>BASF</Won>, the
          largest chemical company in the world and for a century the beating heart of German industry,
          inaugurated an <Sq>&euro;8.7-billion</Sq> integrated Verbund site in Zhanjiang, China, in March
          2026, even as it closed plants at its historic home in Ludwigshafen, which has been posting
          billion-euro operating losses. A company does not move its century-old centre of gravity to the
          other side of the planet on a whim. It does so because the arithmetic at home stopped working,
          and the most German company there is voted with €10 billion of capital. When BASF leaves,
          it is not a data point. It is a tolling bell.
        </P>

        <P>
          You can stack the disadvantage up and read it as a single number: the tax a producer pays simply
          for being located in Europe rather than on the US Gulf Coast. Start at an American baseline and
          add the electricity premium, then the gas premium, then the carbon price, then the regulatory
          load, and the cost of European location climbs well above parity, not because European
          firms are inefficient, but because the ground they stand on is dearer. Build the waterfall
          yourself below. It is the clearest answer to the question Europe keeps not asking out loud: why
          would anyone build the next plant here?
        </P>
      </Prose>

      <Figure>
        <EuroCostTax />
      </Figure>

      <Prose>
        <P>
          And then, as if to remove any remaining doubt, there is the grid, because even the company
          that wants to build in Europe, and can afford the power, increasingly cannot get plugged in. In
          the Netherlands, the densest, richest corner of the continent, grid congestion has become an
          absolute brake: something like <Sq>47 gigawatts</Sq> of connection requests sit on waiting lists
          (over fourteen thousand of them) with waits stretching to <Sq>ten years</Sq>. The
          national grid operator has warned, flatly, that the network will <Sq>fail to meet electricity
          demand by 2030</Sq>; the Randstad around Amsterdam and Schiphol is effectively frozen to the
          mid-2030s. A factory, a data centre, a newly-electrified production line, a housing estate:
          all of them now join the same queue, and the queue is measured in years. Add demand below and
          watch it freeze.
        </P>
      </Prose>

      <Figure>
        <FrozenGrid />
      </Figure>

      <Prose>
        <PullQuote>
          Europe priced its electrons out of reach, and then ran out of wires to carry the ones it has
          left. You cannot reindustrialise a continent that can neither afford the power nor connect the
          plug.
        </PullQuote>

        <P>
          It is worth being precise about what is and is not Europe&rsquo;s fault here. The 2022 gas shock
          was Russia&rsquo;s doing, not Brussels&rsquo;. But three years on, the persistence of the gap is
          a policy outcome, not an act of God: it reflects choices about nuclear, about LNG infrastructure,
          about grid investment, about whether to shield industry from the full force of carbon and energy
          pricing or let the market clear by closing the factories. America had its own gas; it also chose,
          through the Inflation Reduction Act, to pour money at the problem with brute coordinated force.
          Europe has the engineers to build the grid and the capital to fund it (the same €33
          trillion from the capital chapter) and has so far chosen to let the connection queue grow
          to ten years instead.
        </P>

        <P>
          And the Dutch queue is only the sharpest edge of a continental problem. Across the EU something on
          the order of <Sq>1.7 terawatts</Sq> of would-be generation (most of it wind and solar, more
          than the entire capacity installed on the system today) sits in connection queues waiting
          for wires that do not yet exist. In 2025, for the first time, wind and solar together out-generated{" "}
          <Sq>fossil fuels</Sq> across the EU&rsquo;s grid, a genuine milestone. And yet the cruelty of
          the bottleneck is exactly that:
          the clean, cheap power Europe has actually managed to build increasingly cannot reach the factories
          and data centres that need it, because the grid to carry it was never built alongside. It is the
          capital paradox again, written in copper: a continent rich enough to fund anything that has
          somehow under-invested in the one piece of infrastructure, the wires, on which every other ambition
          (electrification, reindustrialisation, AI) now physically depends.
        </P>

        <P>
          BASF is the loudest case, not the only one. <Sq>ArcelorMittal</Sq> moved to idle blast furnaces
          at Florange in France and Li&egrave;ge in Belgium, putting thousands of steel jobs at risk and
          citing power costs running past twenty euro-cents a kilowatt-hour. <Sq>Yara</Sq>, the Norwegian
          fertiliser giant, mothballed around two million tonnes of nitrogen capacity at Her&oslash;ya and
          K&aring;rst&oslash; after a four-fold electricity-cost spike and shifted production to the US Gulf
          and Trinidad, where power runs nearer six cents. The pattern is not weakness; it is arithmetic.
          And Europe stacks on top of it one cost its rivals do not pay at all: the{" "}
          <Sq>Emissions Trading System</Sq> carbon price, around ninety to a hundred euros a tonne, which
          adds a further eighteen to twenty-five euros per megawatt-hour to a European smelter&rsquo;s
          power bill that a Texan or Chinese competitor simply keeps as margin.
        </P>

        <P>
          And it is no longer only the energy-hungry chemicals and metals; the malaise has reached the
          machine-makers at the very core of the European model. In Germany, the continent&rsquo;s
          industrial heart, <Sq>Volkswagen</Sq> is cutting on the order of <Sq>35,000 jobs</Sq> by
          2030 and has begun shifting Golf production to Mexico; <Sq>Bosch</Sq>, the world&rsquo;s largest
          car-parts maker, has announced around <Sq>22,000</Sq>; ZF and Continental tens of thousands more
          between them. The chemical sector is in its <Sq>fourth consecutive year of crisis</Sq>, and the
          single most alarming data point is a survey finding: more than <Sq>half</Sq> of German industrial
          firms with over five hundred employees now say they are weighing moving production out of the
          country. This is not a downturn that ends with the cycle. It is the slow relocation of the
          continent&rsquo;s manufacturing base toward places where the power (and increasingly the
          future) is cheaper, happening to the one country that was supposed to be immune to it.
        </P>

        <P>
          The new economy tells the same story from the opposite direction. The AI build-out is, at bottom,
          a bet on cheap power, and the numbers have become almost comically lopsided: American hyperscalers
          have announced something on the order of <Sq>four hundred gigawatts</Sq> of new AI-compute
          capacity by 2030, against a European total well under <Sq>forty</Sq>. The reason is the meter. A
          data centre paying European industrial power prices (two to three times American ones)
          is uneconomic before the first server is racked, which is why no European hyperscaler has
          announced a major campus outside North America or the handful of cold, cheap-power corners like
          Iceland and Norway. Europe priced itself out of the old economy&rsquo;s furnaces and the new
          economy&rsquo;s data centres with one and the same tariff.
        </P>

        <P>
          Behind the frozen connection queues sits a number that explains why they will not thaw soon.
          Europe&rsquo;s own estimates put the grid investment it needs this decade at something like{" "}
          <Sq>&euro;584 billion</Sq>, with some analyses pushing past a trillion once the full
          electrification of heat, transport and industry is counted. And the actual build-out is
          running far behind. Germany has completed only a fraction of its planned high-voltage transmission
          lines; the Netherlands is rationing connections in its richest region. This is the capital chapter
          again, in a hard hat: the money to build the grid is the same idle savings from Chapter Three, and
          the decision not to mobilise it at speed is the same failure of nerve; only now it shows up
          as a substation that does not exist and a factory that therefore cannot.
        </P>

        <P>
          The bitterest detail is where the crunch bites hardest. Brainport, the Eindhoven region that hosts
          ASML and the densest concentration of high-tech industry on the continent, is itself running up
          against the limits of the local network: the single most strategically important industrial
          cluster in Europe, the one that builds the machine the whole digital world depends on, rationing
          its own ability to expand because the wires are full. More than ten thousand businesses sit in the
          Dutch connection queue behind it. When the country that makes the world&rsquo;s most advanced
          technology cannot reliably plug in its own most advanced factories, the problem has stopped being
          an energy-market quirk and become a sovereignty question in its own right.
        </P>

        <P>
          The single most painful loss is the one that was supposed to be the answer. <Sq>Northvolt</Sq>,
          the Swedish battery-maker, was Europe&rsquo;s great hope to build a homegrown champion in the one
          industry on which the entire electric transition depends, and in March 2025 it filed for
          bankruptcy under roughly <Sq>&euro;5.8 billion</Sq> of debt, the largest industrial collapse in
          modern Swedish history, its half-built gigafactory in the Arctic north left for others to pick
          over. Around it the older economy keeps closing: <Sq>Speira</Sq> shuttered primary aluminium
          smelting at Neuss; <Sq>Tata Steel</Sq> moved to close coke and blast-furnace lines at IJmuiden;{" "}
          <Sq>Yara</Sq> earmarked an ammonia plant in Belgium for closure. And the new economy cannot move
          in to replace them, because <Sq>AWS</Sq> and its peers now face grid-connection waits of up to
          seven years for new European data centres. The factories that leave do not come back, and the
          ones that might replace them cannot get plugged in.
        </P>

        <P>
          And a hard truth sits underneath the prices: much of the gap is self-inflicted policy, not fate.
          France, which kept and kept building nuclear power, enjoys some of the cheapest, cleanest
          electricity in Europe; Germany, which <Sq>shut its last reactors in 2023</Sq> in the middle of an
          energy crisis, locked in a deeper dependence on gas and a higher price for a generation. The
          continent that frets about strategic autonomy switched off its most strategically autonomous
          source of power on principle, then watched its chemical industry decamp over the resulting bills.
          Energy is the chapter where the verdict is least about American strength and most about European
          choice, which is also what makes it, in theory, the most fixable, if the nerve to reverse
          the choices could be found.
        </P>

        <P>
          Two 2025 decisions capture the bind from both directions. <Sq>ArcelorMittal</Sq> cancelled some
          two-and-a-half billion euros of green-hydrogen steel projects in Germany and walked away from more
          than a billion in German subsidies, judging that clean steel simply could not pay at European
          power prices: the green transition foreclosed by the very energy bill it was meant to drive.
          And the AI build, when it does reach Europe, goes where the power is cheap: OpenAI&rsquo;s{" "}
          <Sq>Stargate</Sq> programme is siting a hundred-thousand-GPU data centre not in the industrial
          heartland but in the far north of <Sq>Norway</Sq>, drawn to its abundant, cheap hydropower.
          Europe&rsquo;s electrons have become a sorting mechanism: heavy industry priced out, AI compute
          pushed to the cold edges, and the populous, productive core left paying the most for the least.
        </P>

        <P>
          The cruel twist is that the answer is proven and Europe has simply forgotten how to deploy it at
          speed. Finland&rsquo;s <Sq>Olkiluoto 3</Sq> and France&rsquo;s long-delayed <Sq>Flamanville</Sq>
          reactor both finally came online this decade and now pour cheap, clean, firm power into their grids:
          proof that the technology works. But Britain&rsquo;s <Sq>Hinkley Point C</Sq> has slipped
          toward 2030 at a cost ballooning past <Sq>£45 billion</Sq>, a monument to how
          thoroughly the West has lost the muscle memory of building big things on time. Europe&rsquo;s
          energy problem, in the end, is its capital and talent problems wearing a third costume: not an
          absence of the answer, but an inability to commit to it at scale, on schedule, against the
          short-term objections (the failure of nerve, rendered in concrete and cooling towers).
        </P>

        <P>
          Nowhere is the industrial squeeze more visible than in the country that was supposed to be immune
          to it. Germany, the manufacturing heart of Europe, ground through a third straight year of
          stagnation in 2026 with the grim furniture of decline piling up: <Sq>Volkswagen</Sq> shut a German
          factory for the first time in eighty-eight years; <Sq>Bosch</Sq> announced twenty-two thousand job
          cuts; <Sq>Thyssenkrupp</Sq>, the storied steelmaker, agreed to shed some eleven thousand jobs
          (40% of its steel workforce) and lined up a sale to an Indian group.
          German unemployment crossed <Sq>three million</Sq> for the first time in over a decade, and
          corporate insolvencies hit their highest level in years. The proximate causes are the ones this
          chapter has catalogued (energy at well over twice American prices), compounded by a
          second shock from the opposite direction: Chinese electric cars, led by <Sq>BYD</Sq>, eating the
          home market of the very industry that defined modern Germany. The country that was the rebuttal to
          every declinist argument about Europe is now the argument&rsquo;s leading exhibit, and it got
          there by the same machine: priced out of energy, out-built on capital, out-scaled on the
          technologies that will define the next economy.
        </P>

        <P>
          Watch how the Americans solved the same power problem, because the contrast is total. Unable to
          wait for the grid, the US hyperscalers simply <em>bought their own nuclear plants</em>: Microsoft
          signed a deal to restart a reactor at <Sq>Three Mile Island</Sq> to feed its data centres; Amazon
          struck a multi-billion-dollar agreement for the output of the <Sq>Susquehanna</Sq> nuclear
          station. When a company that size needs a gigawatt of firm power, it writes a cheque and gets one.
          A European firm in the same position joins a connection queue that now runs <Sq>seven to thirteen
          years</Sq> in Dublin, Frankfurt, London, Amsterdam and Paris alike. The difference is not
          technology or even, ultimately, money; Europe has both. It is the capacity to <em>act</em>:
          to build, to buy, to clear the path, at the speed the moment demands. The Americans are powering
          the AI age off the grid by sheer force of will. Europe is waiting in line for permission.
        </P>

        <P>
          And the men who run German industry have stopped using diplomatic language. Peter Leibinger, head
          of the powerful federation of German industries, called the moment Germany&rsquo;s <Sq>&ldquo;deepest
          crisis since the founding of the Federal Republic&rdquo;</Sq>; the billionaire industrialist
          Reinhold W&uuml;rth warned that the country was caught in a <Sq>&ldquo;downward spiral of
          deindustrialisation.&rdquo;</Sq> These are not activists or professional declinists; they are the
          owners and chiefs of the very firms the energy crisis is hollowing out, and they are saying, in
          public, that the post-war German economic model is breaking. When the people with the most to lose
          and the most reason for optimism begin talking like this, the polite official insistence that the
          slump is merely cyclical becomes very hard to credit.
        </P>

        <P>
          The closures have not slowed; if anything they have become routine enough to stop making headlines.{" "}
          <Sq>BASF</Sq> is shutting eleven plants at Ludwigshafen alone, including ammonia and TDI lines, as
          part of more than €1 billion of annual cost cuts; <Sq>INEOS</Sq> is closing chemical units in
          Germany; the cumulative European chemical capacity lost since 2022 has passed <Sq>37 million
          tonnes</Sq>, nearly a tenth of the total. And the energy dependence that drove it has, if anything,
          deepened: having replaced Russian pipeline gas, Europe now imports the majority of its liquefied
          natural gas from the United States (some <Sq>63%</Sq> of it, heading toward eighty),
          trading one external dependence for another, at a price that keeps its industry uncompetitive
          either way. The continent swapped a hostile supplier for a friendly one and called it security;
          what it actually bought was the same vulnerability with a better-tempered landlord.
        </P>

        <P>
          The one country making a serious, sustained bet is, again, France, which committed some{" "}
          <Sq>&euro;73 billion</Sq> to build six new EPR2 reactors, a multi-decade wager on cheap
          sovereign power that is exactly the kind of patient constancy the rest of the continent struggles to
          muster. Set against it is the counter-signal: <Sq>Fluidstack</Sq>, an AI-cloud company, decamped
          from Europe to list in the United States at an eighteen-billion-dollar valuation, taking its compute
          build with it. The two facts frame the whole chapter. Cheap, firm, sovereign power is buildable, and
          France is building it; but absent that power, and the speed to connect it, the AI economy that runs
          on electrons simply forms up somewhere else. Europe&rsquo;s energy choices are not only about
          industry&rsquo;s past. They are about whether the future plugs in at home or abroad.
        </P>

        <P>
          The energy chapter, then, is the capital chapter and the talent chapter in physical form: a
          continent that has the resources to solve a solvable problem and keeps declining to spend the
          nerve. The next chapter turns to the place where Europe is now spending money fastest of all
          (defence) and finds, depressingly, the same machine running underneath: a
          historic surge of European money that ends up, by a different route, buying American.
        </P>
      </Prose>

      <Sources
        items={[
          "Industrial energy prices: EU industrial electricity ~€0.199/kWh vs US ~€0.075 (~2.5–2.65×) and ~2.4× China; EU gas benchmark (TTF) ~5× US Henry Hub (mid-2026), ~3× delivered LNG. Eurostat; IEA Electricity 2026; Draghi report (2–3× power, 4–5× gas).",
          "European chemical industry: ~37 Mt capacity lost 2022–2025 (~9% of EU total); ~109,000 jobs lost or at risk (≈20k direct + 89k indirect); output ~11–15% below pre-crisis; ~49% of closures cite energy. Cefic Chemical Trends Q2 2025; ICIS Feb 2026.",
          "BASF: €8.7bn Zhanjiang (China) Verbund site inaugurated 26 Mar 2026; Ludwigshafen plant closures amid €1bn+ operating losses. BASF press release (Mar 2026).",
          "Germany’s heartland, 2026: VW ~35,000 job cuts by 2030 (Golf→Mexico); Bosch ~22,000; ZF ~7,600; Continental ~3,000; chemical sector in its 4th straight crisis year; >50% of German firms with 500+ staff weighing relocation; ifo climate ~84.4 (Apr 2026). VW; Bosch; ifo; sector reports.",
          "Dutch grid: ~47 GW of connection requests (≈14,044 regional + 212 national) waitlisted with ~10-year waits; TenneT warns the grid will fail to meet 2030 demand; Randstad/Schiphol frozen to ~2035. TenneT / NL Times, Jun 2026.",
          "EU-wide grid: ~1.7 TW of would-be generation sits in EU connection queues (more than today’s installed capacity); wind & solar out-generated fossil fuels for the first time in 2025 (~30% vs 29%; renewables ~47%); data-center grid-connection waits ~7–10 years (to ~13). ENTSO-E; Ember; sector reports.",
        ]}
      />
    </section>
  )
}
