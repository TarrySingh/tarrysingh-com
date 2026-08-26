"use client"

import { usePathname } from "next/navigation"
import { LogOut, Users } from "lucide-react"
import {
  PANORAIMA_LOGIN_PATH,
  PANORAIMA_LOGOUT_PATH,
} from "@/lib/panoraima/authConstants"

/**
 * Session controls shown on every dashboard page: who you are, a link to
 * member management for admins, and sign out. Hidden on the login page.
 */
export default function PanoraimaSessionBar({
  role,
  email,
}: {
  role: "admin" | "member"
  email: string
}) {
  const pathname = usePathname()
  if (pathname === PANORAIMA_LOGIN_PATH) return null

  const who = email && email !== "shared" ? email : "shared login"

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-40 flex items-center gap-1.5 print:hidden">
      <span className="pointer-events-auto hidden rounded-lg border border-[#DCDDE1] bg-white/95 px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#767C87] shadow-sm backdrop-blur sm:inline-flex">
        {who}
        {role === "member" && (
          <span className="ml-1.5 text-[#9CA3AF]">· view only</span>
        )}
      </span>

      {role === "admin" && (
        <a
          href="/experiments/panoraima/admin"
          className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-[#DCDDE1] bg-white/95 px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#5B616B] shadow-sm backdrop-blur transition-colors hover:border-[#16181D]/40 hover:text-[#16181D]"
          title="Manage who can access the dashboard"
        >
          <Users className="h-3 w-3" />
          Access
        </a>
      )}

      <a
        href={PANORAIMA_LOGOUT_PATH}
        className="pointer-events-auto inline-flex items-center gap-1.5 rounded-lg border border-[#DCDDE1] bg-white/95 px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-[#5B616B] shadow-sm backdrop-blur transition-colors hover:border-[#16181D]/40 hover:text-[#16181D]"
        title="Sign out of the PANORAIMA dashboard"
      >
        <LogOut className="h-3 w-3" />
        Sign out
      </a>
    </div>
  )
}
