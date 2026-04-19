import type { Metadata } from "next"
import { readFileSync } from "node:fs"
import path from "node:path"
import WorkPackagesHub from "@/components/panoraima/wps/WorkPackagesHub"
import type { WpHubMeta } from "@/lib/panoraima/types"

export const metadata: Metadata = {
  title: "Work Packages · PANORAIMA",
  description:
    "Deep-dive dashboards for each PANORAIMA work package: WP2 Market & Needs, WP3 Competences, WP4 Curriculum, WP5 QA, WP6 Ethics, WP7 Dissemination.",
}

function loadMeta(): WpHubMeta {
  const file = path.join(process.cwd(), "src/lib/panoraima/wps_meta.json")
  return JSON.parse(readFileSync(file, "utf-8")) as WpHubMeta
}

export default function WorkPackagesHubPage() {
  const meta = loadMeta()
  return <WorkPackagesHub meta={meta} />
}
