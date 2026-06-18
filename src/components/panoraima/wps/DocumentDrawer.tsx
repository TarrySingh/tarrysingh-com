"use client"

import { useEffect } from "react"
import { X, FileText, Calendar, Package, Hash } from "lucide-react"
import type { WpDeliverable } from "@/lib/panoraima/types"
import { NAVY, INK, SLATE, MUTE, FAINT, LINE, SURFACE, COBALT } from "../consortiumTokens"

interface Props {
  deliverable: WpDeliverable | null
  open: boolean
  onClose: () => void
  wpColor: string
}

export default function DocumentDrawer({ deliverable, open, onClose, wpColor }: Props) {
  useEffect(() => {
    if (!open) return
    const h = (ev: KeyboardEvent) => ev.key === "Escape" && onClose()
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!deliverable) return null

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={`fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: `${NAVY}99` }}
      />
      <aside
        aria-label="Deliverable"
        className={`fixed top-0 bottom-0 right-0 z-50 w-full md:w-[560px] bg-white border-l border-[#E3E7ED] shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        <div
          className="relative px-6 md:px-8 pt-7 pb-6 text-white overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${NAVY} 0%, ${wpColor}dd 180%)`,
          }}
        >
          <div
            aria-hidden
            className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
            style={{ background: `radial-gradient(${wpColor}, transparent 60%)` }}
          />
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] font-bold text-[#7DA0FF] mb-2">
            <Package className="w-3 h-3" />
            {deliverable.id}
            {deliverable.version && (
              <>
                <span className="text-white/40">·</span>
                <span className="text-white/80">v{deliverable.version}</span>
              </>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-bold leading-tight mb-3">
            {deliverable.file.replace(/\.[^.]+$/, "")}
          </h2>
          <div className="flex items-center gap-4 text-[12px] text-white/80 flex-wrap">
            {deliverable.date && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {deliverable.date}
              </span>
            )}
            {deliverable.size_kb ? (
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {(deliverable.size_kb / 1024).toFixed(1)} MB
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5" />
              {deliverable.status}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">
          {deliverable.excerpt ? (
            <>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] font-bold mb-2" style={{ color: FAINT }}>
                Excerpt
              </div>
              <p className="text-[14px] leading-relaxed pl-4 italic border-l-2" style={{ color: INK, borderColor: COBALT }}>
                &ldquo;{deliverable.excerpt}&rdquo;
              </p>
            </>
          ) : (
            <div className="text-sm italic" style={{ color: MUTE }}>
              No machine-readable excerpt available (this may be a scanned PDF or a binary we
              haven&apos;t indexed yet).
            </div>
          )}

          {deliverable.rel_path && (
            <div className="mt-8 pt-6 border-t" style={{ borderColor: LINE }}>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] font-bold mb-2" style={{ color: FAINT }}>
                Source path (SharePoint)
              </div>
              <code className="block text-[11px] font-mono break-all px-3 py-2 rounded-md" style={{ color: SLATE, backgroundColor: SURFACE }}>
                PANORAIMA - Documents / WP2 / {deliverable.rel_path}
              </code>
              <p className="mt-3 text-[11px] leading-relaxed" style={{ color: MUTE }}>
                Deliverables live on the consortium SharePoint. This dashboard shows the first
                few paragraphs only — open the file in SharePoint/OneDrive for the full content.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
