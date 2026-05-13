import { NewsletterCard } from "./NewsletterCard"

/**
 * Page-foot wrapper around the wide DISPATCHES newsletter card.
 * Drops into any (main) route as the last section before the
 * global Footer, with a studio-rhythm gutter (max-w-3xl + py-20).
 *
 * Pair with the NewsletterPeek (mounted globally in (main)/layout)
 * — they're additive: the peek catches anyone who scrolled past
 * ~1.2 viewport heights, the static footer catches anyone who
 * reached the actual bottom.
 */
export function NewsletterFooter() {
  return (
    <section className="max-w-3xl mx-auto px-6 lg:px-8 py-16 md:py-20">
      <NewsletterCard variant="wide" />
    </section>
  )
}
