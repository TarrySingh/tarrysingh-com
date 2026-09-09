import fs from "node:fs"
import path from "node:path"
import manifest from "../../../../docs/plans/intelligence-without-permission/production-manifest.json"

const directory = path.join(process.cwd(), "content/synaptic/intelligence-without-permission")

/** Count authored narrative, excluding figure markup, source notes and Markdown syntax. */
export function countNarrative(source: string) {
  const prose = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<Figure\s[^>]*\/>/g, "")
    .replace(/<Source\s[^>]*\/>/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/^#{1,6}\s.+$/gm, "")
  return (prose.match(/[\p{L}\p{N}]+(?:[’'−-][\p{L}\p{N}]+)*/gu) || []).length
}

export function getManuscript() {
  const chapters = manifest.chapters.flatMap(chapter => {
    const file = path.join(directory, `${chapter.id}.mdx`)
    if (!fs.existsSync(file)) return []
    const source = fs.readFileSync(file, "utf8")
    return [{ ...chapter, source, words: countNarrative(source) }]
  })
  return {
    chapters,
    figures: manifest.figures.map(({ id, title, dimension }) => ({ id, title, dimension })),
    words: chapters.reduce((sum, chapter) => sum + chapter.words, 0),
    figureCount: chapters.reduce((sum, chapter) => sum + (chapter.source.match(/<Figure\s/g) || []).length, 0),
  }
}
