/**
 * Executive profile · data model (the single source of truth's SHAPE).
 *
 * The CONTENT does not live in this repository. It lives in a private local
 * folder (profile.yaml) and is turned into data by scripts/cv/sync.ts:
 *
 *   profile.yaml ──validate──► toPublic() ──► src/content/cv/public.json   (committed)
 *                          └─► toGated()  ──► <private>/build/gated.json   (never committed)
 *
 * Every item carries `visibility`:
 *   public   may appear in public.json, which is committed to a PUBLIC repo
 *   gated    only in the access-controlled layer (Phase 3)
 *   private  authoring notes and anything that must never be rendered or exported
 *
 * Sub-blocks that can name a client or carry a number (scope, budget, team
 * size, client, outcomes, narrative, evidence) carry their own `visibility`,
 * so they can be gated independently of the item they belong to. toPublic()
 * and toGated() honour visibility at every depth: a list item that is not
 * allowed is removed, and a sub-block that is not allowed becomes `null`.
 * Fails closed: an unknown visibility value is treated as not allowed.
 */
import { z } from "zod"
import { isPlaceholder, PLACEHOLDER_RE } from "./placeholder"

export { isPlaceholder }

export const SCHEMA_VERSION = 1 as const

/* ── Visibility ─────────────────────────────────────────────────────────── */

export const VISIBILITIES = ["public", "gated", "private"] as const
export const Visibility = z.enum(VISIBILITIES)
export type Visibility = z.infer<typeof Visibility>

const VISIBILITY_RANK: Record<Visibility, number> = {
  public: 0,
  gated: 1,
  private: 2,
}

/** The more restrictive of two visibilities. */
export function stricterVisibility(a: Visibility, b: Visibility): Visibility {
  return VISIBILITY_RANK[a] >= VISIBILITY_RANK[b] ? a : b
}

/* ── Placeholders ───────────────────────────────────────────────────────── */

/** `[PLACEHOLDER]` or `[PLACEHOLDER: what goes here]`. Allowed during intake. */
export const Placeholder = z
  .string()
  .regex(PLACEHOLDER_RE, 'expected "[PLACEHOLDER: …]"')

const orPlaceholder = <T extends z.ZodTypeAny>(schema: T) =>
  z.union([schema, Placeholder])

/* ── Primitives ─────────────────────────────────────────────────────────── */

/** Every object rejects unknown keys, so a typo in profile.yaml is an error. */
const strictObject = <T extends z.ZodRawShape>(shape: T) =>
  z.object(shape).strict()

/**
 * Item ids appear in public.json for public items, so keep them neutral
 * (`role-07`, `programme-03`), never `role-<employer-name>`.
 */
export const Id = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "ids are lower-case kebab-case, e.g. role-07")

const Text = z.string().trim().min(1)
const OptionalText = Text.nullable().default(null)

const Year = z.number().int().min(1950).max(2100)
const MonthYear = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'expected "YYYY-MM"')

const StartYear = orPlaceholder(Year)
const EndYear = z.union([Year, z.literal("present"), Placeholder])
const StartMonth = orPlaceholder(MonthYear)
const EndMonth = z.union([MonthYear, z.literal("present"), Placeholder])

const Url = z
  .string()
  .refine(
    (v) => /^https?:\/\/\S+$/.test(v) || /^\/(?!\/)\S*$/.test(v),
    "use an absolute http(s) URL or a site path starting with /",
  )

/** ISO 4217 code, e.g. EUR, USD, GBP. */
const Currency = z.string().regex(/^[A-Z]{3}$/, "ISO 4217 code, e.g. EUR")

export const SourceHash = z
  .string()
  .regex(/^sha256:[0-9a-f]{64}$/, 'expected "sha256:<64 hex>"')

const Amount = z.number().nonnegative().nullable().default(null)
const Count = z.number().int().nonnegative().nullable().default(null)

/** A number, a range (for figures under NDA) or a placeholder. */
const NumberOrRange = z.union([
  z.number(),
  strictObject({ low: z.number(), high: z.number() }),
  Placeholder,
])

/* ── Shared building blocks ─────────────────────────────────────────────── */

/** Authoring note. Always private: never rendered, never exported. */
export const Note = strictObject({
  visibility: z.literal("private"),
  text: Text,
})
const Notes = z.array(Note).default([])

/** A block of prose with its own visibility. */
export const Narrative = strictObject({
  visibility: Visibility,
  text: Text,
})

