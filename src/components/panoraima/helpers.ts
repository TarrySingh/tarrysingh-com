import type { PartnerCode, TimelineEvent } from "@/lib/panoraima/types"
import { PARTNERS } from "@/lib/panoraima/types"

export function eventsWithReports(events: TimelineEvent[]): TimelineEvent[] {
  return events.filter(e => e.has_progress_reports)
}

export function submissionRate(event: TimelineEvent): number {
  if (!event.has_progress_reports) return 0
  const submitted = PARTNERS.reduce((acc, p) => {
    return acc + (event.partners[p.code]?.submitted ? 1 : 0)
  }, 0)
  return submitted / PARTNERS.length
}

export function partnerSubmissionCount(events: TimelineEvent[], code: PartnerCode): number {
  return events.filter(e => e.partners[code]?.submitted).length
}

export function partnerTotalEligibleEvents(events: TimelineEvent[]): number {
  return events.filter(e => e.has_progress_reports).length
}

export function allWpFocus(events: TimelineEvent[], code: PartnerCode): string[] {
  const set = new Set<string>()
  events.forEach(e => {
    const p = e.partners[code]
    if (p?.submitted && p.wp_focus) p.wp_focus.forEach(w => set.add(w))
  })
  return Array.from(set).sort()
}

export function wpActivityByEvent(events: TimelineEvent[]) {
  // For each event, returns count of partners mentioning each WP
  return events.map(event => {
    const wpCounts: Record<string, number> = {
      WP1: 0, WP2: 0, WP3: 0, WP4: 0, WP5: 0, WP6: 0, WP7: 0,
    }
    Object.values(event.partners).forEach(p => {
      if (p.submitted && p.wp_focus) {
        p.wp_focus.forEach(w => {
          if (w in wpCounts) wpCounts[w]++
        })
      }
    })
    return { event: event.id, label: event.label, ...wpCounts }
  })
}

export function challengeCount(events: TimelineEvent[]): number {
  let n = 0
  events.forEach(e => {
    Object.values(e.partners).forEach(p => {
      if (p.submitted && p.challenges) n += p.challenges.length
    })
  })
  return n
}

export function totalSubmissions(events: TimelineEvent[]): number {
  let n = 0
  events.forEach(e => {
    Object.values(e.partners).forEach(p => {
      if (p.submitted) n++
    })
  })
  return n
}

/** Maps lat/lng to a 640×520 viewport suitable for an Europe SVG. */
export function projectEurope(lat: number, lng: number, w = 640, h = 520) {
  // Simple equirectangular projection tuned for Europe
  const minLng = -12
  const maxLng = 40
  const minLat = 35
  const maxLat = 62
  const x = ((lng - minLng) / (maxLng - minLng)) * w
  const y = h - ((lat - minLat) / (maxLat - minLat)) * h
  return { x, y }
}

/** Formats a date like "2025-08-22" -> "Aug 22, 2025".
 *  Strict: only accepts YYYY-MM-DD / YYYY-MM prefixes. Returns "" otherwise
 *  so callers can show a placeholder like "Date TBD". This guards against
 *  ids like "review-1" being accidentally parsed as year 2001 by V8's
 *  legacy two-digit-year behaviour. */
export function formatDate(iso: string): string {
  if (!iso) return ""
  if (!/^\d{4}-\d{2}(-\d{2})?/.test(iso)) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export function sortByDate(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => {
    const ad = a.date || a.id
    const bd = b.date || b.id
    return ad.localeCompare(bd)
  })
}
