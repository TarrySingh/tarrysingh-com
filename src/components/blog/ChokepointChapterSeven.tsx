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
 * CHAPTER 7 — The Electrons We Priced Out: Energy.
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
          You can train the engineers, bank the savings, own the machine, and still build nothing &mdash;
          if the electricity that everything runs on costs two or three times what your rivals pay. This
          is the most physical chapter in the essay, the one you can read off a meter, and it is in some
          ways the most damning, because energy is not a matter of culture or nerve or cap tables. It is
          arithmetic. A factory either makes money at the local power price or it does not, and across much
          of European heavy industry, increasingly, it does not. The same failure shows up twice &mdash;
          as the old economy switching off, and as the new one quietly choosing to build somewhere else.
        </Lead>

        <P>
          Take the old economy first, because the damage is already booked. European industrial
          electricity runs at roughly <Sq>2.5 times the US price</Sq> &mdash; about &euro;0.199 per
          kilowatt-hour against &euro;0.075 &mdash; and around <Sq>2.4 times China&rsquo;s</Sq>. Gas is
          worse: the European wholesale benchmark has traded near <Sq>five times America&rsquo;s</Sq>. For
          an industry like chemicals, where energy <em>is</em> the feedstock, that is not a headwind; it is
          a verdict. Europe has lost something like <Sq>37 million tonnes of chemical capacity</Sq> since
          2022 &mdash; close to <Sq>9% of the total</Sq> &mdash; with output down 11 to 15% from
          pre-crisis levels and on the order of <Sq>109,000 jobs</Sq> gone or at risk. Nearly half of the
          announced closures cite energy costs as the reason. The new economy&rsquo;s ledger is the mirror
          image: the AI build-out needs vast, cheap power, and a continent whose electricity costs double
          forecloses on the data centres before they are drawn &mdash; which is why Europe&rsquo;s AI
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
          2026 &mdash; even as it closed plants at its historic home in Ludwigshafen, which has been posting
          billion-euro operating losses. A company does not move its century-old centre of gravity to the
          other side of the planet on a whim. It does so because the arithmetic at home stopped working,
          and the most German company there is voted with ten billion euros of capital. When BASF leaves,
          it is not a data point. It is a tolling bell.
        </P>

        <P>
          You can stack the disadvantage up and read it as a single number: the tax a producer pays simply
          for being located in Europe rather than on the US Gulf Coast. Start at an American baseline and
          add the electricity premium, then the gas premium, then the carbon price, then the regulatory
          load, and the cost of European location climbs well above parity &mdash; not because European
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
          And then, as if to remove any remaining doubt, there is the grid &mdash; because even the company
          that wants to build in Europe, and can afford the power, increasingly cannot get plugged in. In
          the Netherlands, the densest, richest corner of the continent, grid congestion has become an
          absolute brake: something like <Sq>47 gigawatts</Sq> of connection requests sit on waiting lists
          &mdash; over fourteen thousand of them &mdash; with waits stretching to <Sq>ten years</Sq>. The
          national grid operator has warned, flatly, that the network will <Sq>fail to meet electricity
          demand by 2030</Sq>; the Randstad around Amsterdam and Schiphol is effectively frozen to the
          mid-2030s. A factory, a data centre, a newly-electrified production line, a housing estate &mdash;
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
          Europe has the engineers to build the grid and the capital to fund it &mdash; the same €33
          trillion from the capital chapter &mdash; and has so far chosen to let the connection queue grow
          to ten years instead.
        </P>

        <P>
          BASF is the loudest case, not the only one. <Sq>ArcelorMittal</Sq> moved to idle blast furnaces
          at Florange in France and Li&egrave;ge in Belgium, putting thousands of steel jobs at risk and
          citing power costs running past twenty euro-cents a kilowatt-hour. <Sq>Yara</Sq>, the Norwegian
          fertiliser giant, mothballed around two million tonnes of nitrogen capacity at Her&oslash;ya and
          K&aring;rst&oslash; after a four-fold electricity-cost spike and shifted production to the US Gulf
          and Trinidad, where power runs nearer six cents. The pattern is not weakness; it is arithmetic
          &mdash; and Europe stacks on top of it one cost its rivals do not pay at all: the{" "}
          <Sq>Emissions Trading System</Sq> carbon price, around ninety to a hundred euros a tonne, which
          adds a further eighteen to twenty-five euros per megawatt-hour to a European smelter&rsquo;s
          power bill that a Texan or Chinese competitor simply keeps as margin.
        </P>

        <P>
          The new economy tells the same story from the opposite direction. The AI build-out is, at bottom,
          a bet on cheap power, and the numbers have become almost comically lopsided: American hyperscalers
          have announced something on the order of <Sq>four hundred gigawatts</Sq> of new AI-compute
          capacity by 2030, against a European total well under <Sq>forty</Sq>. The reason is the meter. A
          data centre paying European industrial power prices &mdash; two to three times American ones
          &mdash; is uneconomic before the first server is racked, which is why no European hyperscaler has
          announced a major campus outside North America or the handful of cold, cheap-power corners like
          Iceland and Norway. Europe priced itself out of the old economy&rsquo;s furnaces and the new
          economy&rsquo;s data centres with one and the same tariff.
        </P>

        <P>
          Behind the frozen connection queues sits a number that explains why they will not thaw soon.
          Europe&rsquo;s own estimates put the grid investment it needs this decade at something like{" "}
          <Sq>&euro;584 billion</Sq>, with some analyses pushing past a trillion once the full
          electrification of heat, transport and industry is counted &mdash; and the actual build-out is
          running far behind. Germany has completed only a fraction of its planned high-voltage transmission
          lines; the Netherlands is rationing connections in its richest region. This is the capital chapter
          again, in a hard hat: the money to build the grid is the same idle savings from Chapter Three, and
          the decision not to mobilise it at speed is the same failure of nerve &mdash; only now it shows up
          as a substation that does not exist and a factory that therefore cannot.
        </P>

        <P>
          The bitterest detail is where the crunch bites hardest. Brainport, the Eindhoven region that hosts
          ASML and the densest concentration of high-tech industry on the continent, is itself running up
          against the limits of the local network &mdash; the single most strategically important industrial
          cluster in Europe, the one that builds the machine the whole digital world depends on, rationing
          its own ability to expand because the wires are full. More than ten thousand businesses sit in the
          Dutch connection queue behind it. When the country that makes the world&rsquo;s most advanced
          technology cannot reliably plug in its own most advanced factories, the problem has stopped being
          an energy-market quirk and become a sovereignty question in its own right.
        </P>

        <P>
          The single most painful loss is the one that was supposed to be the answer. <Sq>Northvolt</Sq>,
          the Swedish battery-maker, was Europe&rsquo;s great hope to build a homegrown champion in the one
          industry on which the entire electric transition depends &mdash; and in March 2025 it filed for
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
          choice &mdash; which is also what makes it, in theory, the most fixable, if the nerve to reverse
          the choices could be found.
        </P>

        <P>
          Two 2025 decisions capture the bind from both directions. <Sq>ArcelorMittal</Sq> cancelled some
          two-and-a-half billion euros of green-hydrogen steel projects in Germany and walked away from more
          than a billion in German subsidies, judging that clean steel simply could not pay at European
          power prices &mdash; the green transition foreclosed by the very energy bill it was meant to drive.
          And the AI build, when it does reach Europe, goes where the power is cheap: OpenAI&rsquo;s{" "}
          <Sq>Stargate</Sq> programme is siting a hundred-thousand-GPU data centre not in the industrial
          heartland but in the far north of <Sq>Norway</Sq>, drawn to its abundant, cheap hydropower.
          Europe&rsquo;s electrons have become a sorting mechanism: heavy industry priced out, AI compute
          pushed to the cold edges, and the populous, productive core left paying the most for the least.
        </P>

        <P>
          The energy chapter, then, is the capital chapter and the talent chapter in physical form: a
          continent that has the resources to solve a solvable problem and keeps declining to spend the
          nerve. The next chapter turns to the place where Europe is now spending money fastest of all
          &mdash; defence &mdash; and finds, depressingly, the same machine running underneath: a
          historic surge of European money that ends up, by a different route, buying American.
        </P>
      </Prose>

      <Sources
        items={[
          "Industrial energy prices: EU industrial electricity ~€0.199/kWh vs US ~€0.075 (~2.5–2.65×) and ~2.4× China; EU gas benchmark (TTF) ~5× US Henry Hub (mid-2026), ~3× delivered LNG. Eurostat; IEA Electricity 2026; Draghi report (2–3× power, 4–5× gas).",
          "European chemical industry: ~37 Mt capacity lost 2022–2025 (~9% of EU total); ~109,000 jobs lost or at risk (≈20k direct + 89k indirect); output ~11–15% below pre-crisis; ~49% of closures cite energy. Cefic Chemical Trends Q2 2025; ICIS Feb 2026.",
          "BASF: €8.7bn Zhanjiang (China) Verbund site inaugurated 26 Mar 2026; Ludwigshafen plant closures amid €1bn+ operating losses. BASF press release (Mar 2026).",
          "Dutch grid: ~47 GW of connection requests (≈14,044 regional + 212 national) waitlisted with ~10-year waits; TenneT warns the grid will fail to meet 2030 demand; Randstad/Schiphol frozen to ~2035. TenneT / NL Times, Jun 2026.",
        ]}
      />
    </section>
  )
}