export const EVIDENCE_KINDS = [
  "press",
  "award",
  "client-reference",
  "internal",
  "registry",
  "publication",
  "document",
  "other",
] as const

/**
 * Where a claim can be checked. `ref` is a path inside the private folder
 * (e.g. evidence/registry-extract.pdf); `url` is a public link.
 */
export const Evidence = strictObject({
  visibility: Visibility,
  kind: z.enum(EVIDENCE_KINDS),
  url: Url.nullable().default(null),
  ref: OptionalText,
  note: OptionalText,
})

export const Organisation = strictObject({
  name: Text,
  legalEntity: OptionalText,
  hqCountry: OptionalText,
  url: Url.nullable().default(null),
})

/** Money with ranges as first-class citizens: `exact` OR `rangeLow`+`rangeHigh`. */
const MoneyShape = {
  currency: orPlaceholder(Currency),
  exact: Amount,
  rangeLow: Amount,
  rangeHigh: Amount,
  note: OptionalText,
}

export const TeamSize = strictObject({
  direct: Count,
  total: Count,
  includesVendors: z.boolean().nullable().default(null),
})

export const Metric = strictObject({
  value: NumberOrRange,
  unit: OptionalText,
  timeframe: OptionalText,
  baseline: OptionalText,
  source: OptionalText,
})

/* ── Profile (identity) ─────────────────────────────────────────────────── */

export const Portrait = strictObject({
  visibility: Visibility,
  /** Site path once cleared for use (photo question Q6 in INTAKE.md). */
  src: OptionalText,
  alt: Text,
  credit: OptionalText,
  rights: OptionalText,
})

/** A role contact address (a dedicated alias), never a personal address. */
export const Contact = strictObject({
  visibility: Visibility,
  email: orPlaceholder(z.string().email()),
  label: OptionalText,
})

export const Profile = strictObject({
  visibility: Visibility,
  name: Text,
  honorific: OptionalText,
  postNominals: OptionalText,
  /** One sentence: seat + scale + sectors + distinctive edge. */
  positioning: Text,
  /** City, country. */
  base: Text,
  /** Executive summary, 150 to 200 words. */
  summary: Narrative.nullable().default(null),
  portrait: Portrait.nullable().default(null),
  contact: Contact.nullable().default(null),
  referencesPolicy: Narrative.nullable().default(null),
  /** The one italic line every page ends with. */
  closingLine: Narrative.nullable().default(null),
  notes: Notes,
})

/** "At a glance" figure; only figures cleared for publication go public. */
export const ProofFigure = strictObject({
  id: Id,
  visibility: Visibility,
  value: Text,
  label: Text,
  note: OptionalText,
  evidence: Evidence.nullable().default(null),
})

/* ── Career ─────────────────────────────────────────────────────────────── */

export const Era = strictObject({
  id: Id,
  visibility: Visibility,
  title: Text,
  start: StartYear,
  end: EndYear,
  /** One sentence. */
  thesis: Text,
  /** The technology wave of the era. */
  wave: Text,
  /** Chapters inside a long era, e.g. a foundation-model programme. */
  milestones: z
    .array(
      strictObject({
        visibility: Visibility,
        year: z.number().int().min(1900).max(2100),
        label: Text,
      }),
    )
    .default([]),
  notes: Notes,
})

/** Lanes of the Career Meridian (plan §5). */
export const ROLE_LANES = [
  "founder-ceo",
  "executive",
  "board-advisory",
  "thought-leadership",
] as const

export const ROLE_BUDGET_KINDS = [
  "P&L",
  "budget",
  "revenue",
  "capital raised",
  "other",
] as const

export const Scope = strictObject({
  visibility: Visibility,
  teamSize: TeamSize.nullable().default(null),
  budget: strictObject({
    kind: orPlaceholder(z.enum(ROLE_BUDGET_KINDS)),
    ...MoneyShape,
  })
    .nullable()
    .default(null),
  geography: z.array(Text).default([]),
})

export const Outcome = strictObject({
  id: Id,
  visibility: Visibility,
  /** Verb + what + context. */
  statement: Text,
  metric: Metric.nullable().default(null),
  evidence: Evidence.nullable().default(null),
  /** One of the 6 to 8 signature achievements. */
  signature: z.boolean().default(false),
})

