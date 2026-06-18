import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

/**
 * Weekly reminder to run the assisted PANORAIMA wiki pull.
 *
 * The wiki (hcaim.bme.hu) is BME-network-gated and blocks anonymous API
 * reads, so the Master-List re-pull is done assisted (Tarry on VPN +
 * Claude-in-Chrome) rather than headless. This nudge keeps it weekly so we
 * catch new RealAI LE assignments / role changes.
 *
 * Auth: Vercel `Authorization: Bearer ${CRON_SECRET}`. `?test=1` to fire now.
 */

const FROM = "PANORAIMA WP4 · Monitor <studio@tarrysingh.com>"
const TO = "tarry.singh@realai.eu"
const DASHBOARD = "https://www.tarrysingh.com/experiments/panoraima/wps/wp4"

export async function GET(req: NextRequest) {
  const authed = req.headers.get("authorization") === `Bearer ${process.env.CRON_SECRET}`
  const test = new URL(req.url).searchParams.get("test") === "1"
  if (!authed && !test) return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 })
  const resend = new Resend(key)

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;color:#16181D">
    <p style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#C0492B;font-weight:700;font-family:ui-monospace,monospace">PANORAIMA · WP4 weekly</p>
    <h2 style="margin:4px 0 8px;font-weight:700">Time for the weekly wiki pull</h2>
    <p style="color:#4F535B;line-height:1.6">
      The Learning Event Master List on <strong>hcaim.bme.hu</strong> may have changed —
      new LEs assigned to RealAI, or role changes (author ↔ reviewer). Because the wiki
      is BME-network-gated, this is a quick assisted pull:
    </p>
    <ol style="color:#4F535B;line-height:1.7;font-size:14px">
      <li>Connect to the <strong>BME VPN</strong> and open the wiki (logged in).</li>
      <li>Ask Claude to run the assisted wiki pull → it refreshes the registry + redeploys.</li>
      <li>Takes ~2 minutes; the WP4 tool then reflects any new RealAI commitments.</li>
    </ol>
    <p><a href="${DASHBOARD}" style="display:inline-block;background:#16181D;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">Open the WP4 tool →</a></p>
    <p style="color:#9CA3AF;font-size:12px;margin-top:16px">If nothing has changed on the wiki, the pull is a no-op — safe to run anytime.</p>
  </div>`

  const r = await resend.emails.send({
    from: FROM, to: [TO],
    subject: "PANORAIMA WP4 — weekly wiki pull reminder",
    html,
  })
  return NextResponse.json({ sent: r.error ? `error:${r.error.message}` : "sent", to: TO })
}
