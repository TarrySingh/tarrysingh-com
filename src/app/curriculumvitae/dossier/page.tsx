import type { Metadata } from "next"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import {
  Achievements,
  CaseStudies,
  caseViews,
  Credentials,
  Downloads,
  Mandates,
  PreparedFor,
  RoleLedger,
  signatureAchievements,
  Summary,
  Themes,
} from "@/components/cv/Dossier"
import { LeadershipMatrix } from "@/components/cv/LeadershipMatrix"
import { Meridian } from "@/components/cv/Meridian"
import { buildMeridian } from "@/components/cv/meridian-model"
import { ProgrammeLedger, realProgrammes } from "@/components/cv/ProgrammeLedger"
import { ProofStrip, realFigures } from "@/components/cv/ProofStrip"
import {
  BoardList,
  Channels,
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
import { getDossierAccess, hasScope, logEvent } from "@/lib/cv/access/server"
import { PROFILE_PATHS, PROFILE_ROBOTS_NEVER } from "@/lib/cv/config"
import { paragraphs, toRoman, txt } from "@/lib/cv/format"
import { loadGatedProfile } from "@/lib/cv/gated-store"
import { matrixGrid } from "@/lib/cv/programmes"
import type { GatedProfile } from "@/lib/cv/schema"
import { Masthead } from "../_components/Masthead"
import { ProfileFooter } from "../_components/ProfileFooter"
import styles from "../profile.module.css"

/**
 * Executive profile · the gated dossier.
 *
 * Dynamic on every request: getDossierAccess() verifies the session and
 * re-loads the grant (revocation is immediate), and the content comes from
 * the private store via loadGatedProfile(), never from the build. Never
 * indexed, never cached, no Open Graph card.
 */
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Dossier",
  robots: PROFILE_ROBOTS_NEVER,
  openGraph: null,
  twitter: null,
  alternates: { canonical: null },
}

type Block = {
  id: string
  label: string
  title: string
  standfirst?: string
  wide?: boolean
  body: ReactNode
}

