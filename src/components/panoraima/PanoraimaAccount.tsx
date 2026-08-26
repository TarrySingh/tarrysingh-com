"use client"

import { useEffect, useState } from "react"
import { KeyRound, LoaderCircle, AlertCircle, CheckCircle2, ShieldCheck, Eye } from "lucide-react"

const RUST = "#B23E22"
const MIN_LENGTH = 10

/**
 * Lets a signed-in member set or change their own password, so signing in no
 * longer depends on requesting a link each time. Members who arrived by magic
 * link and have no password yet are not asked for a current one.
 */
export default function PanoraimaAccount() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "member">("member")
  const [hasPassword, setHasPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/panoraima/account/password")
        const data = await res.json()
        if (data.ok) {
          setEmail(data.email)
          setRole(data.role)
          setHasPassword(data.hasPassword)
        } else {
          setError(data.error || "Could not load your account.")
        }
      } catch {
        setError("Could not load your account.")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    setDone(null)
    try {
      const res = await fetch("/api/panoraima/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, password, confirm }),
      })
      const data = await res.json()
      if (!data.ok) {
        setError(data.error || "Could not save that password.")
      } else {
        setDone(
          data.hadPassword
            ? "Your password has been changed."
            : "Your password is set. You can now sign in with your email and password.",
        )
        setHasPassword(true)
        setCurrent(""); setPassword(""); setConfirm("")
      }
    } catch {
      setError("Could not reach the server. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  const field =
    "w-full rounded-lg border border-[#DCDDE1] bg-white px-3 py-2.5 text-[14px] text-[#16181D] outline-none transition-colors focus:border-[#16181D]/45"
  const label =
    "mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#5B616B]"

  return (
    <main className="mx-auto max-w-[460px] px-5 py-12">
      <header className="mb-6">
        <h1 className="text-[22px] font-bold text-[#16181D]">Your account</h1>
        {!loading && email && (
          <p className="mt-1 flex items-center gap-2 text-[13px] text-[#5B616B]">
            {email}
            <span
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em]"
              style={
                role === "admin"
                  ? { background: "#FBEAE5", color: RUST }
                  : { background: "#EEF0F3", color: "#5B616B" }
              }
            >
              {role === "admin" ? <ShieldCheck className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
              {role}
            </span>
          </p>
        )}
      </header>

      <div className="rounded-xl border border-[#DCDDE1] bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <KeyRound className="h-4 w-4" style={{ color: RUST }} />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#5B616B]">
            {hasPassword ? "Change your password" : "Set a password"}
          </span>
        </div>

        <p className="mb-4 text-[13px] leading-relaxed text-[#444A55]">
          {hasPassword
            ? "You can sign in with your email and password, or request a sign-in link at any time."
            : "You signed in with a link. Setting a password means you can sign in directly next time, without waiting for an email."}
        </p>

        {loading ? (
          <p className="text-[13px] text-[#5B616B]">Loading…</p>
        ) : (
          <form onSubmit={submit} className="space-y-3.5" noValidate>
            {hasPassword && (
              <div>
                <label htmlFor="pw-current" className={label}>Current password</label>
                <input
                  id="pw-current" type="password" autoComplete="current-password" required
                  value={current} onChange={(e) => setCurrent(e.target.value)} className={field}
                />
              </div>
            )}

            <div>
              <label htmlFor="pw-new" className={label}>New password</label>
              <input
                id="pw-new" type="password" autoComplete="new-password" required minLength={MIN_LENGTH}
                value={password} onChange={(e) => setPassword(e.target.value)} className={field}
              />
              <p className="mt-1.5 text-[12px] text-[#767C87]">
                At least {MIN_LENGTH} characters.
              </p>
            </div>

            <div>
              <label htmlFor="pw-confirm" className={label}>Repeat new password</label>
              <input
                id="pw-confirm" type="password" autoComplete="new-password" required
                value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field}
              />
            </div>

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-[#F0CFC6] bg-[#FBEAE5] px-3 py-2.5 text-[13px] leading-snug text-[#7A2A16]">
                <AlertCircle className="mt-[1px] h-3.5 w-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {done && (
              <div className="flex items-start gap-2 rounded-lg border border-[#CFE3D4] bg-[#EDF6EF] px-3 py-2.5 text-[13px] leading-snug text-[#1F6B41]">
                <CheckCircle2 className="mt-[1px] h-3.5 w-3.5 flex-shrink-0" />
                <span>{done}</span>
              </div>
            )}

            <button
              type="submit" disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
              style={{ background: RUST }}
            >
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {hasPassword ? "Change password" : "Set password"}
            </button>
          </form>
        )}
      </div>

      <p className="mt-4 text-center text-[12px] text-[#767C87]">
        <a href="/experiments/panoraima" className="underline underline-offset-2 hover:text-[#16181D]">
          Back to the dashboard
        </a>
      </p>
    </main>
  )
}
