"use client"

import { useEffect, useState } from "react"

type Chapter = { id: string; title: string; words: number }
const storageKey = "synaptic:intelligence-without-permission:chapter"

export function Reader({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState(chapters[0]?.id || "prologue")
  const [progress, setProgress] = useState(0)
  const [resume, setResume] = useState<string | null>(null)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved && chapters.some(chapter => chapter.id === saved) && saved !== "prologue") setResume(saved)
    } catch { /* Reading works when local storage is unavailable. */ }
    const update = () => {
      const article = document.getElementById("iwp-manuscript")
      if (!article) return
      const bounds = article.getBoundingClientRect()
      setProgress(Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - innerHeight))))
      const current = [...chapters].reverse().find(chapter => {
        const element = document.getElementById(`chapter-${chapter.id}`)
        return element && element.getBoundingClientRect().top < innerHeight * .4
      })
      if (current) {
        setActive(current.id)
        try { localStorage.setItem(storageKey, current.id) } catch { /* Optional enhancement. */ }
      }
    }
    let frame = 0
    const scroll = () => { if (!frame) frame = requestAnimationFrame(() => { update(); frame = 0 }) }
    addEventListener("scroll", scroll, { passive: true })
    update()
    return () => { removeEventListener("scroll", scroll); cancelAnimationFrame(frame) }
  }, [chapters])
  return <>
    <div className="iwp-progress" aria-hidden="true"><span style={{ transform: `scaleX(${progress})` }} /></div>
    <nav className="iwp-reader" aria-label="Article chapters">
      <details>
        <summary><span className="iwp-reader-label">In this essay</span><span>{chapters.find(chapter => chapter.id === active)?.title}</span><span aria-hidden="true">＋</span></summary>
        <ol>{chapters.map(chapter => <li key={chapter.id}><a href={`#chapter-${chapter.id}`} aria-current={active === chapter.id ? "location" : undefined} onClick={event => event.currentTarget.closest("details")?.removeAttribute("open")}><span>{chapter.id}</span>{chapter.title}<small>{Math.ceil(chapter.words / 220)} min</small></a></li>)}</ol>
      </details>
      <a className="iwp-sources-link" href="#iwp-sources">Sources ↗</a>
    </nav>
    {resume && <a className="iwp-resume" href={`#chapter-${resume}`} onClick={() => setResume(null)}>Continue where you left off →</a>}
  </>
}
