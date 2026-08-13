import type { ReactNode } from "react"

import { CapTableColonisation } from "./CapTableColonisation"
import { TwoStockBench } from "./TwoStockBench"
import { EighteenMonthDecapitation } from "./EighteenMonthDecapitation"
import { Prose, P, Lead, ChapterMark, PullQuote, Lev, Won, Sq, Sources } from "./chokepoint-prose"

function Figure({ children, max = 1100 }: { children: ReactNode; max?: number }) {
  return (
    <div className="cp-gallery mx-auto my-14 w-full px-2 sm:px-4" style={{ maxWidth: max }}>
      {children}
    </div>
  )
}

/**
 * CHAPTER 5. Tenant Farms: The Bright Spots, Honestly.
 * The steelman: Europe makes world-beaters, and every one, examined closely,
 * has a foreign outlet, owner, or off-switch. Figures verified to July 2026
 * (Prosus; Dealroom; company filings; market caps). V18/V19/V20 embedded.
 */
export function ChokepointChapterFive() {
  return (
    <section id="chapter-5">
      <ChapterMark kicker="Chapter Five · Tenant Farms" title="The Bright Spots, Honestly" />

      <Prose>
        <Lead>
          At this point a fair reader is getting restless, and rightly. Every argument like this one has
          an obvious rebuttal: <em>but look at what Europe makes.</em> ASML. Arm. DeepMind. Mistral. Novo
          Nordisk and its miracle drugs. Spotify, Adyen, a whole defence-tech generation. Europe is not a
          museum; it is a workshop that still turns out world-beaters. That is true, and this chapter takes
          it seriously: jewel by jewel, at face value, with the numbers. The trouble is not that the
          bright spots are dim. It is that, examined closely, almost every one of them has a foreign
          outlet, a foreign owner, or a foreign off-switch. They are not the exception to the thesis. They
          are its most polished proof. Europe grows the crop; someone else owns the silo.
        </Lead>

        <P>
          Start with the cap table, because that is where ownership actually lives. The pattern is so
          consistent it has been measured: by the time a European startup breaks through to its big
          growth rounds, around <Sq>73% of the lead investors are American</Sq>. The roll-call writes
          itself. <Sq>Arm</Sq>, the British chip architecture in nearly every phone alive, is ~87% owned by
          Japan&rsquo;s SoftBank and listed on Nasdaq. <Sq>DeepMind</Sq>, the best AI lab Europe ever
          produced, is a wholly-owned arm of Google. <Sq>Wayve</Sq>, Britain&rsquo;s self-driving hope,
          raised into an $8.6-billion valuation on the backs of SoftBank, Microsoft and Nvidia.{" "}
          <Sq>Helsing</Sq>, Germany&rsquo;s defence-AI champion, took its $18-billion round from a
          US-led syndicate. <Sq>Aleph Alpha</Sq>, once Germany&rsquo;s great sovereign-AI hope, was
          absorbed into Canada&rsquo;s Cohere in 2026. And the late-stage money that decides all of this
          isn&rsquo;t close: US growth funding runs near <Lev>$141 billion</Lev> against Europe&rsquo;s{" "}
          <Sq>$12 billion</Sq>, roughly nine to one. Click through the jewels below and read each
          one&rsquo;s foreign landlord.
        </P>
      </Prose>

      <Figure max={1160}>
        <CapTableColonisation />
      </Figure>

      <Prose>
        <P>
          It would matter less if the bench behind these names were deep. It is not. Strip out the handful
          of European giants (ASML at <Won>$743 billion</Won>, SAP, Novo Nordisk, LVMH) and
          there is startlingly little behind them. Europe&rsquo;s market leadership is two or three players
          deep where America&rsquo;s is seven: the US &ldquo;Magnificent Seven&rdquo; alone are worth more
          than <Lev>$20 trillion</Lev> combined, a figure that rivals the entire listed value of large
          parts of Europe. A shallow bench is a fragile one; when a single star goes down, there is
          no depth to absorb the blow. Bench Novo Nordisk below and watch how much of Europe&rsquo;s
          top-tier value leaves with one injury.
        </P>
      </Prose>

      <Figure>
        <TwoStockBench />
      </Figure>

      <Prose>
        <P>
          And Novo is not a hypothetical injury; it is the most spectacular European corporate collapse of
          the decade, and it happened in eighteen months. In June 2024, riding the obesity-drug boom, Novo
          Nordisk was Europe&rsquo;s most valuable company, worth around <Won>$604 billion</Won>, a
          Danish firm briefly larger than the Danish economy. By mid-2026 it was worth about{" "}
          <Sq>$197 billion</Sq>: a <Sq>fall of roughly two-thirds</Sq>, half of it in 2025 alone. In the
          same window its American rival Eli Lilly climbed past it to become the first healthcare company
          ever worth <Lev>$1 trillion</Lev>, in November 2025 (now roughly <Lev>five times</Lev>
          Novo&rsquo;s size). The proximate trigger was a single disappointing clinical trial (Novo&rsquo;s
          CagriSema delivered 22.7% weight loss against a ~25% target). But the deeper lesson is the thin
          bench again: when Europe&rsquo;s one giant stumbled, there was no second giant to carry the
          flag. Scrub the eighteen months below.
        </P>
      </Prose>

      <Figure max={1160}>
        <EighteenMonthDecapitation />
      </Figure>

      <Prose>
        <P>
          Then there is the frontier that matters most for the next decade, where Europe&rsquo;s flag is
          carried by a single company: <Sq>Mistral</Sq>, valued around <Sq>&euro;20 billion</Sq> after its
          2026 round. It is a genuinely good lab. It is also a fraction (a small fraction) of the
          American frontier labs it is meant to rival, which are valued well into the hundreds of billions of
          dollars; Anthropic alone is on the order of <Sq>forty times</Sq> its size, and Mistral trains on
          rented Nvidia silicon, part-owned by ASML.
          Europe&rsquo;s entire answer to OpenAI, Anthropic and Google DeepMind is one company worth less
          than those labs raise in a single round. You can admire Mistral enormously and still see that one
          plucky challenger against a phalanx of giants is not a sovereign AI capability; it is a brave
          tenant on a very large American farm.
        </P>

        <PullQuote>
          The bright spots are real. That is precisely the problem: Europe is fully capable of growing
          world-class crops, and has built an entire economy in which the silos, the granaries, and the
          land registry all belong to someone else.
        </PullQuote>

        <P>
          Notice what this chapter is <em>not</em> saying. It is not saying these companies are failures;
          they are triumphs of European science and nerve. It is not even saying foreign capital is
          malign; SoftBank&rsquo;s money built Wayve, and Wayve is better for it. It is saying that a
          continent which produces this many jewels and retains ownership of so few has a capture problem,
          not a creation problem, and that &ldquo;but look at the bright spots&rdquo; is, on
          inspection, the strongest evidence for the prosecution, not the defence. The crop is magnificent.
          The lease is the issue.
        </P>

        <P>
          Run the roll-call and the pattern is total. <Sq>Spotify</Sq>, Sweden&rsquo;s streaming champion,
          is incorporated in Luxembourg, listed in New York, and counts China&rsquo;s Tencent among its
          shareholders. <Sq>Supercell</Sq>, the Finnish studio behind Clash of Clans, was bought by Tencent
          for some $10 billion. <Sq>Mojang</Sq>, the Swedish maker of Minecraft, went to Microsoft
          for $2.5 billion; <Sq>Skype</Sq>, the Estonian miracle that taught the world to make free calls,
          was bought by Microsoft for $8.5 billion and then, in December 2025, simply switched off and
          folded into Teams (a European household name discontinued by an American product manager,
          with no European in a position to object). And <Sq>DeepMind</Sq>, London&rsquo;s crown jewel of
          artificial intelligence, has been a division of Google for over a decade; its Nobel-winning
          breakthroughs are Alphabet&rsquo;s property. Every one of these is a genuine European triumph.
          Not one of them is European-owned.
        </P>

        <P>
          And ownership aside, even the champions Europe still nominally holds are tethered.{" "}
          <Sq>ARM</Sq>, the Cambridge chip-design house inside nearly every phone, is SoftBank-owned and
          Nasdaq-listed; <Sq>Wise</Sq> and <Sq>Revolut</Sq>, Britain&rsquo;s fintech stars, run on American
          venture capital and answer increasingly to American exchanges and IPO timetables; and{" "}
          <Sq>Mistral</Sq>, the great hope of European AI, is valued at roughly a fortieth of its American
          rival Anthropic, rents all its compute from Nvidia, and was rescued into relevance by a stake
          from ASML: one European chokepoint propping up another. The bright spots are real. They
          are also, almost without exception, working someone else&rsquo;s land on a lease they did not
          write.
        </P>

        <P>
          The newest tenant farm is the most telling, because Europe built it <em>on purpose</em> as a
          champion. And, as we have already seen, even <Sq>Mistral</Sq> is a chain of dependence: a
          European model trained on American chips, part-owned by a European monopoly that itself operates
          under American export law. There is no disgrace in any single link; each is the rational
          move on the board as it stands. But see the whole clearly: Europe&rsquo;s sovereign-AI champion is
          sovereign in branding and tributary in fact.
        </P>

        <P>
          The most expensive lesson of all is being taught right now in pharmaceuticals, and it is worth
          watching because it is the thesis at full speed. <Sq>Novo Nordisk</Sq>, the Danish maker of
          Ozempic and Wegovy, more or less invented the modern obesity-drug category, a genuine
          scientific triumph that briefly made it Europe&rsquo;s most valuable company. Then the American
          challenger, <Sq>Eli Lilly</Sq>, arrived with deeper pockets, a louder marketing machine and the
          full weight of the US health system behind it, and out-scaled Novo in its own invention. Through
          2025 Novo&rsquo;s market value roughly <Sq>halved</Sq>; in 2026 Lilly&rsquo;s pushed toward $1 trillion. Europe discovered the molecule. America is keeping the market.
        </P>

        <P>
          The same drama plays out one tier down, in the biotech that ought to be Europe&rsquo;s natural
          stronghold. There is real consolidation (Denmark&rsquo;s <Sq>Genmab</Sq> agreed an
          eight-billion-euro purchase of the Dutch antibody firm <Sq>Merus</Sq> in 2026, and Germany&rsquo;s{" "}
          <Sq>BioNTech</Sq> absorbed its compatriot <Sq>CureVac</Sq>), proof that Europe can, when it
          chooses, build scale inside its own borders. But the capital market underneath still drains the
          other way: of the European-domiciled biotechs that went public over the past six years, all but one
          listed <em>outside</em> Europe, and when Belgium&rsquo;s <Sq>Agomab</Sq> reached the public markets
          in 2026 it did so on Nasdaq, in dollars, like nearly everyone before it. Europe can invent the
          science and even, increasingly, own the mergers, and still watch the moment of
          capitalisation (the part where the wealth is actually minted) happen on an American exchange.
        </P>

        <P>
          And the pattern is already pre-installed in the next generation. <Sq>Wayve</Sq>, the British
          self-driving-AI company widely held to be Europe&rsquo;s best, raised its mega-round not from
          European funds but from <Sq>SoftBank, Microsoft and Nvidia</Sq> (which means that if it
          succeeds, the upside compounds to Tokyo and Redmond and Santa Clara, and if it ever needs an
          exit, there is no European acquirer remotely large enough to be the buyer). The bright spots are
          not counter-evidence to the argument. Examined honestly, one after another, they <em>are</em> the
          argument: world-class invention, foreign capture, on repeat, and faster each cycle.
        </P>

        <P>
          Take the single most celebrated case and look at it without flinching. <Sq>DeepMind</Sq> was
          founded in London in 2010, the most important artificial-intelligence laboratory Europe has ever
          produced; in 2014 it was sold to Google for a few hundred million dollars and has been a division
          of an American hyperscaler ever since. Its crowning achievement, <Sq>AlphaFold</Sq> (which
          cracked the fifty-year problem of predicting protein structures and won its leaders a share of the
          2024 Nobel Prize in Chemistry), is, as intellectual property, Alphabet&rsquo;s. A British lab
          made a discovery that will reshape biology for a century, and the value of it compounds in Mountain
          View. There is no prouder European achievement in modern AI, and no cleaner illustration of the
          thesis: the genius is European, the ownership is not.
        </P>

        <P>
          Two more cases sharpen the point from opposite ends. <Sq>Elastic</Sq>, the Dutch-founded search
          company, listed on the New York Stock Exchange in 2018 partly to escape the gravity of the
          American cloud giants, whereupon Amazon simply <Sq>forked its open-source code</Sq> into a
          rival product, &ldquo;OpenSearch,&rdquo; and captured much of the market the Dutch company had
          created. And <Sq>Adyen</Sq>, the rare European champion that stayed home (Euronext-listed,
          Amsterdam-headquartered, with the fattest margins in global payments), still processes only
          around <Sq>3% of global payment volume</Sq>, hemmed permanently beneath Visa and
          Mastercard. List in New York and the platforms eat you; stay in Amsterdam and you hit a structural
          ceiling. The genius is real on both paths. The ownership of the future is on neither.
        </P>

        <P>
          Consider the Italian software consolidator <Sq>Bending Spoons</Sq>, which built itself from a
          forty-thousand-dollar seed into the owner of Evernote, Vimeo, AOL and Eventbrite, partly by
          rewriting its products with AI; by early 2026 more than 90% of its code was
          machine-authored. For years it stayed defiantly private, its founder arguing that European firms
          could not command American valuations on public markets. Then, in June 2026, it filed to go public
          anyway: on <Sq>Nasdaq</Sq>, at some $19 billion, not in Milan or on any
          European exchange. Even the rare Italian champion that built something genuinely large concluded,
          when the moment came to cash the achievement in, that the only serious place to do it was New
          York. The gravity is not subtle, and it does not spare even the ones who tried hardest to resist
          it.
        </P>

        <P>
          And the tether does not always run west. Some of Europe&rsquo;s most prominent media and tech
          assets are bound, increasingly, to <em>Chinese</em> capital. <Sq>Tencent</Sq> holds around a fifth
          of <Sq>Universal Music Group</Sq>, the Amsterdam-listed company that is the largest record label
          on Earth; Spotify and Tencent swapped minority stakes years ago, lacing Europe&rsquo;s streaming
          champion into a dependence on Beijing-aligned capital and on Chinese goodwill for its largest
          Asian market; <Sq>Prosus</Sq>, the Dutch investment giant that aspires to be Europe&rsquo;s most
          valuable tech company, draws much of its worth from a roughly quarter-stake in Tencent. So even
          the European champions that escaped American gravity often did so by drifting into a different
          orbit. The point is not that China is the villain in America&rsquo;s place. It is that a continent
          which does not own its own platforms ends up owned, in pieces, by whoever does.
        </P>

        <P>
          There is one category where Europe genuinely held a giant, and its predicament is its own kind of
          warning. <Sq>SAP</Sq>, the German business-software titan, is the most valuable technology company
          in Europe, and <Sq>Dassault Syst&egrave;mes</Sq>, Schneider&rsquo;s software arm and Sweden&rsquo;s
          Hexagon are real, durable, world-class firms in industrial and design software. But watch what is
          happening to them now: as the business shifts to AI-driven, cloud, subscription and
          &ldquo;token-based&rdquo; pricing, their comfortable legacy margins are compressing, and the
          frontier of that shift (the models, the clouds, the chips it all runs on) is owned by
          the Americans. Even Europe&rsquo;s software champions are being pushed from owning the product
          toward renting the platform it must now live on. SAP&rsquo;s own answer, a twenty-billion-euro
          sovereign cloud built to stay interoperable with the US hyperscalers, captures the bind exactly:
          the best European software company can build a sovereign alternative, but it must keep it plugged
          in to the very giants it is meant to provide an alternative to.
        </P>

        <P>
          Pharmaceuticals deserve a closer look, because they are the field where Europe&rsquo;s scientific
          pedigree runs deepest and the erosion is therefore most telling. Europe&rsquo;s share of the
          world&rsquo;s manufacturing of <Sq>active pharmaceutical ingredients</Sq>, the molecules that
          make a drug a drug, collapsed from around <Sq>63% in 1981 to about 6% today</Sq>, almost all
          of it ceded to China and India, so that the continent that invented modern medicine now imports the
          substance of it. And the capital pattern is the familiar one: European biotech raised perhaps{" "}
          <Sq>&euro;25 billion</Sq> in venture funding over a decade against more than <Sq>&euro;200
          billion</Sq> in the United States, and of sixty-seven European biotechs that went public over six
          years, <Sq>sixty-six listed abroad</Sq>. Europe still does world-class biology. It simply
          manufactures it elsewhere, funds it elsewhere and lists it elsewhere, keeping, as ever, the
          discovery and exporting the value.
        </P>

        <P>
          Even the consolidation plays tell the story. <Sq>Zalando</Sq>, Europe&rsquo;s biggest
          fashion-e-commerce company, spent over €1 billion buying its rival About You in 2025 to build
          the scale to resist Amazon, and still leads only the narrow niche of cross-border fashion
          while Amazon leads the broad market in all five of Europe&rsquo;s largest economies.{" "}
          <Sq>Prosus</Sq>, the Dutch giant that owns much of the European delivery and classifieds landscape,
          is in truth a holding company whose worth rides on a quarter-stake in China&rsquo;s Tencent. The
          pattern even at the top of the European table is consolidation <em>around</em> the American and
          Chinese platforms rather than displacement of them: European champions merging with one
          another to hold a defensible corner of a market whose centre belongs to someone else. It is a
          rational survival strategy. It is not the behaviour of an industry that expects to lead.
        </P>

        <P>
          And when these champions do reach the public markets, their own financial statements quietly
          confess the ceiling. <Sq>Spotify</Sq>, for all its seven hundred million users, hands roughly{" "}
          <Sq>70% of its revenue</Sq> to the American music labels that own the rights, capping its margins
          permanently beneath them. <Sq>Klarna</Sq>, having listed in New York, trades down more than half
          from its offer price, valued by the market not as a rocket but as a mature payments processor.{" "}
          <Sq>Zalando</Sq> is worth three-quarters less than at its 2021 peak. The market is not being
          irrational; it is pricing a structural truth these companies live daily: that a European
          champion sitting beneath an American platform, an American rights-holder or an American exchange
          captures only the slice of value the layer above it chooses to leave. They are real, profitable,
          admirable businesses. They are also, every one of them, tenants reading the terms of a lease they
          did not write.
        </P>

        <P>
          Which points at the input underneath all the others, the one Europe is most lavishly endowed
          with and most carelessly exports: not capital, not companies, but people. The next chapter is
          about the talent: the brains Europe trains at its own expense and then rents out to the
          firms that will use them to buy the rest.
        </P>
      </Prose>

      <Sources
        items={[
          "Prosus, “The State of AI in Europe”: ~73% of lead investors in large European rounds are American; US late-stage funding ~$141bn vs Europe ~$12bn (~9:1), Q1 2026.",
          "Cap-table captures (company filings/announcements): Arm, SoftBank ~87%, Nasdaq; DeepMind, wholly owned by Alphabet/Google; Wayve, $8.6bn (Series D, Feb 2026; SoftBank/Microsoft/Nvidia); Helsing, $18bn round US-led (Dragoneer/Lightspeed, May 2026), ~80% European-owned; Aleph Alpha, absorbed into Cohere (Canada), Apr 2026; Klarna, NYSE (Sept 2025); Wise, Nasdaq primary (May 2026).",
          "Market depth: ASML ~$743bn, SAP, Novo Nordisk, LVMH among Europe's largest; US “Magnificent Seven” combined >$20tn (companiesmarketcap.com, mid-2026).",
          "Novo Nordisk vs Eli Lilly: Novo ~$604bn peak (Jun 2024) → ~$197bn (Jun 2026), ~67% fall (~50% in 2025); Eli Lilly first healthcare company to $1tn (24 Nov 2025), ~$1.01tn mid-2026 (~5× Novo); CagriSema 22.7% vs ~25% target (Feb 2026). CNBC; MacroTrends.",
          "Mistral AI ~€20bn (2026) vs Anthropic ~$965bn / OpenAI ~$852bn, Europe's best lab ~40× smaller; runs on rented Nvidia silicon, part-owned by ASML. Dealroom; company announcements.",
          "The tenant-farm roll-call: Spotify (NYSE, Tencent stake), Supercell & Skype & Mojang/Minecraft (Tencent/Microsoft), DeepMind (Google; AlphaFold won the 2024 Chemistry Nobel, IP Alphabet's), ARM (SoftBank/Nasdaq), Wise/Revolut (US VC). Company filings; Nobel.",
          "Novo Nordisk invented the GLP-1 category, then ~halved in value through 2025 as Eli Lilly out-scaled it (Lilly toward ~$1tn); Wayve (UK AV) backed by SoftBank/Microsoft/Nvidia. Reuters; company filings.",
          "Public-market ceilings: Spotify hands ~70% of revenue to US labels; Klarna trades ~56% below its 2025 IPO price; Zalando ~75% below its 2021 peak. Company filings.",
          "Pharma erosion: EU active-pharmaceutical-ingredient manufacturing fell from ~63% (1981) to ~6% (2024); EU biotech VC ~€25bn vs US ~€200bn over a decade; 66 of 67 European biotech IPOs listed abroad. ICIS; Atomico.",
          "Biotech consolidation vs flight (2026): Genmab–Merus ~€8bn; BioNTech–CureVac all-stock; yet of EU-domiciled biotechs public in six years, all but one listed abroad, Belgium’s Agomab IPO’d on Nasdaq (Feb 2026). Company filings.",
          "Software giants squeezed: SAP (~$180–200bn, P/E below US peers), Dassault Systèmes, Schneider/Hexagon, margins compressing in the AI/cloud shift; even Bending Spoons (Italy) filed a ~$19bn Nasdaq IPO (Jun 2026). Company filings.",
          "The eastern tether: Tencent holds ~20% of Universal Music Group and ~swapped stakes with Spotify; Prosus's value rides on a ~quarter-stake in Tencent. Billboard; company filings.",
        ]}
      />
    </section>
  )
}
