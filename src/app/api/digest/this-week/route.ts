import { NextResponse } from "next/server"
import { getAllPosts } from "@/lib/blog/posts"

export const runtime = "nodejs"
// Force-dynamic because the ?week=YYYY-Www override needs to work at request
// time. Vercel still caches the response at the edge for one hour via the
// Cache-Control header below, so the CRM cron firing once a week never
// thrashes the lambda.
export const dynamic = "force-dynamic"

/**
 * GET /api/digest/this-week.json
 *
 * Returns the JSON digest of Dispatches published in the current week
 * (ISO week, UTC). Consumed by RealAI-CRM's "Tarrysingh Weekly Dispatches"
 * cadence — Sprint 6.5 — which fires every Sunday at 09:00 UTC and rolls
 * up the past 7 days of pieces.
 *
 * Mirrors /api/digest/this-month.json verbatim except for the week-bound
 * calculation; the post shape is identical so the realai-crm renderer is
 * symmetric across both endpoints.
 *
 * Query params:
 *   ?week=YYYY-Www   — override the current ISO week (UAT / dry-run).
 *                       e.g. ?week=2026-W20
 *
 * Response shape:
 *   {
 *     week:            "Week 20, 2026 · 11 May – 17 May",
 *     weekIso:         "2026-W20",
 *     publishedFrom:   "2026-05-11T00:00:00.000Z",
 *     publishedTo:     "2026-05-17T23:59:59.999Z",
 *     posts: [
 *       { slug, title, excerpt, url, category, date, readingTimeMinutes },
 *       ...
 *     ]
 *   }
 *
 * Posts are sorted newest first. Maximum 12 posts per week (anyone shipping
 * more than that needs a different cadence).
 *
 * Empty week is NOT a 4xx — returns `posts: []` so the CRM cron can render
 * the "Quiet week in the studio — back next Sunday." fallback copy.
 */

const SITE = "https://tarrysingh.com"
const MAX_POSTS = 12

interface DigestPost {
  slug: string
  title: string
  excerpt: string
  url: string
  category: string
  date: string
  readingTimeMinutes: number
}

interface DigestResponse {
  week: string
  weekIso: string
  publishedFrom: string
  publishedTo: string
  posts: DigestPost[]
}

/**
 * ISO week bounds (Monday 00:00 UTC → Sunday 23:59:59.999 UTC).
 * ISO 8601 week starts on Monday; week 1 of a year is the week containing
 * its first Thursday.
 */
function weekBoundsUtc(weekIso: string): { from: Date; to: Date } | null {
  const match = weekIso.match(/^(\d{4})-W(\d{2})$/)
  if (!match) return null
  const year = Number(match[1])
  const week = Number(match[2])
  if (week < 1 || week > 53) return null

  // Algorithm: 4 January is always in week 1; find the Monday of week 1, then
  // add (week - 1) weeks. Source: ISO 8601 + the canonical "ISO week date"
  // pseudocode (Wikipedia / RFC 3339 § 5.4 commentary).
  const jan4 = new Date(Date.UTC(year, 0, 4, 0, 0, 0, 0))
  const jan4Dow = jan4.getUTCDay() || 7 // Sun=0 → 7
  const week1Monday = new Date(jan4)
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Dow - 1))

  const from = new Date(week1Monday)
  from.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7)
  const to = new Date(from)
  to.setUTCDate(from.getUTCDate() + 7)
  to.setUTCMilliseconds(to.getUTCMilliseconds() - 1) // end at Sunday 23:59:59.999

  return { from, to }
}

function currentWeekIso(now = new Date()): string {
  // ISO week of `now`. Same algorithm: shift to nearest Thursday, take the
  // year of that Thursday, count weeks from Jan 4 of that year.
  const target = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()
  ))
  const dayNum = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - dayNum) // shift to Thursday
  const isoYear = target.getUTCFullYear()
  const yearStart = new Date(Date.UTC(isoYear, 0, 1))
  const weekNum = Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
  return `${isoYear}-W${String(weekNum).padStart(2, "0")}`
}

function humanWeek(weekIso: string, from: Date, to: Date): string {
  const week = weekIso.split("-W")[1]
  const year = weekIso.split("-W")[0]
  const fmt = (d: Date) => d.toLocaleDateString("en-GB", {
    day: "numeric", month: "short", timeZone: "UTC",
  })
  return `Week ${week}, ${year} · ${fmt(from)} – ${fmt(to)}`
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const weekParam = url.searchParams.get("week")

  const weekIso = weekParam ?? currentWeekIso()
  const bounds = weekBoundsUtc(weekIso)
  if (!bounds) {
    return NextResponse.json(
      { ok: false, error: "invalid_week_param", expected: "YYYY-Www" },
      { status: 422 },
    )
  }

  const all = await getAllPosts()

  // Filter to the requested week. Post dates are ISO strings (YYYY-MM-DD), so
  // we parse them and compare in UTC.
  const posts: DigestPost[] = all
    .filter((p) => {
      const d = new Date(`${p.date}T00:00:00Z`)
      return d >= bounds.from && d <= bounds.to
    })
    .slice(0, MAX_POSTS)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      url: `${SITE}/blog/${p.slug}`,
      category: p.category,
      date: p.date,
      readingTimeMinutes: p.readingTimeMinutes,
    }))

  const response: DigestResponse = {
    week: humanWeek(weekIso, bounds.from, bounds.to),
    weekIso,
    publishedFrom: bounds.from.toISOString(),
    publishedTo: bounds.to.toISOString(),
    posts,
  }

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
