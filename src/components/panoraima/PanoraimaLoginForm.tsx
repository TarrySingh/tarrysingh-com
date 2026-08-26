"use client"

import { useState } from "react"
import { Lock, LoaderCircle, AlertCircle } from "lucide-react"

const RUST = "#B23E22"

/**
 * Login form for the consortium dashboard. Posts to /api/panoraima/login,
 * which sets the signed session cookie, then sends the visitor on to
 * wherever they were originally headed.
 */
export default function PanoraimaLoginForm({ next }: { next: string }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/panoraima/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        window.location.replace(next)
        return
      }
      setError(data.error || "That username and password did not match.")
      setPassword("")
    } catch {
      setError("Could not reach the server. Please try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-[#F7F7F6] px-4 py-12">
      <div className="w-full max-w-[400px]">
        <div className="rounded-xl border border-[#DCDDE1] bg-white p-7 shadow-[0_10px_40px_rgba(20,22,27,0.08)]">
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ background: "#FBEAE5" }}
              aria-hidden
            >
              <Lock className="h-4 w-4" style={{ color: RUST }} />
            </span>
            <div className="min-w-0">
              <h1 className="text-[17px] font-bold leading-tight text-[#16181D]">
                PANORAIMA
              </h1>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5B616B]">
                Consortium dashboard
              </p>
            </div>
          </div>

          <p className="mt-4 text-[13px] leading-relaxed text-[#444A55]">
            This dashboard is private to the PANORAIMA consortium. Please sign in
            with the credentials you were given.
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3.5" noValidate>
            <div>
              <label
                htmlFor="panoraima-username"
                className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#5B616B]"
              >
                Username
              </label>
              <input
                id="panoraima-username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-[#DCDDE1] bg-white px-3 py-2.5 text-[14px] text-[#16181D] outline-none transition-colors focus:border-[#16181D]/45"
              />
            </div>

            <div>
              <label
                htmlFor="panoraima-password"
                className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#5B616B]"
              >
                Password
              </label>
              <input
                id="panoraima-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#DCDDE1] bg-white px-3 py-2.5 text-[14px] text-[#16181D] outline-none transition-colors focus:border-[#16181D]/45"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-[#F0CFC6] bg-[#FBEAE5] px-3 py-2.5 text-[13px] leading-snug text-[#7A2A16]"
              >
                <AlertCircle className="mt-[1px] h-3.5 w-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-bold text-white transition-opacity disabled:opacity-60"
              style={{ background: RUST }}
            >
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {busy ? "Signing in" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[12px] leading-relaxed text-[#767C87]">
          Trouble signing in? Contact the project coordinator.
        </p>
      </div>
    </main>
  )
}
