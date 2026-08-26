"use client"

import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { PANORAIMA_LOGIN_PATH, PANORAIMA_LOGOUT_PATH } from "@/lib/panoraima/authConstants"

/**
 * Small sign-out affordance shown on every dashboard page. Hidden on the
 * login page itself, and hidden for Basic Auth visitors is not possible from
 * the client, so it is always offered: signing out simply clears the session
 * cookie and returns to the login form.
 */
export default function PanoraimaSessionBar() {
  const pathname = usePathname()
  if (pathname === PANORAIMA_LOGIN_PATH) return null

  return (
    <div className="pointer-events-none fixed bottom-3 right-3 z-40 print:hidden">
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
