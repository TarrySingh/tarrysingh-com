import type { ReactNode } from "react"
import { LeadershipMatrix } from "@/components/cv/LeadershipMatrix"
import { Meridian } from "@/components/cv/Meridian"
import { buildMeridian } from "@/components/cv/meridian-model"
import { ProgrammeLedger, realProgrammes } from "@/components/cv/ProgrammeLedger"
import { ProofStrip, realFigures } from "@/components/cv/ProofStrip"
import {
  BoardList,
  Channels,
  EraIndex,
  hasReach,
  Reach,
  realBoardRoles,
  realTalks,
  realWriting,
  TalkList,
  WritingList,
} from "@/components/cv/Record"
import { PlateBlock, Section } from "@/components/cv/Section"
import cv from "@/components/cv/cv.module.css"
import { formatMoney, toRoman, txt } from "@/lib/cv/format"
import { matrixGrid, summarisePublicProgrammes } from "@/lib/cv/programmes"
import { getPublicProfile } from "@/lib/cv/public-profile"
import { AccessPanel } from "./_components/AccessPanel"
import { Masthead } from "./_components/Masthead"
import { ProfileFooter } from "./_components/ProfileFooter"
import styles from "./profile.module.css"

/**
 * Executive profile · the public page.
 *
 * Renders ONLY src/content/cv/public.json (validated, and checked for
 * non-public items, at build time). Placeholders render as nothing, so a
 * section without real content is left out rather than shown half-built.
 * Everything gated lives behind an access code at /curriculumvitae/dossier.
 */

type Block = {
  id: string
  label: string
  title: string
  standfirst?: string
  wide?: boolean
  body: ReactNode
}

const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]

function meridianStandfirst(eras: number): string {
  if (eras === 0) return "The career as one line, from 1995 to today."
  const n = WORDS[eras] ?? String(eras)
  return `The career as one line: ${n} ${eras === 1 ? "era" : "eras"}, each set against its technology wave.`
}

function ProgrammeSummaryLine({ programmes }: { programmes: Parameters<typeof summarisePublicProgrammes>[0] }) {
  const s = summarisePublicProgrammes(programmes)
  const sectors = s.sectors.filter((t) => txt(t.label))
  const total = s.budgetTotal
  const totalText = total
    ? formatMoney({ currency: total.currency, exact: total.exact, rangeLow: total.low, rangeHigh: total.high })
    : null
  const parts: ReactNode[] = []
  parts.push(
    <span key="n">
      <strong>{s.count}</strong> {s.count === 1 ? "programme" : "programmes"} cleared for this page
    </span>,
  )
  if (s.yearSpan) parts.push(<span key="y">{`${s.yearSpan.from}–${s.yearSpan.to}`}</span>)
  if (sectors.length > 0)
    parts.push(<span key="s">{sectors.map((t) => `${t.label} (${t.count})`).join(", ")}</span>)
  if (total && totalText) parts.push(<span key="b">{`Combined ${total.kind} ${totalText}`}</span>)
  return <p className={cv.ledgerSummaryLine}>{parts.map((p, i) => [i > 0 ? " · " : null, p])}</p>
}

export default function ExecutiveProfilePage() {
  const data = getPublicProfile()
  const profile = data.profile
  const folioYear = toRoman(new Date(data.generatedAt).getUTCFullYear())

  const meridian = buildMeridian({
    eras: data.eras,
    roles: data.roles,
    boardRoles: data.boardRoles,
    publications: data.publications,
    talks: data.talks,
    detailed: false,
  })
  const hasEras = data.eras.some((e) => txt(e.title))
  const figures = realFigures(data.proofFigures)

  const blocks: Block[] = []

  if (realProgrammes(data.programmes).length > 0) {
    blocks.push({
      id: "programmes",
      label: "Programmes",
      title: "Signature programmes",
      standfirst:
        "Transformation programmes led or shaped, anonymised by design. Clients are named only where naming has been cleared.",
      body: (
        <>
          <ProgrammeSummaryLine programmes={data.programmes} />
          <ProgrammeLedger programmes={data.programmes} variant="public" />
        </>
      ),
    })
  }

  if (matrixGrid(data.matrix).filled > 0) {
    blocks.push({
      id: "matrix",
      label: "Leadership",
      title: "Leadership matrix",
      wide: true,
      standfirst:
        "Three seats, three pillars. Each mark rests on programmes in the record; a competency without evidence is left out rather than claimed.",
      body: <LeadershipMatrix cells={data.matrix} programmes={data.programmes} variant="public" />,
    })
  }

  if (hasReach(data.sectors, data.geographies)) {
    blocks.push({
      id: "reach",
      label: "Reach",
      title: "Sectors and geographies",
      body: <Reach sectors={data.sectors} geographies={data.geographies} />,
    })
  }

  if (realBoardRoles(data.boardRoles).length > 0) {
    blocks.push({
      id: "governance",
      label: "Governance",
      title: "Board and advisory",
      body: <BoardList items={data.boardRoles} />,
    })
  }

  const writing = realWriting(data.publications)
  const talks = realTalks(data.talks)
  blocks.push({
    id: "writing",
    label: "Open work",
    title: "Thought leadership and open work",
    standfirst: "Published in the open, so the thinking can be read before the meeting.",
    body: (
      <>
        <Channels publications={data.publications} />
        {writing.length > 0 ? (
          <>
            <h3 className={cv.subTitle}>Publications</h3>
            <WritingList items={data.publications} />
          </>
        ) : null}
        {talks.length > 0 ? (
          <>
            <h3 className={cv.subTitle}>Talks</h3>
            <TalkList items={data.talks} />
          </>
        ) : null}
      </>
    ),
  })

  return (
    <>
      <Masthead
        data={data}
        folioLeft="Folio · Curriculum vitae"
        folioRight={`Anno ${folioYear}`}
      />

      <main id="main">
        {figures.length > 0 || meridian || hasEras ? (
          <div className={styles.plate}>
            <div className={`syn-column ${styles.fade} ${styles.fadeLate}`}>
              {figures.length > 0 ? (
                <PlateBlock id="glance" fig="Fig. I" title="At a glance">
                  <ProofStrip figures={data.proofFigures} />
                </PlateBlock>
              ) : null}
              {meridian || hasEras ? (
                <PlateBlock
                  id="meridian"
                  fig={figures.length > 0 ? "Fig. II" : "Fig. I"}
                  title="Career meridian"
                  standfirst={meridianStandfirst(data.eras.filter((e) => txt(e.title)).length)}
                >
                  {meridian ? (
                    <Meridian
                      data={meridian}
                      label={`Career meridian, ${meridian.from} to today: eras, technology waves and public roles by lane.`}
                      descriptionId={hasEras ? "cv-era-index" : undefined}
                      emptyLaneNote="Roles in this lane are set out in the dossier"
                    />
                  ) : null}
                  <EraIndex id="cv-era-index" eras={data.eras} roles={data.roles} />
                </PlateBlock>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className={styles.paper}>
          <div className="syn-column">
            {blocks.map((b, i) => (
              <Section
                key={b.id}
                id={b.id}
                numeral={toRoman(i + 1)}
                label={b.label}
                title={b.title}
                standfirst={b.standfirst}
                wide={b.wide}
              >
                {b.body}
              </Section>
            ))}
            <AccessPanel referencesPolicy={profile?.referencesPolicy?.text} />
          </div>
        </div>
      </main>

      <ProfileFooter profile={profile} generatedAt={data.generatedAt} />
    </>
  )
}