export const Role = strictObject({
  id: Id,
  visibility: Visibility,
  eraId: Id.nullable().default(null),
  lane: orPlaceholder(z.enum(ROLE_LANES)),
  organisation: Organisation,
  title: Text,
  start: StartMonth,
  end: EndMonth,
  reportingLine: OptionalText,
  scope: Scope.nullable().default(null),
  /** Mandate on arrival. */
  mandate: Narrative.nullable().default(null),
  outcomes: z.array(Outcome).default([]),
  evidence: z.array(Evidence).default([]),
  sectorIds: z.array(Id).default([]),
  geographyIds: z.array(Id).default([]),
  /** Reason for leaving and interview prep go here: always private. */
  notes: Notes,
})

/* ── Transformation programmes ──────────────────────────────────────────── */

/** Fixed theme set. Extend here (and only here) when a new theme is needed. */
export const PROGRAMME_THEMES = [
  "AI",
  "Data",
  "Strategy",
  "Digital transformation",
] as const
export type ProgrammeTheme = (typeof PROGRAMME_THEMES)[number]

export const BUDGET_KINDS = ["programme budget", "value delivered", "P&L"] as const

/** The real client name, gated independently of the anonymised descriptor. */
export const ClientName = strictObject({
  visibility: Visibility,
  text: Text,
})

/**
 * Each audience sees EITHER the client's name OR the anonymised descriptor:
 * the name when it survives that audience's filter, the descriptor otherwise.
 * `clientNamed` records that naming has been cleared; when it is false,
 * `name` must be null, so a name can never hide inside an anonymised client.
 */
export const ProgrammeClient = strictObject({
  visibility: Visibility,
  clientNamed: z.boolean(),
  /** Anonymised, e.g. "Top-10 European insurer". Always required. */
  descriptor: Text,
  name: ClientName.nullable().default(null),
})

export const ProgrammeBudget = strictObject({
  visibility: Visibility,
  kind: orPlaceholder(z.enum(BUDGET_KINDS)),
  ...MoneyShape,
})

export const ProgrammeTeam = TeamSize.extend({ visibility: Visibility })

export const ProgrammeOutcome = strictObject({
  id: Id,
  visibility: Visibility,
  /** What was measured, e.g. "claims handling time". */
  metric: Text,
  value: NumberOrRange,
  unit: OptionalText,
  timeframe: OptionalText,
  /** Where the figure comes from (report, press, client reference). */
  source: OptionalText,
  statement: OptionalText,
})

/**
 * Case-study prose. Grouped with its own visibility because situation and
 * complication text can name a client or carry a number too.
 */
export const ProgrammeNarrative = strictObject({
  visibility: Visibility,
  situation: Text,
  complication: Text,
  /** 3 to 5 decisions he took. */
  keyDecisions: z.array(Text).max(5).default([]),
  leadershipLesson: Text,
})

export const Programme = strictObject({
  id: Id,
  visibility: Visibility,
  slug: Id,
  title: Text,
  /** One line. Never name the client here; use `client`. */
  summary: Text,
  client: ProgrammeClient.nullable().default(null),
  sector: Text,
  geographies: z.array(Text).default([]),
  start: StartMonth,
  end: EndMonth,
  /** His role, e.g. "AI and data transformation lead". */
  role: Text,
  /** A role only (e.g. "CEO", "CDO"), never a person's name. */
  sponsor: OptionalText,
  reportingLine: OptionalText,
  budget: ProgrammeBudget.nullable().default(null),
  teamSize: ProgrammeTeam.nullable().default(null),
  themes: z.array(orPlaceholder(z.enum(PROGRAMME_THEMES))).default([]),
  narrative: ProgrammeNarrative.nullable().default(null),
  outcomes: z.array(ProgrammeOutcome).default([]),
  evidence: z.array(Evidence).default([]),
  technologies: z.array(Text).default([]),
  /** The 3 to 5 programmes that become full case studies in the dossier. */
  featured: z.boolean().default(false),
  roleId: Id.nullable().default(null),
  notes: Notes,
})

export const CaseStudy = strictObject({
  id: Id,
  visibility: Visibility,
  slug: Id,
  title: Text,
  roleId: Id.nullable().default(null),
  /** A featured programme this case study writes up, if any. */
  programmeId: Id.nullable().default(null),
  themeIds: z.array(Id).default([]),
  situation: Text,
  complication: Text,
  /** His decisions. */
  actions: z.array(Text).min(1),
  results: z.array(Outcome).default([]),
  /** "What this says about how I lead." */
  leadershipLesson: Text,
  /** Risk and governance, read by a board. */
  boardLens: Text,
  notes: Notes,
})

