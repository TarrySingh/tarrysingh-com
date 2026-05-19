import type { Metadata } from "next"
import { verifyBriefToken } from "@/lib/studio/brief-token"
import { getBrief } from "@/lib/studio/daily-brief"
import { BriefForm } from "./BriefForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Tomorrow's Dispatch · brief",
  robots: { index: false, follow: false },
}

interface Props {
  params: Promise<{ date: string }>
  searchParams: Promise<{ token?: string }>
}

/**
 * Token-authed form linked from the evening prompt email.
 *
 * No Basic Auth — the URL itself carries the signed token. Middleware
 * lists `/studio/brief` in STUDIO_API_HMAC_PATHS so the per-route
 * Basic Auth gate is bypassed.
 */
export default async function BriefPage({ params, searchParams }: Props) {
  const { date } = await params
  const { token } = await searchParams

  const approvalSecret = process.env.STUDIO_APPROVAL_SECRET
  if (!approvalSecret) {
    return <BriefShell title="Studio is unconfigured." body="STUDIO_APPROVAL_SECRET isn't set on the Vercel project." />
  }
  if (!token) {
    return <BriefShell title="Missing token." body="This link is incomplete. Re-open it from the original email." />
  }

  const verify = verifyBriefToken(token, approvalSecret)
  if (!verify.ok) {
    const map: Record<string, string> = {
      malformed: "This link looks tampered with.",
      bad_signature: "This link's signature didn't verify.",
      expired: "This link has expired (links are valid for 30 hours).",
    }
    return <BriefShell title="Link not valid." body={map[verify.error]} />
  }
  if (verify.payload.forDate !== date) {
    return <BriefShell title="Link / URL mismatch." body="The date in the link and the URL don't match. Re-open from the email." />
  }

  const row = await getBrief(date)
  if (row && row.decision !== "pending") {
    return (
      <BriefShell
        title={row.decision === "yes" ? "Already filed." : "Already declined."}
        body={
          row.decision === "yes"
            ? "You already submitted a brief for this date. To replace it, just hit the link again and resubmit."
            : "You already declined for this date. The morning rotation will run as scheduled."
        }
      />
    )
  }

  return (
    <BriefShell title={`A brief for ${date}.`} body="">
      <BriefForm forDate={date} token={token} initial={row?.brief ?? ""} />
    </BriefShell>
  )
}

function BriefShell({
  title,
  body,
  children,
}: {
  title: string
  body: string
  children?: React.ReactNode
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fbf7ec 0%, #f5efe1 100%)",
      }}
    >
      <main className="mx-auto max-w-2xl px-5 pt-16 pb-24 sm:px-7">
        <span
          className="text-[10.5px] font-semibold uppercase tracking-[0.32em] text-gold-700"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          Studio · Tomorrow's Dispatch
        </span>
        <h1
          className="mt-4 text-3xl md:text-4xl tracking-tight text-navy-900"
          style={{
            fontFamily: "var(--font-display), 'Gloock', serif",
            lineHeight: 1.12,
          }}
        >
          {title}
        </h1>
        {body ? (
          <p
            className="mt-4 italic leading-relaxed text-navy-600"
            style={{
              fontFamily: "var(--font-serif), 'IBM Plex Serif', serif",
              fontSize: "1.05rem",
            }}
          >
            {body}
          </p>
        ) : null}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  )
}
