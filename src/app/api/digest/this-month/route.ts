import { NextResponse } from "next/server"
import { getAllPosts } from "@/lib/blog/posts"

export const runtime = "nodejs"
// Force-dynamic because the ?month=YYYY-MM override needs to work at
// request time. Vercel still caches the response at the edge for one
// hour via the Cache-Control header below, so the CRM cron firing
// once a month never thrashes the lambda.
export const dynamic = "force-dynamic"

/**
 * GET /api/digest/this-month.json
 *
 * Returns the JSON digest of Dispatches published in the current
 * calendar month (UTC). Consumed by RealAI-CRM's "Tarrysingh
 * Monthly Roundup" cadence, which fires on the first Monday of
 * every month and rolls up the previous month's pieces.
 *
 * Why this exists in addition to /blog/rss.xml: RSS is a stream
 * of every post ever; the cadence wants exactly the slice for
 * one month, in a shape that maps directly onto the email
 * template (title / excerpt / url / category / date / reading
 * time). Building a JSON contract here keeps the CRM templating
 * step a 30-line affair.
 *
 * Query params:
 *   ?month=YYYY-MM   — override the current month (UAT / dry-run)
 *
 * Response shape:
 *   {
 *     month:           "May 2026",
 *     monthIso:        "2026-05",
 *     publishedFrom:   "2026-05-01T00:00:00.000Z",
 *     publishedTo:     "2026-05-31T23:59:59.999Z",
 *     posts: [
 *       { slug, title, excerpt, url, category, date, readingTimeMinutes },
 *       ...
 *     ]
 *   }
 *
 * Posts are sorted newest first. Maximum 12 posts (any month
 * with more is unusual — the next one rolls over).
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
  month: string
  monthIso: string
  publishedFrom: string
  publishedTo: string
  posts: DigestPost[]
}

function monthBoundsUtc(monthIso: string): { from: Date; to: Date } | null {
  const match = monthIso.match(/^(\d{4})-(\d{2})$/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2]) // 1-12
  if (month < 1 || month > 12) return null
  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
  const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)) // last day
  return { from, to }
}

function currentMonthIso(now = new Date()): string {
  const y = now.getUTCFullYear()
  const m = String(now.getUTCMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

function humanMonth(monthIso: string): string {
  const [y, m] = monthIso.split("-").map(Number)
  const d = new Date(Date.UTC(y, m - 1, 1))
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  })
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const monthParam = url.searchParams.get("month")

  const monthIso = monthParam ?? currentMonthIso()
  const bounds = monthBoundsUtc(monthIso)
  if (!bounds) {
    return NextResponse.json(
      { ok: false, error: "invalid_month_param", expected: "YYYY-MM" },
      { status: 422 },
    )
  }

  const all = await getAllPosts()

  // Filter to the requested month. Post dates are ISO strings
  // (YYYY-MM-DD), so we parse them and compare in UTC.
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
    month: humanMonth(monthIso),
    monthIso,
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