/** Leadership theme. Every claim links back to a role, case or programme. */
export const Theme = strictObject({
  id: Id,
  visibility: Visibility,
  title: Text,
  claim: Text,
  roleIds: z.array(Id).default([]),
  caseStudyIds: z.array(Id).default([]),
  programmeIds: z.array(Id).default([]),
  notes: Notes,
})

/** Sector or geography the career has reached. */
export const ReachItem = strictObject({
  id: Id,
  visibility: Visibility,
  label: Text,
  years: OptionalText,
  note: OptionalText,
})

/* ── Governance and thought leadership ──────────────────────────────────── */

export const BOARD_KINDS = [
  "board",
  "supervisory-board",
  "advisory-board",
  "committee",
  "trustee",
  "other",
] as const

/** Board and advisory roles. Fees are never recorded, by design. */
export const BoardRole = strictObject({
  id: Id,
  visibility: Visibility,
  kind: orPlaceholder(z.enum(BOARD_KINDS)),
  title: Text,
  organisation: Organisation,
  committees: z.array(Text).default([]),
  start: StartMonth,
  end: EndMonth,
  remit: OptionalText,
  sectorIds: z.array(Id).default([]),
  notes: Notes,
})

export const PUBLICATION_KINDS = [
  "article",
  "book",
  "chapter",
  "paper",
  "report",
  "essay-series",
  "channel",
  "repository",
  "course",
  "patent",
  "media",
] as const

export const Publication = strictObject({
  id: Id,
  visibility: Visibility,
  kind: orPlaceholder(z.enum(PUBLICATION_KINDS)),
  title: Text,
  venue: OptionalText,
  year: StartYear.nullable().default(null),
  url: Url.nullable().default(null),
  doi: z
    .string()
    .regex(/^10\.\d{4,9}\/\S+$/, 'expected a DOI such as "10.1000/xyz"')
    .nullable()
    .default(null),
  description: OptionalText,
  notes: Notes,
})

export const TALK_KINDS = [
  "keynote",
  "talk",
  "panel",
  "lecture",
  "podcast",
  "interview",
  "other",
] as const

export const Talk = strictObject({
  id: Id,
  visibility: Visibility,
  kind: orPlaceholder(z.enum(TALK_KINDS)),
  title: Text,
  event: Text,
  location: OptionalText,
  year: StartYear,
  url: Url.nullable().default(null),
  notes: Notes,
})

export const Education = strictObject({
  id: Id,
  visibility: Visibility,
  institution: Text,
  qualification: Text,
  field: OptionalText,
  start: StartYear.nullable().default(null),
  end: StartYear.nullable().default(null),
  notes: Notes,
})

export const CREDENTIAL_KINDS = [
  "certification",
  "executive-education",
  "fellowship",
  "membership",
  "award",
  "other",
] as const

export const Credential = strictObject({
  id: Id,
  visibility: Visibility,
  kind: orPlaceholder(z.enum(CREDENTIAL_KINDS)),
  name: Text,
  issuer: Text,
  year: StartYear.nullable().default(null),
  url: Url.nullable().default(null),
  notes: Notes,
})

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "native"] as const

export const Language = strictObject({
  id: Id,
  visibility: Visibility,
  language: Text,
  level: orPlaceholder(z.enum(CEFR_LEVELS)),
  note: OptionalText,
})

/* ── Openness to approaches ─────────────────────────────────────────────── */

export const TargetSeat = strictObject({
  id: Id,
  visibility: Visibility,
  title: Text,
  emphasis: z.enum(["primary", "secondary"]),
  note: OptionalText,
})

export const ENGAGEMENT_FORMATS = [
  "executive",
  "non-executive",
  "interim",
  "advisory",
  "portfolio",
] as const

export const Openness = strictObject({
  visibility: Visibility,
  targetSeats: z.array(TargetSeat).default([]),
  sectors: z.array(Text).default([]),
  companyStages: z.array(Text).default([]),
  geographies: z.array(Text).default([]),
  relocation: OptionalText,
  formats: z.array(orPlaceholder(z.enum(ENGAGEMENT_FORMATS))).default([]),
  availability: Text,
  timeHorizon: OptionalText,
  /** How current ventures would be handled on taking a seat. */
  currentCommitments: Narrative.nullable().default(null),
  /** A discreet public one-liner, only if the owner agrees. */
  publicLine: Narrative.nullable().default(null),
  notes: Notes,
})

