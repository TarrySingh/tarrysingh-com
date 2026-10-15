"use client"

/**
 * <TurnstileWidget /> - Cloudflare Turnstile in interaction-only mode.
 *
 * Renders NOTHING and loads no script unless NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * is set, so the layer ships dark and lights up once the widget is
 * provisioned (dash.cloudflare.com, Turnstile, hostnames tarrysingh.com,
 * www.tarrysingh.com, localhost). The secret key lives only in the
 * realai-crm receiver, which verifies the token.
 *
 * `appearance: interaction-only` keeps it invisible for almost everyone
 * and only shows a challenge when Cloudflare asks for one; the container
 * gets a little top margin only while that challenge is on screen, so
 * the form looks exactly as before otherwise. The token reaches the form
 * through the useBotCheck binding (spread `bot.turnstile` onto this), not
 * through a hidden input.
 *
 * If the script is blocked or fails, the widget reports "failed" and the
 * form submits with turnstileToken '' and lets the CRM decide. The API
 * script is loaded once per page and shared by every widget on it.
 */

import { useEffect, useRef, useState } from "react"
import type { TurnstileBinding } from "./useBotCheck"

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

interface TurnstileRenderOptions {
  sitekey: string
  callback: (token: string) => void
  "error-callback"?: () => void
  "expired-callback"?: () => void
  "timeout-callback"?: () => void
  "unsupported-callback"?: () => void
  "before-interactive-callback"?: () => void
  "after-interactive-callback"?: () => void
  appearance?: "always" | "execute" | "interaction-only"
  theme?: "auto" | "light" | "dark"
  size?: "normal" | "flexible" | "compact"
  "response-field"?: boolean
}

interface TurnstileApi {
  render: (el: HTMLElement, opts: TurnstileRenderOptions) => string | undefined
  reset: (id?: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

type OnLoaded = (ok: boolean) => void

let scriptLoading = false
const waiting: OnLoaded[] = []

function settle(ok: boolean) {
  scriptLoading = false
  for (const cb of waiting.splice(0)) cb(ok)
}

/** Load the API once per page; `cb(true)` once `window.turnstile` exists. */
function loadTurnstile(cb: OnLoaded): void {
  if (window.turnstile) {
    cb(true)
    return
  }
  waiting.push(cb)
  if (scriptLoading) return
  scriptLoading = true
  const s = document.createElement("script")
  s.src = SCRIPT_SRC
  s.async = true
  s.onload = () => settle(Boolean(window.turnstile))
  s.onerror = () => {
    // Blocked or offline. Drop the tag so a later mount can try again.
    s.remove()
    settle(false)
  }
  document.head.appendChild(s)
}

export interface TurnstileWidgetProps extends TurnstileBinding {
  /** Match the surface: light cards, dark Synaptic plates. */
  theme?: "auto" | "light" | "dark"
  /** "compact" (150px wide) for containers narrower than 300px. */
  size?: "normal" | "flexible" | "compact"
  className?: string
}

export function TurnstileWidget({
  onToken,
  onStatus,
  resetKey,
  theme = "auto",
  size = "normal",
  className,
}: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const hostRef = useRef<HTMLDivElement | null>(null)
  const widgetId = useRef<string | null>(null)
  const [interactive, setInteractive] = useState(false)
  // Latest handlers, read at call time so the render effect never re-runs on them.
  const handlers = useRef({ onToken, onStatus })
  useEffect(() => {
    handlers.current = { onToken, onStatus }
  }, [onToken, onStatus])

  useEffect(() => {
    const host = hostRef.current
    if (!siteKey || !host) return
    let cancelled = false
    handlers.current.onStatus("pending")

    loadTurnstile((ok) => {
      if (cancelled) return
      const api = window.turnstile
      if (!ok || !api) {
        handlers.current.onStatus("failed")
        return
      }
      try {
        widgetId.current =
          api.render(host, {
            sitekey: siteKey,
            appearance: "interaction-only",
            theme,
            size,
            "response-field": false,
            callback: (token) => handlers.current.onToken(token),
            "expired-callback": () => {
              // Refreshes itself (refresh-expired defaults to auto).
              handlers.current.onToken("")
              handlers.current.onStatus("pending")
            },
            "error-callback": () => {
              handlers.current.onToken("")
              handlers.current.onStatus("failed")
            },
            "timeout-callback": () => {
              handlers.current.onToken("")
              handlers.current.onStatus("failed")
            },
            "unsupported-callback": () => handlers.current.onStatus("failed"),
            "before-interactive-callback": () => setInteractive(true),
            "after-interactive-callback": () => setInteractive(false),
          }) ?? null
      } catch {
        handlers.current.onStatus("failed")
      }
    })

    return () => {
      cancelled = true
      const id = widgetId.current
      widgetId.current = null
      if (id && window.turnstile) {
        try {
          window.turnstile.remove(id)
        } catch {
          // Already gone.
        }
      }
      // A token already issued stays valid; nothing left to wait for.
      handlers.current.onStatus("off")
    }
  }, [siteKey, theme, size])

  // rearm(): ask the live widget for a fresh single-use token.
  useEffect(() => {
    if (resetKey === 0) return
    const id = widgetId.current
    if (id && window.turnstile) {
      try {
        window.turnstile.reset(id)
      } catch {
        handlers.current.onStatus("failed")
      }
    }
  }, [resetKey])

  // No key provisioned: render nothing, load nothing.
  if (!siteKey) return null
  return (
    <div
      ref={hostRef}
      className={className}
      style={interactive ? { marginTop: 12 } : undefined}
    />
  )
}
