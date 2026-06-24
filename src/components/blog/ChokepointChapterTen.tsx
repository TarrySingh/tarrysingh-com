import type { ReactNode } from "react"

import { ValueCaptureWaterfall } from "./ValueCaptureWaterfall"
import { FromScratchGiants } from "./FromScratchGiants"
import { IrishMirage } from "./IrishMirage"
import { CloudActSwitch } from "./CloudActSwitch"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * CHAPTER 10 — The Quarter-Trillion Tribute: The Wealth-Transfer Ledger.
 * The spine payoff: the whole machine totalled in euros. Figures verified to
 * July 2026 (Asterès/Cigref; companiesmarketcap; Ireland CSO; CASSIS;
 * Compass Lexecon). V33 + V34 (treemap) + V35 + V36.
 */
export function ChokepointChapterTen() {
  return (
    <section id="chapter-10">
      <ChapterMark kicker="Chapter Ten · The Ledger" title="The Quarter-Trillion Tribute" />

      <Prose>
        <Lead>
          Now the bill. Every chapter so far has traced one stream of the outflow &mdash; the savings, the
          companies, the talent, the electrons, the defence euros, the value the rulebook fails to keep.
          This chapter totals them, in the one currency that ends arguments: euros, on a ledger, paid
          annually. The headline number is the cloud, and it is the cleanest single measure of the whole
          machine. Europe pays the United States something like <Won>&euro;264 billion a year</Won> for
          digital infrastructure and software &mdash; a quarter of a trillion euros, every year, for the
          right to run its economy on someone else&rsquo;s computers. It is not a debt, which would at
          least end. It is a tribute, which renews by default.
        </Lead>

        <P>
          Watch where the money actually goes, because the shape of it is the whole argument. Of
          Europe&rsquo;s professional cloud spending, roughly <Sq>80 to 83% flows to US providers</Sq>,
          with about <Sq>70% captured by the three American hyperscalers</Sq> &mdash; Amazon, Microsoft,
          Google. What Europe keeps is the thin end: the reseller margins, the wages of the local sales
          teams, the concrete and steel of the data centres it builds on its own soil to host American
          software. The value that compounds &mdash; the equity, the intellectual property, the
          platform &mdash; books elsewhere. Europe is, quite literally, paying to construct the buildings
          in which its digital dependence is housed. Step down the waterfall below and watch the basis
          points leave.
        </P>
      </Prose>

      <Figure>
        <ValueCaptureWaterfall />
      </Figure>

      <Prose>
        <P>
          The accumulated result of paying that tribute for a decade is a gap in raw corporate scale that
          has stopped being a gap and become a different order of being. The seven largest American
          technology companies are now worth, together, around <Lev>$23 trillion</Lev> &mdash; roughly{" "}
          <Won>the entire GDP of the European Union</Won>, and close to one and a half times the value of
          every company listed on every European exchange combined. Drill into a single one and the point
          turns surreal: <Sq>Nvidia alone, at about $4.8 trillion, is now worth more than the whole German
          economy</Sq> &mdash; one American chip company, more valuable than Europe&rsquo;s industrial
          heartland. Pan across the landscape below; the American mass on one side and the European on the
          other are not two teams in the same league. They are two different sports.
        </P>
      </Prose>

      <Figure max={1180}>
        <FromScratchGiants />
      </Figure>

      <Prose>
        <P>
          A defender of Europe has, at this point, one number left to reach for &mdash; the trade
          statistics, which appear to show Europe running a healthy surplus with the world in services,
          anchored by Ireland&rsquo;s spectacular export figures. It is the last bright number on the
          board, and it is a mirage. Ireland&rsquo;s headline GDP, around <Sq>&euro;563 billion</Sq>, sits
          about <Sq>75% above its real national income</Sq> (GNI*, near &euro;321 billion) &mdash; the gap
          is almost entirely the accounting shadow of US multinationals booking global profits through
          Dublin for tax reasons. Strip that distortion out, and the genuine transatlantic digital balance
          is not a surplus at all but a deficit on the order of <Sq>&minus;$350 billion</Sq>. The number
          that looked like Europe winning was American profit, parked in a European postbox. Flip the
          toggle below from the mirage to the real ledger.
        </P>
      </Prose>

      <Figure max={1160}>
        <IrishMirage />
      </Figure>

      <Prose>
        <P>
          And the tribute buys more than dependence; it buys exposure, because the platform Europe rents
          comes with a foreign government attached. Around <Sq>80% of the EU public sector&rsquo;s
          productivity software is Microsoft&rsquo;s</Sq>, and data held by American companies falls, under
          the US CLOUD Act, within reach of American law wherever in the world it physically sits. For
          years this was an abstraction lawyers worried about. In 2025 it stopped being abstract: after the
          US administration sanctioned the International Criminal Court&rsquo;s chief prosecutor,{" "}
          <Sq>Karim Khan</Sq>, his Microsoft email went dark, and he decamped to a Swiss provider. Microsoft
          insists the Court chose to disconnect him rather than the company cutting him off &mdash; the
          attribution is genuinely disputed &mdash; but the lesson landed regardless: the email of the
          world&rsquo;s leading war-crimes prosecutor became inaccessible the moment Washington was
          displeased, on a platform that runs Europe&rsquo;s ministries too. Throw the switch below.
        </P>
      </Prose>

      <Figure>
        <CloudActSwitch />
      </Figure>

      <Prose>
        <PullQuote>
          A quarter of a trillion euros a year, a market worth a continent, a surplus that is a mirage,
          and an off-switch in a foreign capital. This is the ledger, and it has been open, and unbalanced,
          and unremarked, for a decade.
        </PullQuote>

        <P>
          It would be easy to read this chapter as the bleakest of the lot, and in euros it is. But notice
          the faint, repeated counter-melody, because the essay turns on it: Euro-Office, a sovereign
          European software suite, launched in June 2026; Denmark, Austria and France have begun migrating
          their public sectors off Microsoft; the Karim Khan affair did more to concentrate European minds
          on data sovereignty than a decade of position papers. The tribute is enormous and it is real.
          It is also, like every other line on this ledger, a standing order &mdash; and the one thing we
          know about standing orders, from the first chapter to this one, is that they can be cancelled by
          anyone with the nerve to sign the form.
        </P>

        <P>
          The exposure is not a worst-case hypothetical; it is the default legal architecture. The US{" "}
          <Sq>CLOUD Act</Sq> of 2018 lets American authorities compel data held by American companies
          anywhere on Earth, with no requirement for the host country&rsquo;s consent &mdash; and since
          something like <Sq>80% of EU public-sector data</Sq> sits on American platforms, the Karim Khan
          episode was less an aberration than a live demonstration of a standing reality. The same
          concentration shows up on the tax ledger: Ireland now draws roughly <Sq>46% of its corporation
          tax</Sq> from just three US firms &mdash; splendid until the day Washington changes its own rules
          and a third of a small country&rsquo;s revenue turns out to hinge on decisions made in a foreign
          capital. Dependence, it turns out, is not only something you pay for in cloud invoices. It is
          something you quietly bank your public finances on.
        </P>

        <P>
          The counter-melody, faint but real, is that some governments have finally started to walk out.
          After the Khan affair, <Sq>Denmark</Sq> began moving its public administration off Microsoft
          email and productivity software; <Sq>Austria</Sq>&rsquo;s federal computing centre started
          shifting departments to open-source <Sq>LibreOffice</Sq> and <Sq>Nextcloud</Sq>; France pressed
          ahead with its sovereign-suite plans. These are early, partial and technically painful &mdash; a
          ministry does not leave Outlook in an afternoon &mdash; and they will not, by themselves, move the
          &euro;264-billion figure much. But they matter as proof of concept: the tribute is not a law of
          physics. It is a contract, and contracts can be cancelled by a customer with the will to absorb
          the switching cost. The whole essay keeps asking whether Europe has that will at scale, or only in
          a brave few capitals.
        </P>

        <P>
          And the dependence is deepest exactly where it matters most. European firms run a meaningful slice
          of ordinary computing on local providers &mdash; but for the <em>strategic</em> workloads, the AI
          training and inference that will define the next decade, the hyperscalers&rsquo; share runs toward{" "}
          <Sq>nearly 100%</Sq>, because only they have the scale of accelerated compute to do it. So the
          tribute is not a flat tax across the whole economy; it is concentrated, and rising, precisely on
          the frontier. Europe can keep renting yesterday&rsquo;s computing from itself. Tomorrow&rsquo;s it
          rents, almost entirely, from three American firms &mdash; which makes the quarter-trillion figure
          not a ceiling but a floor, set to climb as the workloads it cannot yet host at home become the
          whole game.
        </P>

        <P>
          To feel the asymmetry, set the scoreboards side by side. The seven largest American technology
          companies are together worth more than every listed company in Europe combined, by something like
          half again. A single one of them, <Sq>Nvidia</Sq>, is worth more than the entire German economy
          &mdash; one firm, founded in 1993, selling chips designed in California and made in Taiwan on
          machines built in the Netherlands, now outweighing the industrial heartland of the continent that
          builds those machines. There is no European company within an order of magnitude. This is not a
          gap that closes with a good quarter or a clever policy; it is the accumulated interest on twenty
          years of the standing order, compounded &mdash; and still compounding.
        </P>

        <P>
          Even the &ldquo;sovereign&rdquo; answers keep routing back to the same firms. Germany&rsquo;s
          flagship sovereign-cloud project, <Sq>Delos Cloud</Sq>, is built on Microsoft Azure; the
          much-trumpeted <Sq>Microsoft EU Data Boundary</Sq>, which promised European data would stay in
          Europe, turned out on inspection to carry documented carve-outs letting engineers outside the EU
          reach support data. And the dependence has a price as well as a politics: when Broadcom bought
          VMware, the virtualisation software a great deal of European enterprise runs on, and sharply raised
          its prices, a coalition of European cloud firms filed a formal antitrust complaint &mdash; because
          they had nothing else to switch to. &ldquo;Sovereign,&rdquo; in practice, keeps collapsing back
          into &ldquo;American, with a European label and a reassuring clause&rdquo; &mdash; and the clause
          is only as good as the day Washington decides otherwise.
        </P>

        <P>
          If you want the dependence stated in a single sentence, a Microsoft executive supplied it under
          oath. In June 2025 the company&rsquo;s French legal director, questioned by the French Senate,{" "}
          <Sq>conceded that Microsoft could not guarantee</Sq> that European customers&rsquo; data would be
          shielded from American authorities under the CLOUD Act &mdash; could not, in other words, promise
          the one thing &ldquo;sovereign cloud&rdquo; is sold to deliver. It was an honest answer, and a
          damning one. Around it the extraction continues in quieter forms: when European governments levied
          digital-services taxes on the platforms, the platforms simply passed the cost back to European
          advertisers as a surcharge. The tribute is not only large; it is structured so that the attempts
          to claw it back are themselves billed to Europe.
        </P>

        <P>
          The money does flow back in trickles, where governments fight for it. France collects several
          hundred million euros a year from its <Sq>digital-services tax</Sq>; Italy widened its own by
          scrapping the revenue threshold so that any sales into the country are caught. But these are
          rear-guard skirmishes over a sliver of the outflow, and they invite retaliation &mdash; Washington
          has repeatedly threatened tariffs against countries that tax its champions. The more telling
          movement is on the procurement side, where the <Sq>German military</Sq> joined the civilian
          agencies in refusing Palantir over sovereignty concerns. It is the same lesson arriving from every
          direction at once: you cannot tax your way back to sovereignty, and you cannot litigate your way
          there either. You can only build or buy your way there &mdash; and Europe has spent two decades
          doing neither.
        </P>

        <P>
          And the squeeze comes from two directions at once, which is the part that makes it feel
          inescapable. If the United States owns the top of the technology stack &mdash; the platforms, the
          frontier models, the cloud &mdash; China increasingly owns the bottom: it refines something like{" "}
          <Sq>92% of the world&rsquo;s rare earths</Sq> and produces the overwhelming majority of the
          gallium and germanium that chips, sensors and weapons require, and it has already shown it will
          throttle those exports as leverage. Europe sits in the middle, dependent on America for the
          software that runs its economy and on China for the materials &mdash; and increasingly the
          manufactured goods, the electric cars, the solar panels, the batteries &mdash; that fill it. To be
          a chokepoint empire is to be feared. To be caught between two of them, holding decisive leverage
          over neither, is to be the place where the squeeze is felt.
        </P>

        <P>
          There is one accelerant left to account for, and it is the reason the whole ledger is about to
          get worse, fast. Every gap in this essay &mdash; capital, talent, energy, scale &mdash; is being
          multiplied in real time by a technology that rewards the leader and strip-mines the laggard with
          unprecedented speed. The final chapter of the diagnosis is about that accelerant: software that
          now costs almost nothing to make, deflates by an order of magnitude a year, and pours its
          returns into exactly the concentrated, well-capitalised, energy-rich hands Europe does not have.
          If the machine has run quietly for a decade, Software 3.0 is the foot going down on the pedal.
        </P>
      </Prose>

      <Sources
        items={[
          "Cloud tribute: Europe spends ~€264bn/yr on US software/cloud (~80–83% of professional cloud spend; ~70% to the three US hyperscalers; ~1.5% of EU GDP). Asterès for Cigref/Numeum (2025); Synergy Research.",
          "Scale: US “Magnificent Seven” combined ~$23tn (mid-2026) ≈ EU GDP, ~1.46× all EU listed companies (~$15.7tn); Nvidia ~$4.85tn > Germany's GDP ~$4.69tn. companiesmarketcap.com (Jun 2026).",
          "Irish mirage: Ireland GDP ~€563bn vs GNI* ~€321bn (GDP ~75% above real income); top 3 firms ~46% of Irish corporation tax; real EU–US digital trade deficit ~−$350bn (2022–24). Ireland CSO (2024); CASSIS / University of Bonn; Irish Fiscal Council.",
          "Public-sector lock-in: Microsoft ~77–92% (≈80%) of EU public-sector productivity software; Euro-Office sovereign suite launched Jun 2026; Denmark/Austria/France migrating. Open Cloud Coalition / Compass Lexecon (Jul 2025).",
          "CLOUD Act demonstration: ICC prosecutor Karim Khan's Microsoft email became inaccessible after a US executive-order sanction (Feb 2025); he moved to Proton (Switzerland). Attribution disputed (Microsoft says the ICC disconnected him). The Register; AP; Computer Weekly (2025–26).",
        ]}
      />
    </section>
  )
}