/* ── Downloadable artefacts ─────────────────────────────────────────────── */

export const ARTEFACT_KINDS = [
  "executive-cv",
  "one-page-summary",
  "long-bio",
  "board-bio",
] as const

export const Artefact = strictObject({
  id: Id,
  visibility: Visibility,
  kind: z.enum(ARTEFACT_KINDS),
  title: Text,
  format: z.literal("pdf"),
  /** Grant scope required to download it in Phase 3, e.g. "pdf:exec-cv". */
  requiredScope: Text,
  filename: orPlaceholder(
    z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*\.pdf$/, "a plain .pdf filename"),
  ),
  /** Object key in the private storage bucket (Phase 3/4). */
  storageKey: OptionalText,
  /** Source hash the master PDF was rendered from (drift guard, Phase 4). */
  renderedFromHash: SourceHash.nullable().default(null),
  pages: z.number().int().positive().nullable().default(null),
  words: z.number().int().positive().nullable().default(null),
  notes: Notes,
})

/* ── Leadership matrix ──────────────────────────────────────────────────── */

/**
 * The seat × pillar competency grid (People / Process / Technology for CEO,
 * Chief AI Officer and CTO). Each cell names one competency search firms
 * screen for and the programmes that evidence it. Ratings are strict: only
 * "strong" or "partial" are recorded; a competency without evidence is left
 * out rather than shown as a gap.
 */
export const MATRIX_SEATS = ["CEO", "CAIO", "CTO"] as const
export const MATRIX_PILLARS = ["People", "Process", "Technology"] as const
export const MATRIX_RATINGS = ["strong", "partial"] as const

export const MatrixCell = strictObject({
  id: Id,
  visibility: Visibility,
  seat: z.enum(MATRIX_SEATS),
  pillar: z.enum(MATRIX_PILLARS),
  competency: Text,
  rating: z.enum(MATRIX_RATINGS),
  programmeIds: z.array(Id).default([]),
  /** One line of proof; never names a client unless that name is cleared. */
  proof: OptionalText,
  notes: Notes,
})

/* ── Documents ──────────────────────────────────────────────────────────── */

const collectionShape = {
  matrix: z.array(MatrixCell).default([]),
  proofFigures: z.array(ProofFigure).default([]),
  eras: z.array(Era).default([]),
  roles: z.array(Role).default([]),
  programmes: z.array(Programme).default([]),
  caseStudies: z.array(CaseStudy).default([]),
  themes: z.array(Theme).default([]),
  sectors: z.array(ReachItem).default([]),
  geographies: z.array(ReachItem).default([]),
  boardRoles: z.array(BoardRole).default([]),
  publications: z.array(Publication).default([]),
  talks: z.array(Talk).default([]),
  education: z.array(Education).default([]),
  credentials: z.array(Credential).default([]),
  languages: z.array(Language).default([]),
  artefacts: z.array(Artefact).default([]),
}

export const COLLECTIONS = Object.keys(collectionShape) as Array<
  keyof typeof collectionShape
>
export type CollectionKey = keyof typeof collectionShape

/** profile.yaml, as authored in the private folder. */
export const ProfileSourceSchema = strictObject({
  schemaVersion: z.literal(SCHEMA_VERSION),
  profile: Profile,
  openness: Openness,
  ...collectionShape,
  notes: Notes,
})

/** The data part of an export: single blocks may have been filtered to null. */
export const ExportDataSchema = ProfileSourceSchema.extend({
  profile: Profile.nullable(),
  openness: Openness.nullable(),
})

const exportMeta = {
  sourceHash: SourceHash,
  generatedAt: z.string().datetime(),
}

/** src/content/cv/public.json (committed). */
export const PublicProfileSchema = ExportDataSchema.extend({
  audience: z.literal("public"),
  ...exportMeta,
})

/** <private folder>/build/gated.json (never committed). */
export const GatedProfileSchema = ExportDataSchema.extend({
  audience: z.literal("gated"),
  ...exportMeta,
})

export type ProfileSource = z.infer<typeof ProfileSourceSchema>
export type ProfileSourceInput = z.input<typeof ProfileSourceSchema>
export type ExportData = z.infer<typeof ExportDataSchema>
export type PublicProfile = z.infer<typeof PublicProfileSchema>
export type GatedProfile = z.infer<typeof GatedProfileSchema>

