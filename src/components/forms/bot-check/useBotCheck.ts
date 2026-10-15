"use client"

/**
 * useBotCheck - collects the three anti-bot signals for a signup form.
 *
 * The site does not judge them. A widget alone cannot stop a direct
 * POST, so the realai-crm receiver (/api/webhooks/tarrysingh) verifies
 * them; this hook only gathers them and hands back the `context.botCheck`
 * envelope that /api/newsletter/subscribe forwards:
 *   - hp              the honeypot value (HoneypotField). '' for a person.
 *   - elapsedMs       ms between the form first appearing and the submit.
 *                     People take more than 2s; an instant POST is a bot.
 *                     A form that appears late (a scroll-triggered peek
 *                     or nudge) passes `active` so the timer measures
 *                     time on the form, not time on the page.
 *   - turnstileToken  the Cloudflare Turnstile token (TurnstileWidget), or
 *                     '' when the widget is off, blocked or still working.
 *
 * Submitting is never blocked. If the widget is still producing a token
 * at submit time, getBotCheck() waits up to TOKEN_WAIT_MS for it and then
 * sends whatever it has. A Turnstile token is single-use, so call rearm()
 * after a failed submit to fetch a fresh one for the retry.
 *
 * Ported from the earthscan.io bot-check layer.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { LeadBotCheck } from "@/lib/crm/types"

export type BotCheck = LeadBotCheck

/** Turnstile as the hook sees it: off (no widget), working, done, or broken. */
export type TurnstileStatus = "off" | "pending" | "ready" | "failed"

/** How long a submit waits for a token the widget is still producing. */
const TOKEN_WAIT_MS = 3000

/** Spread onto <TurnstileWidget />. */
export interface TurnstileBinding {
  onToken: (token: string) => void
  onStatus: (status: TurnstileStatus) => void
  /** Bumped by rearm(); the widget resets itself when it changes. */
  resetKey: number
}

export interface UseBotCheck {
  hp: string
  setHp: (value: string) => void
  turnstile: TurnstileBinding
  /** Snapshot the signals at submit time. Never rejects. */
  getBotCheck: () => Promise<BotCheck>
  /** After a failed submit: drop the used token and ask for a new one. */
  rearm: () => void
}

export interface UseBotCheckOptions {
  /**
   * Whether the form is on screen. The timer starts the first time this
   * is true. Defaults to true: the form shows when the host mounts.
   */
  active?: boolean
}

export function useBotCheck({
  active = true,
}: UseBotCheckOptions = {}): UseBotCheck {
  const shownAt = useRef(0)
  const [hp, setHp] = useState("")
  const token = useRef("")
  const status = useRef<TurnstileStatus>("off")
  const waiters = useRef(new Set<() => void>())
  const [resetKey, setResetKey] = useState(0)

  // The timer starts the first time the form is shown on the client and
  // is never restarted, so hiding and re-showing the form (TarryPeekABoo's
  // bubble on hover) keeps the original stamp.
  useEffect(() => {
    if (active && !shownAt.current) shownAt.current = Date.now()
  }, [active])

  const wake = useCallback(() => {
    for (const done of Array.from(waiters.current)) done()
  }, [])

  const onToken = useCallback(
    (value: string) => {
      token.current = value
      if (value) {
        status.current = "ready"
        wake()
      }
    },
    [wake],
  )

  const onStatus = useCallback(
    (next: TurnstileStatus) => {
      status.current = next
      if (next !== "pending") wake()
    },
    [wake],
  )

  const getBotCheck = useCallback(async (): Promise<BotCheck> => {
    const elapsedMs = shownAt.current ? Date.now() - shownAt.current : 0
    if (!token.current && status.current === "pending") {
      await new Promise<void>((resolve) => {
        const done = () => {
          window.clearTimeout(timer)
          waiters.current.delete(done)
          resolve()
        }
        const timer = window.setTimeout(done, TOKEN_WAIT_MS)
        waiters.current.add(done)
      })
    }
    return { turnstileToken: token.current, hp, elapsedMs }
  }, [hp])

  const rearm = useCallback(() => {
    token.current = ""
    if (status.current === "ready") status.current = "pending"
    setResetKey((k) => k + 1)
  }, [])

  const turnstile = useMemo(
    () => ({ onToken, onStatus, resetKey }),
    [onToken, onStatus, resetKey],
  )

  return { hp, setHp, turnstile, getBotCheck, rearm }
}
