import type { ReactNode } from "react"
import { formatSpan, kindLabel, toRoman, txt, txts } from "@/lib/cv/format"
import type {
  BoardRoleT,
  EraT,
  PublicationT,
  ReachItemT,
  RoleT,
  TalkT,
} from "@/lib/cv/schema"
import styles from "./cv.module.css"

/* ── Links ──────────────────────────────────────────────────────────────── */

export function EntryLink({ href, children }: { href: string; children: ReactNode }) {
  const external = /^https?:\/\//.test(href)
  return (
    <a
      href={href}
      className={styles.link}
      {...(external ? { rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  )
}

/* ── Era index: the text equivalent of the meridian ─────────────────────── */

/**
 * The eras as an ordered list, each with the roles that sit inside it.
 * This <ol> is the meridian's real content (its aria-describedby target).
 */
export function EraIndex({
  id,
  eras,
  roles,
}: {
  id: string
  eras: readonly EraT[]
  roles: readonly RoleT[]
}) {
  const shown = eras.filter((e) => txt(e.title))
  if (shown.length === 0) return null
  return (
    <ol id={id} className={styles.eraIndex}>
      {shown.map((era) => {
        const inEra = roles.filter((r) => r.eraId === era.id && txt(r.title))
        const span = formatSpan(era.start, era.end)
        return (
          <li key={era.id} className={styles.eraItem}>
            <p className={styles.eraYears}>
              <span className={styles.eraNumeral}>{toRoman(eras.indexOf(era) + 1)}</span>
              {span ?? ""}
            </p>
            <h3 className={styles.eraTitle}>{txt(era.title)}</h3>
            {txt(era.thesis) ? <p className={styles.eraThesis}>{txt(era.thesis)}</p> : null}
            {txt(era.wave) ? (
              <p className={styles.eraWave}>
                <span className={styles.eraWaveKey}>Wave</span> {txt(era.wave)}
              </p>
            ) : null}
            {inEra.length > 0 ? (
              <ul className={styles.eraRoles}>
                {inEra.map((r) => (
                  <li key={r.id}>
                    {txt(r.title)}
                    {txt(r.organisation.name) ? `, ${txt(r.organisation.name)}` : ""}
                    {formatSpan(r.start, r.end) ? (
                      <span className={styles.eraRoleSpan}> {formatSpan(r.start, r.end)}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

/* ── Reach: sectors and geographies ─────────────────────────────────────── */

function Leaders({ items, title }: { items: readonly ReachItemT[]; title: string }) {
  const shown = items.filter((i) => txt(i.label))
  if (shown.length === 0) return null
  return (
    <div>
      <h3 className={styles.subTitle}>
        {title} <span className={styles.subCount}>{shown.length}</span>
      </h3>
      <ul className={styles.leaders}>
        {shown.map((item) => (
          <li key={item.id} className={styles.leader}>
            <span className={styles.leaderLabel}>
              {txt(item.label)}
              {txt(item.note) ? <span className={styles.leaderNote}> · {txt(item.note)}</span> : null}
            </span>
            {txt(item.years) ? (
              <>
                <span className={styles.leaderDots} aria-hidden="true" />
                <span className={styles.leaderValue}>{txt(item.years)}</span>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function hasReach(sectors: readonly ReachItemT[], geographies: readonly ReachItemT[]) {
  return [...sectors, ...geographies].some((i) => txt(i.label))
}

export function Reach({
  sectors,
  geographies,
}: {
  sectors: readonly ReachItemT[]
  geographies: readonly ReachItemT[]
}) {
  return (
    <div className={styles.reachGrid}>
      <Leaders items={sectors} title="Sectors" />
      <Leaders items={geographies} title="Geographies" />
    </div>
  )
}

/* ── Board and advisory ─────────────────────────────────────────────────── */

export function realBoardRoles(items: readonly BoardRoleT[]): BoardRoleT[] {
  return items.filter((b) => txt(b.title) && txt(b.organisation.name))
}

export function BoardList({ items, anchors = false }: { items: readonly BoardRoleT[]; anchors?: boolean }) {
  const shown = realBoardRoles(items)
  if (shown.length === 0) return null
  return (
    <ul className={styles.entries}>
      {shown.map((b) => {
        const committees = txts(b.committees)
        const span = formatSpan(b.start, b.end)
        return (
          <li key={b.id} id={anchors ? b.id : undefined} className={styles.entry}>
            <p className={styles.entryKind}>{kindLabel(b.kind) ?? "Board"}</p>
            <div>
              <p className={styles.entryTitle}>
                {txt(b.title)}, {txt(b.organisation.name)}
              </p>
              <p className={styles.entryMeta}>
                {txts([span, txt(b.organisation.hqCountry)]).join(" · ")}
                {committees.length > 0 ? ` · Committees: ${committees.join(", ")}` : ""}
              </p>
              {txt(b.remit) ? <p className={styles.entryText}>{txt(b.remit)}</p> : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/* ── Thought leadership and open work ───────────────────────────────────── */

const CHANNEL_KINDS = new Set(["channel", "repository", "course", "essay-series"])

type Channel = {
  key: string
  kind: string
  title: string
  description: string | null
  href: string | null
}

/** The open work the site itself publishes; data may retitle or extend it. */
const DEFAULT_CHANNELS: Channel[] = [
  {
    key: "dispatches",
    kind: "Essays",
    title: "Dispatches",
    description:
      "Field notes and essays on AI strategy, deep-tech architecture and the economics underneath.",
    href: "/blog",
  },
  {
    key: "synaptic",
    kind: "Long-form and instruments",
    title: "Synaptic Cartography",
    description:
      "Long-form essays, interactive scientific plates and deep-tech proposals, drawn by hand.",
    href: "/synaptic",
  },
  {
    key: "commons",
    kind: "Open curriculum",
    title: "Synapsa Commons",
    description:
      "An open AI curriculum of runnable notebooks with exercises, released in weekly drops.",
    href: "https://github.com/TarrySingh/Artificial-Intelligence-Deep-Learning-Machine-Learning-Tutorials",
  },
]

function channelsFrom(publications: readonly PublicationT[]): Channel[] {
  const channels = DEFAULT_CHANNELS.map((c) => ({ ...c }))
  for (const p of publications) {
    if (!CHANNEL_KINDS.has(p.kind)) continue
    const title = txt(p.title)
    const match = channels.find((c) => c.href && p.url && c.href === p.url)
    if (match) {
      if (title) match.title = title
      const description = txt(p.description) ?? txt(p.venue)
      if (description) match.description = description
      continue
    }
    if (!title) continue
    channels.push({
      key: p.id,
      kind: kindLabel(p.kind) ?? "Channel",
      title,
      description: txt(p.description) ?? txt(p.venue),
      href: p.url,
    })
  }
  return channels
}

export function Channels({ publications }: { publications: readonly PublicationT[] }) {
  const channels = channelsFrom(publications)
  return (
    <ul className={styles.channels}>
      {channels.map((c) => (
        <li key={c.key} className={styles.channel}>
          <p className={styles.channelKind}>{c.kind}</p>
          <h3 className={styles.channelTitle}>
            {c.href ? (
              <a
                href={c.href}
                className={styles.channelLink}
                {...(/^https?:/.test(c.href) ? { rel: "noopener noreferrer" } : {})}
              >
                {c.title}
                <span aria-hidden="true" className={styles.channelArrow}>
                  {/^https?:/.test(c.href) ? "↗" : "→"}
                </span>
              </a>
            ) : (
              c.title
            )}
          </h3>
          {c.description ? <p className={styles.channelText}>{c.description}</p> : null}
        </li>
      ))}
    </ul>
  )
}

export function realWriting(publications: readonly PublicationT[]): PublicationT[] {
  return publications.filter((p) => !CHANNEL_KINDS.has(p.kind) && txt(p.title))
}

export function realTalks(talks: readonly TalkT[]): TalkT[] {
  return talks.filter((t) => txt(t.title) && txt(t.event))
}

export function WritingList({ items }: { items: readonly PublicationT[] }) {
  const shown = realWriting(items)
  if (shown.length === 0) return null
  return (
    <ul className={styles.entries}>
      {shown.map((p) => {
        const title = txt(p.title)
        const meta = txts([p.venue, typeof p.year === "number" ? p.year : null])
        return (
          <li key={p.id} className={styles.entry}>
            <p className={styles.entryKind}>{kindLabel(p.kind) ?? "Publication"}</p>
            <div>
              <p className={styles.entryTitle}>
                {p.url ? <EntryLink href={p.url}>{title}</EntryLink> : title}
              </p>
              {meta.length > 0 ? <p className={styles.entryMeta}>{meta.join(" · ")}</p> : null}
              {p.doi ? (
                <p className={styles.entryMeta}>
                  <EntryLink href={`https://doi.org/${p.doi}`}>doi:{p.doi}</EntryLink>
                </p>
              ) : null}
              {txt(p.description) ? <p className={styles.entryText}>{txt(p.description)}</p> : null}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function TalkList({ items }: { items: readonly TalkT[] }) {
  const shown = realTalks(items)
  if (shown.length === 0) return null
  return (
    <ul className={styles.entries}>
      {shown.map((t) => {
        const title = txt(t.title)
        const meta = txts([t.event, t.location, typeof t.year === "number" ? t.year : null])
        return (
          <li key={t.id} className={styles.entry}>
            <p className={styles.entryKind}>{kindLabel(t.kind) ?? "Talk"}</p>
            <div>
              <p className={styles.entryTitle}>
                {t.url ? <EntryLink href={t.url}>{title}</EntryLink> : title}
              </p>
              <p className={styles.entryMeta}>{meta.join(" · ")}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