export type ProfileT = z.infer<typeof Profile>
export type ProofFigureT = z.infer<typeof ProofFigure>
export type EraT = z.infer<typeof Era>
export type RoleT = z.infer<typeof Role>
export type OutcomeT = z.infer<typeof Outcome>
export type ProgrammeT = z.infer<typeof Programme>
export type ProgrammeBudgetT = z.infer<typeof ProgrammeBudget>
export type ProgrammeClientT = z.infer<typeof ProgrammeClient>
export type ProgrammeOutcomeT = z.infer<typeof ProgrammeOutcome>
export type CaseStudyT = z.infer<typeof CaseStudy>
export type ThemeT = z.infer<typeof Theme>
export type ReachItemT = z.infer<typeof ReachItem>
export type BoardRoleT = z.infer<typeof BoardRole>
export type PublicationT = z.infer<typeof Publication>
export type TalkT = z.infer<typeof Talk>
export type EducationT = z.infer<typeof Education>
export type CredentialT = z.infer<typeof Credential>
export type LanguageT = z.infer<typeof Language>
export type OpennessT = z.infer<typeof Openness>
export type ArtefactT = z.infer<typeof Artefact>
export type MatrixCellT = z.infer<typeof MatrixCell>
export type EvidenceT = z.infer<typeof Evidence>

/* ── Cross-references ───────────────────────────────────────────────────── */

/** Every `…Id` / `…Ids` field and the collection it points into. */
export const REFERENCE_FIELDS = {
  eraId: "eras",
  roleId: "roles",
  roleIds: "roles",
  programmeId: "programmes",
  programmeIds: "programmes",
  caseStudyIds: "caseStudies",
  themeIds: "themes",
  sectorIds: "sectors",
  geographyIds: "geographies",
} as const satisfies Record<string, CollectionKey>

type ReferenceField = keyof typeof REFERENCE_FIELDS

function isReferenceField(key: string): key is ReferenceField {
  return Object.prototype.hasOwnProperty.call(REFERENCE_FIELDS, key)
}

/* ── Traversal helpers ──────────────────────────────────────────────────── */

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function joinPath(path: string, key: string | number): string {
  if (typeof key === "number") return `${path}[${key}]`
  return path ? `${path}.${key}` : key
}

function walk(
  value: unknown,
  visit: (value: unknown, path: string, key: string | number | null) => void,
  path = "",
  key: string | number | null = null,
): void {
  visit(value, path, key)
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, visit, joinPath(path, i), i))
  } else if (isRecord(value)) {
    for (const [k, v] of Object.entries(value)) walk(v, visit, joinPath(path, k), k)
  }
}

/* ── Visibility filtering ───────────────────────────────────────────────── */

const DROPPED = Symbol("dropped")

function prune(value: unknown, allowed: ReadonlySet<string>): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => prune(v, allowed)).filter((v) => v !== DROPPED)
  }
  if (isRecord(value)) {
    if ("visibility" in value && !allowed.has(String(value.visibility))) {
      return DROPPED
    }
    const out: JsonRecord = {}
    for (const [k, v] of Object.entries(value)) {
      const kept = prune(v, allowed)
      out[k] = kept === DROPPED ? null : kept
    }
    return out
  }
  return value
}

/** Remove references that point at items the audience cannot see. */
function scrubReferences(data: JsonRecord): void {
  const known = new Map<CollectionKey, Set<string>>()
  for (const key of COLLECTIONS) {
    const list = Array.isArray(data[key]) ? (data[key] as unknown[]) : []
    known.set(
      key,
      new Set(
        list
          .filter(isRecord)
          .map((item) => item.id)
          .filter((id): id is string => typeof id === "string"),
      ),
    )
  }
  walk(data, (value) => {
    if (!isRecord(value)) return
    for (const [k, v] of Object.entries(value)) {
      if (!isReferenceField(k)) continue
      const ids = known.get(REFERENCE_FIELDS[k]) ?? new Set<string>()
      if (Array.isArray(v)) {
        value[k] = v.filter((id) => typeof id === "string" && ids.has(id))
      } else if (typeof v === "string" && !ids.has(v)) {
        value[k] = null
      }
    }
  })
}

