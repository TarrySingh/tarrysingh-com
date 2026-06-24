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
 * CHAPTER 5 — Tenant Farms: The Bright Spots, Honestly.
 * The steelman: Europe makes world-beaters — and every one, examined closely,
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
          it seriously &mdash; jewel by jewel, at face value, with the numbers. The trouble is not that the
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
          <Sq>$12 billion</Sq> &mdash; roughly nine to one. Click through the jewels below and read each
          one&rsquo;s foreign landlord.
        </P>
      </Prose>

      <Figure max={1160}>
        <CapTableColonisation />
      </Figure>

      <Prose>
        <P>
          It would matter less if the bench behind these names were deep. It is not. Strip out the handful
          of European giants &mdash; ASML at <Won>$743 billion</Won>, SAP, Novo Nordisk, LVMH &mdash; and
          there is startlingly little behind them. Europe&rsquo;s market leadership is two or three players
          deep where America&rsquo;s is seven: the US &ldquo;Magnificent Seven&rdquo; alone are worth more
          than <Lev>$20 trillion</Lev> combined, a figure that rivals the entire listed value of large
          parts of Europe. A shallow bench is a fragile one &mdash; when a single star goes down, there is
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
          Nordisk was Europe&rsquo;s most valuable company, worth around <Won>$604 billion</Won> &mdash; a
          Danish firm briefly larger than the Danish economy. By mid-2026 it was worth about{" "}
          <Sq>$197 billion</Sq>: a <Sq>fall of roughly two-thirds</Sq>, half of it in 2025 alone. In the
          same window its American rival Eli Lilly climbed past it to become the first healthcare company
          ever worth <Lev>$1 trillion</Lev>, in November 2025 &mdash; now roughly <Lev>five times</Lev>
          Novo&rsquo;s size. The proximate trigger was a single disappointing clinical trial (Novo&rsquo;s
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
          carried by a single company: <Sq>Mistral</Sq>, valued around <Sq>&euro;14 billion</Sq>. It is a
          genuinely good lab. It is also a fraction &mdash; a small fraction &mdash; of the American
          frontier labs it is meant to rival, which raise at valuations well into the hundreds of billions.
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
          Notice what this chapter is <em>not</em> saying. It is not saying these companies are failures
          &mdash; they are triumphs of European science and nerve. It is not even saying foreign capital is
          malign; SoftBank&rsquo;s money built Wayve, and Wayve is better for it. It is saying that a
          continent which produces this many jewels and retains ownership of so few has a capture problem,
          not a creation problem &mdash; and that &ldquo;but look at the bright spots&rdquo; is, on
          inspection, the strongest evidence for the prosecution, not the defence. The crop is magnificent.
          The lease is the issue.
        </P>

        <P>
          Run the roll-call and the pattern is total. <Sq>Spotify</Sq>, Sweden&rsquo;s streaming champion,
          is incorporated in Luxembourg, listed in New York, and counts China&rsquo;s Tencent among its
          shareholders. <Sq>Supercell</Sq>, the Finnish studio behind Clash of Clans, was bought by Tencent
          for some ten billion dollars. <Sq>Mojang</Sq>, the Swedish maker of Minecraft, went to Microsoft
          for $2.5 billion; <Sq>Skype</Sq>, the Estonian miracle that taught the world to make free calls,
          was bought by Microsoft for $8.5 billion and then, in December 2025, simply switched off and
          folded into Teams &mdash; a European household name discontinued by an American product manager,
          with no European in a position to object. And <Sq>DeepMind</Sq>, London&rsquo;s crown jewel of
          artificial intelligence, has been a division of Google for over a decade; its Nobel-winning
          breakthroughs are Alphabet&rsquo;s property. Every one of these is a genuine European triumph.
          Not one of them is European-owned.
        </P>

        <P>
          Which points at the input underneath all the others, the one Europe is most lavishly endowed
          with and most carelessly exports: not capital, not companies, but people. The next chapter is
          about the talent &mdash; the brains Europe trains at its own expense and then rents out to the
          firms that will use them to buy the rest.
        </P>
      </Prose>

      <Sources
        items={[
          "Prosus, “The State of AI in Europe”: ~73% of lead investors in large European rounds are American; US late-stage funding ~$141bn vs Europe ~$12bn (~9:1), Q1 2026.",
          "Cap-table captures (company filings/announcements): Arm — SoftBank ~87%, Nasdaq; DeepMind — wholly owned by Alphabet/Google; Wayve — $8.6bn (Series D, Feb 2026; SoftBank/Microsoft/Nvidia); Helsing — $18bn round US-led (Dragoneer/Lightspeed, May 2026), ~80% European-owned; Aleph Alpha — absorbed into Cohere (Canada), Apr 2026; Klarna — NYSE (Sept 2025); Wise — Nasdaq primary (May 2026).",
          "Market depth: ASML ~$743bn, SAP, Novo Nordisk, LVMH among Europe's largest; US “Magnificent Seven” combined >$20tn (companiesmarketcap.com, mid-2026).",
          "Novo Nordisk vs Eli Lilly: Novo ~$604bn peak (Jun 2024) → ~$197bn (Jun 2026), ~67% fall (~50% in 2025); Eli Lilly first healthcare company to $1tn (24 Nov 2025), ~$1.01tn mid-2026 (~5× Novo); CagriSema 22.7% vs ~25% target (Feb 2026). CNBC; MacroTrends.",
          "Mistral AI ~€14bn (Series C, 2026) vs US frontier labs valued in the hundreds of billions (Dealroom). [Anthropic valuation contested across sources — to reconcile in the red-team pass.]",
        ]}
      />
    </section>
  )
}