function credentialsTitle(data: GatedProfile): string {
  const parts = [
    data.education.some((e) => txt(e.institution)) ? "education" : null,
    data.credentials.some((c) => txt(c.name)) ? "credentials" : null,
    data.languages.some((l) => txt(l.language)) ? "languages" : null,
  ].filter((p): p is string => p != null)
  if (parts.length === 0) return "Education and credentials"
  const text =
    parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function Unavailable() {
  return (
    <main id="main" className={styles.paper}>
      <div className="syn-column">
        <p className={styles.notice} role="status">
          The dossier cannot be shown just now. Please try again shortly, or
          reply to the message that carried your code.
        </p>
      </div>
    </main>
  )
}

export default async function DossierPage() {
  const access = await getDossierAccess()
  if (!access) redirect(PROFILE_PATHS.access)

  await logEvent("view", { grantId: access.grantId, path: PROFILE_PATHS.dossier })

  let data: GatedProfile | null = null
  try {
    data = await loadGatedProfile()
  } catch {
    data = null
  }

  if (!data) {
    return (
      <>
        <PreparedFor
          recruiterName={access.recruiterName}
          firm={access.firm}
          label={access.label}
          expiresAt={access.expiresAt}
          reference={access.ref}
          artefacts={[]}
        />
        <Unavailable />
      </>
    )
  }

  const artefacts = data.artefacts.filter(
    (a) => txt(a.title) && hasScope(access, a.requiredScope),
  )
  const canRead = hasScope(access, "dossier")
  const canCases = hasScope(access, "cases")
  const profile = data.profile
  const folioYear = toRoman(new Date(data.generatedAt).getUTCFullYear())

  const meridian = canRead
    ? buildMeridian({
        eras: data.eras,
        roles: data.roles,
        boardRoles: data.boardRoles,
        publications: data.publications,
        talks: data.talks,
        detailed: true,
      })
    : null
  const figures = realFigures(data.proofFigures)

  const blocks: Block[] = []
  if (canRead) {
    if (paragraphs(profile?.summary?.text).length > 0) {
      blocks.push({
        id: "summary",
        label: "Summary",
        title: "Executive summary",
        body: <Summary text={profile?.summary?.text} />,
      })
    }
    const achievements = signatureAchievements(data.roles, data.caseStudies)
    if (achievements.length > 0) {
      blocks.push({
        id: "achievements",
        label: "Achievements",
        title: "Signature achievements",
        body: <Achievements items={achievements} />,
      })
    }
    const cases = canCases ? caseViews(data.programmes, data.caseStudies) : []
    if (cases.length > 0) {
      blocks.push({
        id: "cases",
        label: "Case studies",
        title: "Featured case studies",
        standfirst:
          "Situation, complication, the decisions he took and what they produced, in his own account.",
        body: <CaseStudies views={cases} />,
      })
    }
    if (realProgrammes(data.programmes).length > 0) {
      blocks.push({
        id: "programmes",
        label: "Programmes",
        title: "Programme ledger",
        standfirst: "Every programme in the record, with budget, team and measured outcomes.",
        body: <ProgrammeLedger programmes={data.programmes} variant="full" />,
      })
    }
    if (matrixGrid(data.matrix).filled > 0) {
      blocks.push({
        id: "matrix",
        label: "Leadership",
        title: "Leadership matrix",
        wide: true,
        standfirst: "Each competency with its proof and the programmes behind it.",
        body: <LeadershipMatrix cells={data.matrix} programmes={data.programmes} variant="full" />,
      })
    }
    if (data.themes.some((t) => txt(t.title))) {
      blocks.push({
        id: "themes",
        label: "Themes",
        title: "Leadership themes",
        body: <Themes themes={data.themes} roles={data.roles} programmes={data.programmes} />,
      })
    }
    if (data.roles.some((r) => txt(r.title))) {
      blocks.push({
        id: "career",
        label: "Career",
        title: "Career record",
        standfirst: "Reverse chronological. The last fifteen years in full; earlier career in brief.",
        body: <RoleLedger roles={data.roles} />,
      })
    }
    if (realBoardRoles(data.boardRoles).length > 0) {
      blocks.push({
        id: "governance",
        label: "Governance",
        title: "Board and advisory",
        body: <BoardList items={data.boardRoles} anchors />,
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
    blocks.push({
      id: "writing",
      label: "Writing and talks",
      title: "Publications and talks",
      body: (
        <>
          <Channels publications={data.publications} />
          {realWriting(data.publications).length > 0 ? (
            <>
              <h3 className={cv.subTitle}>Publications</h3>
              <WritingList items={data.publications} />
            </>
          ) : null}
          {realTalks(data.talks).length > 0 ? (
            <>
              <h3 className={cv.subTitle}>Talks</h3>
              <TalkList items={data.talks} />
            </>
          ) : null}
        </>
      ),
    })
    blocks.push({
      id: "credentials",
      label: "Credentials",
      title: credentialsTitle(data),
      body: (
        <Credentials
          education={data.education}
          credentials={data.credentials}
          languages={data.languages}
        />
      ),
    })
    if (data.openness) {
      blocks.push({
        id: "mandates",
        label: "Mandates",
        title: "Mandates of interest",
        body: <Mandates openness={data.openness} />,
      })
    }
    blocks.push({
      id: "references",
      label: "References",
      title: "References",
      body: (
        <p className={cv.prose}>
          {txt(profile?.referencesPolicy?.text) ??
            "References available at the appropriate stage. Referees are approached only with their consent, and only once a process is under way."}
        </p>
      ),
    })
  }

  return (
    <>
      <PreparedFor
        recruiterName={access.recruiterName}
        firm={access.firm}
        label={access.label}
        expiresAt={access.expiresAt}
        reference={access.ref}
        artefacts={artefacts}
      />
      <Masthead data={data} folioLeft="Folio · Dossier" folioRight={`Anno ${folioYear} · Ref ${access.ref}`} />

      <main id="main">
        {canRead && (figures.length > 0 || meridian) ? (
          <div className={styles.plate}>
            <div className={`syn-column ${styles.fade} ${styles.fadeLate}`}>
              {figures.length > 0 ? (
                <PlateBlock id="glance" fig="Fig. I" title="At a glance">
                  <ProofStrip figures={data.proofFigures} />
                </PlateBlock>
              ) : null}
              {meridian ? (
                <PlateBlock
                  id="meridian"
                  fig={figures.length > 0 ? "Fig. II" : "Fig. I"}
                  title="Career meridian"
                  standfirst="Every role, board seat and publication on one line. Select a bar to jump to its entry."
                >
                  <Meridian
                    data={meridian}
                    label={`Career meridian, ${meridian.from} to today: every role by lane, against eras and technology waves.`}
                    descriptionId="cv-role-ledger"
                  />
                </PlateBlock>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className={styles.paper}>
          <div className="syn-column">
            {!canRead ? (
              <p className={styles.notice} role="note">
                Your access covers the documents above. For the full dossier, reply to
                the message that carried your code.
              </p>
            ) : null}
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
            {artefacts.length > 0 ? (
              <section aria-labelledby="downloads-title" className={cv.downloadPanel}>
                <h2 id="downloads-title" className={cv.downloadPanelTitle}>
                  Documents prepared for you
                </h2>
                <p className={cv.downloadPanelText}>
                  Each copy carries your name and reference. They are written to be
                  safe to forward to your client.
                </p>
                <Downloads artefacts={artefacts} />
              </section>
            ) : null}
          </div>
        </div>
      </main>

      <ProfileFooter
        profile={profile}
        generatedAt={data.generatedAt}
        note={`Confidential · prepared for ${[access.recruiterName, access.firm].filter(Boolean).join(", ") || "the invited reader"} · Ref ${access.ref}`}
      />
    </>
  )
}