function filterFor(source: ProfileSource, allowed: readonly Visibility[]): ExportData {
  const pruned = prune(source, new Set(allowed))
  if (!isRecord(pruned)) throw new Error("profile source did not survive filtering")
  scrubReferences(pruned)
  const data = ExportDataSchema.parse(pruned)
  const leaks = findVisibilityViolations(data, allowed)
  if (leaks.length > 0) {
    throw new Error(`visibility filter failed:\n  ${leaks.join("\n  ")}`)
  }
  return data
}

/** Deep: keeps public items only. Gated and private items vanish at any depth. */
export function toPublic(source: ProfileSource): ExportData {
  return filterFor(source, ["public"])
}

/** Deep: keeps public and gated items. Private items vanish at any depth. */
export function toGated(source: ProfileSource): ExportData {
  return filterFor(source, ["public", "gated"])
}

/**
 * Every object carrying a visibility outside `allowed`, and every list item
 * without a visibility at all. Returns human-readable paths.
 */
export function findVisibilityViolations(
  json: unknown,
  allowed: readonly Visibility[],
): string[] {
  const ok = new Set<string>(allowed)
  const problems: string[] = []
  const scan = (value: unknown, path: string, inList: boolean) => {
    if (Array.isArray(value)) {
      value.forEach((v, i) => scan(v, joinPath(path, i), true))
      return
    }
    if (!isRecord(value)) return
    const has = Object.prototype.hasOwnProperty.call(value, "visibility")
    if (has && !ok.has(String(value.visibility))) {
      problems.push(`${path || "(root)"}: visibility "${String(value.visibility)}"`)
      return
    }
    if (!has && inList) {
      problems.push(`${path}: list item without a visibility`)
    }
    for (const [k, v] of Object.entries(value)) scan(v, joinPath(path, k), false)
  }
  scan(json, "", false)
  return problems
}

/** Paths of every non-public item anywhere in `json`. */
export function findNonPublicItems(json: unknown): string[] {
  return findVisibilityViolations(json, ["public"])
}

/** Throws if anything anywhere in `json` is not public. */
export function assertPublicOnly(json: unknown): void {
  const problems = findNonPublicItems(json)
  if (problems.length > 0) {
    const shown = problems.slice(0, 20)
    const more = problems.length > shown.length ? `\n  … and ${problems.length - shown.length} more` : ""
    throw new Error(
      `Non-public material in public profile data (${problems.length}):\n  ${shown.join("\n  ")}${more}`,
    )
  }
}

/** Paths of every placeholder value still in `json`. */
export function findPlaceholders(json: unknown): string[] {
  const paths: string[] = []
  walk(json, (value, path) => {
    if (isPlaceholder(value)) paths.push(path)
  })
  return paths
}

/* ── Integrity (source-level checks zod cannot express) ─────────────────── */

export type IntegrityReport = { errors: string[]; warnings: string[] }

function concreteStart(v: unknown): string | null {
  if (typeof v === "number") return String(v).padStart(4, "0")
  if (typeof v === "string" && /^\d{4}-\d{2}$/.test(v)) return v
  return null
}

