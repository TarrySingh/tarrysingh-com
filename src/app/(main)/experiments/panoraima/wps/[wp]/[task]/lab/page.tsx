import type { Metadata } from "next"
import { readFileSync, existsSync } from "node:fs"
import path from "node:path"
import { notFound } from "next/navigation"
import LabView from "@/components/panoraima/wps/wp4/mc102/lab/LabView"
import type { MC102Graph } from "@/lib/panoraima/types"

export const metadata: Metadata = {
  title: "Argument Mining Lab · MC-102 · PANORAIMA",
  description:
    "The Paks II debate as an argument graph: who claimed what, when, and where the two camps actually met.",
  robots: { index: false, follow: false },
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ wp: string; task: string }>
}) {
  const { wp, task } = await params
  if (wp !== "wp4" || task !== "mc-102") notFound()
  const fp = path.join(process.cwd(), "src/lib/panoraima/mc102_graph.json")
  if (!existsSync(fp)) notFound()
  const graph = JSON.parse(readFileSync(fp, "utf-8")) as MC102Graph
  return <LabView graph={graph} />
}
