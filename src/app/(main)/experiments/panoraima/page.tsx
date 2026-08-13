import type { Metadata } from "next"
import { readFileSync } from "node:fs"
import path from "node:path"
import PanoraimaDashboard from "@/components/panoraima/PanoraimaDashboard"
import type { TimelineEvent } from "@/lib/panoraima/types"

export const metadata: Metadata = {
  title: "PANORAIMA Consortium Dashboard",
  description:
    "Interactive visualization of the PANORAIMA EU Horizon project, 15 consortium partners across 8 countries, tracked across monthly PMC meetings, worksprints, and local coordinator progress reports.",
}

function loadEvents(): TimelineEvent[] {
  const file = path.join(process.cwd(), "src/lib/panoraima/timeline_data.json")
  const raw = readFileSync(file, "utf-8")
  return JSON.parse(raw) as TimelineEvent[]
}

export default function PanoraimaPage() {
  const events = loadEvents()
  return <PanoraimaDashboard events={events} />
}