export function validateIntegrity(source: ProfileSource): IntegrityReport {
  const errors: string[] = []
  const warnings: string[] = []

  // 1. ids are unique across the whole document
  const seen = new Map<string, string>()
  walk(source, (value, path) => {
    if (!isRecord(value) || typeof value.id !== "string") return
    const first = seen.get(value.id)
    if (first) errors.push(`duplicate id "${value.id}" at ${path} (first at ${first})`)
    else seen.set(value.id, path)
  })

  // 2. references resolve into the right collection
  const ids = new Map<CollectionKey, Set<string>>()
  for (const key of COLLECTIONS) {
    ids.set(key, new Set((source[key] as Array<{ id: string }>).map((i) => i.id)))
  }
  walk(source, (value, path) => {
    if (!isRecord(value)) return
    for (const [k, v] of Object.entries(value)) {
      if (!isReferenceField(k)) continue
      const target = REFERENCE_FIELDS[k]
      const pool = ids.get(target) ?? new Set<string>()
      const refs = Array.isArray(v) ? v : v == null ? [] : [v]
      for (const ref of refs) {
        if (typeof ref !== "string" || !pool.has(ref)) {
          errors.push(`${joinPath(path, k)}: "${String(ref)}" is not an id in ${target}`)
        }
      }
    }
  })

  // 3. ranges and money are coherent
  walk(source, (value, path) => {
    if (!isRecord(value)) return
    if (typeof value.low === "number" && typeof value.high === "number" && value.low > value.high) {
      errors.push(`${path}: low is greater than high`)
    }
    if ("rangeLow" in value || "rangeHigh" in value) {
      const { exact, rangeLow, rangeHigh } = value
      if (exact != null && (rangeLow != null || rangeHigh != null)) {
        errors.push(`${path}: give either exact or rangeLow + rangeHigh, not both`)
      }
      if ((rangeLow == null) !== (rangeHigh == null)) {
        errors.push(`${path}: a range needs both rangeLow and rangeHigh`)
      }
      if (typeof rangeLow === "number" && typeof rangeHigh === "number" && rangeLow > rangeHigh) {
        errors.push(`${path}: rangeLow is greater than rangeHigh`)
      }
    }
  })

  // 4. dates run forwards
  walk(source, (value, path) => {
    if (!isRecord(value) || !("start" in value) || !("end" in value)) return
    const start = concreteStart(value.start)
    const end = concreteStart(value.end)
    if (start && end && start.slice(0, 7) > end.slice(0, 7)) {
      errors.push(`${path}: start ${start} is after end ${end}`)
    }
  })

  // 5. slugs are unique within their collection
  for (const key of ["programmes", "caseStudies"] as const) {
    const slugs = new Set<string>()
    for (const item of source[key]) {
      if (slugs.has(item.slug)) errors.push(`${key}: duplicate slug "${item.slug}"`)
      slugs.add(item.slug)
    }
  }

  // 6. leadership themes link to evidence
  source.themes.forEach((t, i) => {
    if (t.roleIds.length + t.caseStudyIds.length + t.programmeIds.length === 0) {
      errors.push(`themes[${i}] "${t.id}": link at least one role, case study or programme`)
    }
  })

  // 7. programmes: client naming is explicit; decision count; featured count
  source.programmes.forEach((p, i) => {
    const at = `programmes[${i}] "${p.id}"`
    if (p.client) {
      if (!p.client.clientNamed && p.client.name) {
        errors.push(`${at}: client.name is set but clientNamed is false; remove the name or clear naming`)
      }
      if (p.client.clientNamed && !p.client.name) {
        errors.push(`${at}: clientNamed is true but client.name is missing`)
      }
    }
    if (p.narrative && p.narrative.keyDecisions.length < 3) {
      warnings.push(`${at}: ${p.narrative.keyDecisions.length} key decisions (aim for 3 to 5)`)
    }
  })
  const featured = source.programmes.filter((p) => p.featured).length
  if (featured > 5) warnings.push(`${featured} programmes are featured (aim for 3 to 5)`)
  if (source.programmes.length >= 3 && featured < 3) {
    warnings.push(`${featured} programmes are featured (aim for 3 to 5 full case studies)`)
  }

  // 8. discretion defaults
  if (source.profile.visibility !== "public") {
    warnings.push("profile is not public: the teaser will render without a name")
  }
  if (source.openness.visibility === "public") {
    warnings.push("openness is public: target seats and availability would be published")
  }
  if (source.openness.targetSeats.length === 0) {
    errors.push("openness.targetSeats: add at least one target seat")
  }

  return { errors, warnings }
}

/**
 * Client names that `audience` must not see, found anywhere in `output`.
 * A name is confidential for an audience when the stricter of the programme's,
 * the client block's and the name's own visibility is above that audience.
 */
export function findConfidentialNameLeaks(
  source: ProfileSource,
  output: unknown,
  audience: "public" | "gated",
): string[] {
  const ceiling = VISIBILITY_RANK[audience]
  const names: string[] = []
  for (const p of source.programmes) {
    const name = p.client?.name
    if (!p.client || !name) continue
    const effective = [p.visibility, p.client.visibility, name.visibility].reduce(stricterVisibility)
    if (VISIBILITY_RANK[effective] > ceiling && name.text.length >= 3 && !isPlaceholder(name.text)) {
      names.push(name.text)
    }
  }
  const leaks: string[] = []
  if (names.length === 0) return leaks
  walk(output, (value, path) => {
    if (typeof value !== "string") return
    const haystack = value.toLowerCase()
    for (const n of names) {
      if (haystack.includes(n.toLowerCase())) leaks.push(`${path}: contains a confidential client name`)
    }
  })
  return leaks
}
