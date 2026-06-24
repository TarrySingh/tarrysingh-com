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
          technology companies are now worth, together, more than <Lev>$20 trillion</Lev> &mdash; on the
          order of <Won>the entire GDP of the European Union</Won>, and well over the combined value of every
          company listed on every European exchange. Drill into a single one and the point turns surreal:{" "}
          <Sq>Nvidia alone, at about $4.8 trillion, is worth roughly as much as the entire German
          economy</Sq> &mdash; one American chip company, on the scale of Europe&rsquo;s industrial
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
          half again. A single one of them, <Sq>Nvidia</Sq>, is worth roughly as much as the entire German
          economy &mdash; one firm, founded in 1993, selling chips designed in California and made in Taiwan
          on machines built in the Netherlands, now rivalling the industrial heartland of the continent that
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
          And in 2026 the bottom of that squeeze stopped being abstract. <Sq>BYD</Sq>&rsquo;s electric-car
          registrations in Europe rose around <Sq>180% year on year</Sq> in early 2026, vaulting it into the
          continent&rsquo;s top three despite a combined EU duty above forty per cent; <Sq>CATL</Sq>, already
          the supplier of more than half of Europe&rsquo;s batteries, is building gigafactories on European
          soil while holding a global battery share north of forty per cent. Roughly <Sq>95% of Europe&rsquo;s
          solar panels</Sq> come from China, and when Beijing trimmed an export rebate in 2026 the price of
          European solar simply rose. Where Washington reaches for export controls, Beijing reaches for the
          mirror image: when the EU put tariffs on Chinese electric cars, China answered with duties of up to{" "}
          <Sq>42.7%</Sq> on European dairy, plus probes into its pork and brandy &mdash; aimed, with
          precision, at the farm vote &mdash; even as it began forcing Huawei out of European 5G cores. The
          continent&rsquo;s 2025 goods deficit with China widened to some <Sq>&euro;360 billion</Sq>.
        </P>

        <P>
          The same two-front logic now reaches the frontier itself. China&rsquo;s open-weight models &mdash;{" "}
          <Sq>DeepSeek</Sq> and its successors &mdash; deliver capability close to the American frontier at a
          fraction of the cost, and they slip past US export controls entirely, because anyone can simply
          download them. For a continent that cannot match American capital intensity, the cheaper Chinese
          tier is genuinely tempting &mdash; and reaching for it would only swap one dependence for another.
          That is the trap in its final form: Europe can rent the top of the stack from America or the bottom
          of it from China, but the one option fifteen years of strategy has not produced is the third &mdash;
          owning enough of either to set its own terms.
        </P>

        <P>
          Widen the lens beyond cloud and the tribute only grows. Europe runs a services trade deficit with
          the United States of around <Sq>&euro;178 billion a year</Sq>, much of it digital; global
          cross-border payments for the use of intellectual property &mdash; the licensing of patents,
          brands and software &mdash; passed a trillion dollars, with the United States the largest single
          collector. Even the regulator&rsquo;s biggest swings barely dent it: the Commission fined{" "}
          <Sq>Google three billion euros</Sq> in 2025 over its ad-tech dominance, lifting its cumulative EU
          antitrust fines past eight billion &mdash; sums that are at once the largest in the history of
          competition law and a rounding error against the revenue the same firm pulls out of Europe every
          year. The tribute is paid in a hundred currencies &mdash; cloud fees, ad revenue, IP royalties,
          app-store commissions &mdash; and totalled, it is the quiet transfer of a great power&rsquo;s
          economic surplus to another.
        </P>

        <P>
          Even the most basic plumbing of the economy runs on foreign rails. Every time a European taps a
          card, the transaction almost certainly flows through <Sq>Visa or Mastercard</Sq> &mdash; two
          American networks that together handle well over half of the continent&rsquo;s cashless payments
          and clear some twenty-odd trillion euros a year, taking a sliver of each and seeing the data trail
          of a continent&rsquo;s spending. Europe has tried for two decades to build its own: the
          &ldquo;Monnet Project&rdquo; collapsed when national banks would not cooperate, and only now, with{" "}
          <Sq>Wero</Sq> &mdash; a pan-European wallet that moved billions in its first year and, in 2026,
          linked arms with Italy&rsquo;s, Spain&rsquo;s, Portugal&rsquo;s and the Nordics&rsquo; national
          systems &mdash; is a genuine alternative finally taking shape. It is the whole essay in miniature:
          a sovereignty so basic most Europeans never think about it, surrendered for decades to American
          firms, and reclaimable only once the continent finally decides to stop competing as twenty-seven
          and start acting as one.
        </P>

        <P>
          The extraction runs through the screen as well as the wallet. <Sq>Meta</Sq> alone pulls something
          like <Sq>forty to forty-four billion euros</Sq> a year in advertising revenue out of Europe; Google
          takes more; the app stores levy their tithe on every download and subscription. And one layer
          deeper, the financial system itself is denominated in someone else&rsquo;s currency: the US dollar
          appears in roughly <Sq>half of all international payment messages</Sq> and the overwhelming majority
          of foreign-exchange trades, which lets Washington turn the plumbing of global finance into an
          instrument of foreign policy at will. Europe has its own currency and one of the world&rsquo;s
          great trading blocs, and still its companies advertise, transact and settle on rails it does not
          own. The tribute, fully tallied, is not one bill but a stack of them &mdash; and almost every one
          is addressed across the Atlantic.
        </P>

        <P>
          And the rawest resource of all, Europe gives away for free. Every search, post, purchase and
          location ping a European generates is data, and data is the feedstock of the AI economy &mdash; and
          the overwhelming majority of it is harvested, refined and monetised by American platforms, then
          sold back to Europe in the form of the very services that collected it. Europe&rsquo;s answer, a{" "}
          <Sq>Data Act</Sq> meant to treat data as shared European infrastructure, took effect in 2025
          &mdash; and pointedly <em>excluded</em> the largest gatekeepers from its core data-sharing duties,
          the loophole quietly swallowing the rule. A continent that frets about importing oil has spent two
          decades exporting something more valuable, in unlimited quantity, for nothing: the recorded
          behaviour of four hundred and fifty million people, the single richest training set on Earth,
          shipped abroad as fast as it is generated and bought back as a finished product.
        </P>

        <P>
          The Karim Khan affair had a sequel that is the most hopeful thing in the chapter. In October 2025
          the International Criminal Court &mdash; having watched its prosecutor&rsquo;s Microsoft account go
          dark under US sanctions &mdash; formally <Sq>migrated off Microsoft entirely</Sq>, moving to{" "}
          <Sq>openDesk</Sq>, an open-source suite built by Germany&rsquo;s public Centre for Digital
          Sovereignty. It is a small institution and a small migration, technically painful and far from
          complete. But it is the proof of concept the whole essay has been circling: that when the threat
          becomes concrete enough, the supposedly immovable dependence <em>can</em> be moved &mdash; that
          &ldquo;sovereign,&rdquo; open, European infrastructure is not a fantasy but a working alternative,
          waiting only for the will, and the fright, to adopt it. The tribute is enormous. It is also, as the
          ICC has just demonstrated, cancellable.
        </P>

        <P>
          The dependence reaches even the information Europeans use to govern themselves. The continent has
          no search engine, no social network, no app store of any scale &mdash; so the news its citizens
          read, the debates they have and increasingly the facts they believe are mediated by American
          platforms whose incentives are not European. When Google&rsquo;s AI-generated answers began keeping
          users from clicking through, European publishers watched their traffic fall by roughly a third and
          their viability, in the Commission&rsquo;s own words, come &ldquo;at risk in nearly all member
          states.&rdquo; When the owner of <Sq>X</Sq> chose to throw his platform&rsquo;s weight behind a
          far-right party before a German election, there was no European venue of comparable reach to
          counterbalance it. A continent can write all the content rules it likes; if it does not own the
          pipes the information flows through, it does not, in the end, control its own public square.
        </P>

        <P>
          Tally the everyday digital life of a European and the absence is total. The streaming they watch is
          American &mdash; Netflix, Disney, YouTube and the rest take some <Sq>80% of online video
          minutes</Sq> across the major European markets; the online shopping runs largely through Amazon,
          which leads all five of the continent&rsquo;s biggest e-commerce markets; the search is Google,
          which holds close to <Sq>90% of the European market</Sq> against low-single-digit shares for
          home-grown alternatives like Ecosia; the browsers are overwhelmingly Chrome; the phones
          run iOS or Android; the social feeds are American or Chinese; the cloud behind all of it is one of
          three US firms. There is no European Google, no European Amazon, no European Netflix, no
          European iPhone &mdash; not because Europeans would refuse to use them, but because Europe never
          built them, and, having not built them, now lives its entire digital existence as a paying guest in
          structures it does not own. A continent can be wealthy and cultured and free and still, in the
          medium that increasingly mediates everything else, be a tenant from morning to night.
        </P>

        <P>
          Scholars have started reaching for older words to describe all this, and the words are
          uncomfortable. The economist Yanis Varoufakis calls it &ldquo;technofeudalism&rdquo; and Europe a
          &ldquo;vassal&rdquo;; C&eacute;dric Durand sees capital shifting from making things to extracting
          rent from platforms; Couldry and Mejias describe the harvesting of human behaviour as a new{" "}
          <Sq>&ldquo;data colonialism&rdquo;</Sq>; Farrell and Newman map how control of the world&rsquo;s
          digital chokepoints became, in their phrase, <Sq>&ldquo;weaponised interdependence.&rdquo;</Sq> Even
          Anu Bradford, who literally wrote the book on the &ldquo;Brussels Effect,&rdquo; now says its
          &ldquo;high-water mark&rdquo; has passed. You do not have to accept every flourish of the framing to
          feel its weight: a relationship in which one party supplies the platforms, the capital, the chips
          and the rules, and the other supplies the data, the customers and the rent, is not a partnership of
          equals. It is one of the oldest arrangements in economic history, wearing a touchscreen.
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
          "Scale: US “Magnificent Seven” combined >$20tn (mid-2026), on the order of EU GDP (~$18–19tn) and ~1.4–1.7× all EU listed companies; Nvidia ~$4.8tn, roughly on the scale of Germany's GDP (~$4.7–5.4tn). companiesmarketcap.com (Jun 2026).",
          "Irish mirage: Ireland GDP ~€563bn vs GNI* ~€321bn (GDP ~75% above real income); top 3 firms ~46% of Irish corporation tax; real EU–US digital trade deficit ~−$350bn (2022–24). Ireland CSO (2024); CASSIS / University of Bonn; Irish Fiscal Council.",
          "Public-sector lock-in: Microsoft ~77–92% (≈80%) of EU public-sector productivity software; Euro-Office sovereign suite launched Jun 2026; Denmark/Austria/France migrating. Open Cloud Coalition / Compass Lexecon (Jul 2025).",
          "CLOUD Act demonstration: ICC prosecutor Karim Khan's Microsoft email became inaccessible after a US executive-order sanction (Feb 2025); he moved to Proton (Switzerland). Attribution disputed (Microsoft says the ICC disconnected him). The Register; AP; Computer Weekly (2025–26).",
          "ICC sequel: the Court migrated off Microsoft to openDesk (open-source, Germany's Centre for Digital Sovereignty / ZenDiS), Oct 2025. The Register.",
          "Microsoft under oath: its French legal director told the French Senate (Jun 2025) it could not guarantee EU data is shielded from the US CLOUD Act. French Senate testimony; reporting.",
          "Sovereignty theatre: Germany's Delos Cloud runs on Microsoft Azure; the Microsoft EU Data Boundary carries documented non-EU engineer-access carve-outs; CISPE filed an antitrust complaint over Broadcom/VMware pricing. Delos; Microsoft; CISPE.",
          "Payments rails: Visa & Mastercard clear ~€24tn/yr and well over half of EU cashless payments; the Monnet Project failed; Wero (EPI) + the EuroPA Alliance (Feb 2026) are the late European answer. ECB; EPI/Wero.",
          "Ad-tech & financial rails: Meta ~€40–44bn/yr EU ad revenue; the EU runs a ~€178bn services trade deficit with the US; USD in ~half of international payment messages; Google fined €3bn (2025, ad-tech). Eurostat; EC; SWIFT.",
          "Data as resource: the EU Data Act (in force Sep 2025) frames data as shared infrastructure but excludes the largest “gatekeepers” from core data-sharing duties. EU Data Act.",
          "The everyday absence: no European search engine, social network, app store, streaming or e-commerce platform at scale; US services ~80% of EU online-video minutes; Amazon leads all five largest EU e-commerce markets. DPP; e-commerce market reports.",
          "Concrete shares: Google ~90% of EU search (Ecosia ~0.5%, Qwant negligible); Chrome ~65% desktop; the late European Search Perspective JV remains sub-1%. StatCounter; country search data, 2026.",
          "Conceptual frame: Varoufakis (“technofeudalism”/“vassal”); Durand (rentier platform capital); Couldry & Mejias (“data colonialism”); Farrell & Newman (“weaponised interdependence”); Anu Bradford (“Brussels Effect” high-water mark passed).",
          "Two-empires squeeze: the US owns the top of the stack; China refines ~92% of rare earths and ~98% of gallium/germanium and has used export controls as leverage. USGS; IEA critical minerals.",
        ]}
      />
    </section>
  )
}
