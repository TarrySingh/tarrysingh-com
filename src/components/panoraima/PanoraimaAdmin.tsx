"use client"

import { useEffect, useState, useCallback } from "react"
import { UserPlus, ShieldCheck, Eye, Ban, Trash2, LoaderCircle, AlertCircle, Send, CheckCircle2 } from "lucide-react"

const RUST = "#B23E22"

type Member = {
  id: string
  email: string
  display_name: string | null
  role: "admin" | "member"
  disabled: boolean
  invited_by: string | null
  created_at: string
  last_login_at: string | null
  invited_at: string | null
  has_password?: boolean
}

function fmt(d: string | null): string {
  if (!d) return "never"
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export default function PanoraimaAdmin({ me }: { me: string }) {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"member" | "admin">("member")
  const [busy, setBusy] = useState(false)
  const [inviting, setInviting] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/panoraima/members")
      const data = await res.json()
      if (data.ok) setMembers(data.members)
      else setError(data.error || "Could not load the member list.")
    } catch {
      setError("Could not load the member list.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function add(e: React.FormEvent) {
    e.preventDefault()
    if (busy || !email.trim()) return
    setBusy(true); setError(null)
    try {
      const res = await fetch("/api/panoraima/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, displayName: name }),
      })
      const data = await res.json()
      if (!data.ok) setError(data.error || "Could not add that member.")
      else { setEmail(""); setName(""); setRole("member"); await load() }
    } finally { setBusy(false) }
  }

  async function invite(id: string, addr: string) {
    setInviting(id); setError(null); setNote(null)
    try {
      const res = await fetch("/api/panoraima/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!data.ok) setError(data.error || "Could not send that invite.")
      else { setNote(`Invite sent to ${addr}.`); await load() }
    } catch {
      setError("Could not send that invite.")
    } finally {
      setInviting(null)
    }
  }

  async function patch(id: string, body: Record<string, unknown>) {
    setError(null)
    const res = await fetch("/api/panoraima/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    })
    const data = await res.json()
    if (!data.ok) setError(data.error || "That change did not apply.")
    await load()
  }

  async function remove(id: string, addr: string) {
    if (!confirm(`Remove ${addr} from the dashboard?`)) return
    setError(null)
    const res = await fetch(`/api/panoraima/members?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    const data = await res.json()
    if (!data.ok) setError(data.error || "Could not remove that member.")
    await load()
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <header className="mb-7">
        <h1 className="text-[22px] font-bold text-[#16181D]">Dashboard access</h1>
        <p className="mt-1 text-[13px] text-[#5B616B]">
          Signed in as {me}. Members can view everything; admins can also manage
          this list and generate update reports.
        </p>
      </header>

      <form
        onSubmit={add}
        className="mb-7 rounded-xl border border-[#DCDDE1] bg-white p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <UserPlus className="h-4 w-4" style={{ color: RUST }} />
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#5B616B]">
            Invite someone
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-[1.4fr_1fr_auto]">
          <input
            type="email" required placeholder="name@partner.eu" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-[#DCDDE1] px-3 py-2 text-[14px] outline-none focus:border-[#16181D]/45"
          />
          <input
            type="text" placeholder="Name (optional)" value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-[#DCDDE1] px-3 py-2 text-[14px] outline-none focus:border-[#16181D]/45"
          />
          <div className="flex gap-2">
            <select
              value={role} onChange={(e) => setRole(e.target.value as "member" | "admin")}
              className="rounded-lg border border-[#DCDDE1] px-2.5 py-2 text-[14px] outline-none"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit" disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[14px] font-bold text-white disabled:opacity-60"
              style={{ background: RUST }}
            >
              {busy && <LoaderCircle className="h-3.5 w-3.5 animate-spin" />}
              Add
            </button>
          </div>
        </div>
        <p className="mt-2.5 text-[12px] text-[#767C87]">
          Adding someone does not email them. They appear below, and you send
          the invite when you are ready.
        </p>
      </form>

      {error && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-[#F0CFC6] bg-[#FBEAE5] px-3 py-2.5 text-[13px] text-[#7A2A16]">
          <AlertCircle className="mt-[1px] h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {note && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-[#CFE3D4] bg-[#EDF6EF] px-3 py-2.5 text-[13px] text-[#1F6B41]">
          <CheckCircle2 className="mt-[1px] h-3.5 w-3.5 flex-shrink-0" />
          <span>{note}</span>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#DCDDE1] bg-white">
        {loading ? (
          <p className="p-5 text-center text-[13px] text-[#5B616B]">Loading…</p>
        ) : members.length === 0 ? (
          <p className="p-5 text-center text-[13px] text-[#5B616B]">
            Nobody has been invited yet.
          </p>
        ) : (
          <ul className="divide-y divide-[#EDEDEF]">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`truncate text-[14px] font-semibold ${m.disabled ? "text-[#9CA3AF] line-through" : "text-[#16181D]"}`}>
                      {m.display_name || m.email}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em]"
                      style={
                        m.role === "admin"
                          ? { background: "#FBEAE5", color: RUST }
                          : { background: "#EEF0F3", color: "#5B616B" }
                      }
                    >
                      {m.role === "admin" ? <ShieldCheck className="h-2.5 w-2.5" /> : <Eye className="h-2.5 w-2.5" />}
                      {m.role}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-[#767C87]">
                    {m.display_name ? m.email + " · " : ""}
                    {m.last_login_at
                      ? `signed in ${fmt(m.last_login_at)}`
                      : m.invited_at
                        ? `invited ${fmt(m.invited_at)}, not signed in yet`
                        : "not invited yet"}
                    {m.has_password ? " · password set" : ""}
                  </p>
                </div>
                <div className="flex flex-shrink-0 gap-1.5">
                  <button
                    onClick={() => invite(m.id, m.email)}
                    disabled={inviting === m.id || m.disabled}
                    className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] disabled:opacity-50"
                    style={
                      m.invited_at
                        ? { borderColor: "#DCDDE1", color: "#5B616B" }
                        : { borderColor: RUST, color: RUST, background: "#FBEAE5" }
                    }
                    title={
                      m.disabled
                        ? "Re-enable the account before inviting"
                        : m.invited_at
                          ? "Send another sign-in link"
                          : "Email this person a sign-in link"
                    }
                  >
                    {inviting === m.id ? (
                      <LoaderCircle className="h-2.5 w-2.5 animate-spin" />
                    ) : (
                      <Send className="h-2.5 w-2.5" />
                    )}
                    {m.invited_at ? "Resend" : "Send invite"}
                  </button>
                  <button
                    onClick={() => patch(m.id, { role: m.role === "admin" ? "member" : "admin" })}
                    className="rounded-md border border-[#DCDDE1] px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-[#5B616B] hover:border-[#16181D]/40 hover:text-[#16181D]"
                    title={m.role === "admin" ? "Make view-only" : "Make admin"}
                  >
                    {m.role === "admin" ? "Make member" : "Make admin"}
                  </button>
                  <button
                    onClick={() => patch(m.id, { disabled: !m.disabled })}
                    className="rounded-md border border-[#DCDDE1] px-2 py-1 text-[#5B616B] hover:border-[#16181D]/40 hover:text-[#16181D]"
                    title={m.disabled ? "Re-enable" : "Suspend"}
                  >
                    <Ban className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => remove(m.id, m.email)}
                    className="rounded-md border border-[#DCDDE1] px-2 py-1 text-[#5B616B] hover:border-[#B23E22]/50 hover:text-[#B23E22]"
                    title="Remove"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
