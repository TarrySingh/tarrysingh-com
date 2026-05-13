#!/usr/bin/env node
/**
 * npm run blog:promote <slug>
 *
 * Promotes a draft from content/blog/_drafts/<slug>.mdx to
 * content/blog/<slug>.mdx, performing:
 *
 *   1. blog:audit must pass (error count = 0)
 *   2. Sets draft: false in frontmatter
 *   3. Updates date: to today (if --keep-date isn't passed)
 *   4. Moves the file via git mv (so history follows)
 *   5. Runs `npm run build` to catch any compilation regressions
 *      against the new live tree
 *   6. Prints the next-steps cheat-sheet for git push + LinkedIn
 *      syndication
 *
 * Does NOT auto-commit or auto-push. The author reviews the
 * diff in `git status` first.
 */

import { readFile, writeFile, access, rename } from "node:fs/promises"
import { spawn } from "node:child_process"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..", "..")
const DRAFTS_DIR = join(ROOT, "content", "blog", "_drafts")
const LIVE_DIR = join(ROOT, "content", "blog")

const RED = (s) => `\x1b[31m${s}\x1b[0m`
const GRN = (s) => `\x1b[32m${s}\x1b[0m`
const YEL = (s) => `\x1b[33m${s}\x1b[0m`
const DIM = (s) => `\x1b[2m${s}\x1b[0m`
const BOLD = (s) => `\x1b[1m${s}\x1b[0m`

async function fileExists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function runStream(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { stdio: "inherit", cwd: ROOT, ...opts })
    proc.on("error", reject)
    proc.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(" ")} exited ${code}`))))
  })
}

function updateFrontmatter(raw, { draft, date }) {
  if (!raw.startsWith("---\n")) return raw
  const end = raw.indexOf("\n---\n", 4)
  if (end < 0) return raw
  let fm = raw.slice(4, end)
  if (draft !== undefined) {
    if (/^draft:\s*.*/m.test(fm)) {
      fm = fm.replace(/^draft:\s*.*/m, `draft: ${draft}`)
    } else {
      fm = fm.trimEnd() + `\ndraft: ${draft}\n`
    }
  }
  if (date !== undefined) {
    if (/^date:\s*.*/m.test(fm)) {
      fm = fm.replace(/^date:\s*.*/m, `date: "${date}"`)
    } else {
      fm = `date: "${date}"\n` + fm
    }
  }
  return `---\n${fm}\n---\n` + raw.slice(end + 5)
}

async function main() {
  const args = process.argv.slice(2)
  const slug = args[0]?.trim()
  const keepDate = args.includes("--keep-date")
  const skipBuild = args.includes("--skip-build")

  if (!slug) {
    console.error("usage: npm run blog:promote <slug> [--keep-date] [--skip-build]")
    process.exit(2)
  }

  const draftPath = join(DRAFTS_DIR, `${slug}.mdx`)
  const livePath = join(LIVE_DIR, `${slug}.mdx`)

  if (!(await fileExists(draftPath))) {
    console.error(RED(`✗ no draft at content/blog/_drafts/${slug}.mdx`))
    console.error("  run `npm run blog:new <slug>` first.")
    process.exit(2)
  }
  if (await fileExists(livePath)) {
    console.error(RED(`✗ a published Dispatch already exists at content/blog/${slug}.mdx`))
    console.error("  pick another slug or delete the existing file.")
    process.exit(2)
  }

  // 1. audit
  console.log(BOLD("1. running audit…"))
  console.log("")
  try {
    await runStream(process.execPath, [join(__dirname, "audit.mjs"), slug])
  } catch {
    console.error(RED("✗ audit failed — fix the errors above before promoting"))
    process.exit(1)
  }

  // 2 + 3. update frontmatter
  console.log("")
  console.log(BOLD(`2. patching frontmatter (draft: false${keepDate ? "" : `, date: ${todayIso()}`})…`))
  const raw = await readFile(draftPath, "utf8")
  const patched = updateFrontmatter(raw, {
    draft: false,
    date: keepDate ? undefined : todayIso(),
  })
  await writeFile(draftPath, patched, "utf8")

  // 4. git mv
  console.log(BOLD("3. moving draft → live…"))
  try {
    await runStream("git", ["mv", draftPath, livePath])
  } catch {
    // Fall back to plain rename if not in a git repo or the file isn't tracked.
    console.log(DIM("   git mv failed; falling back to fs rename (file may not be git-tracked yet)"))
    await rename(draftPath, livePath)
  }

  // 5. build
  if (!skipBuild) {
    console.log(BOLD("4. running build (catches any MDX/typecheck regressions)…"))
    try {
      await runStream("npm", ["run", "build"])
    } catch {
      console.error(RED("✗ build failed — file is moved but the tree won't compile. Fix and re-run `npm run build`."))
      process.exit(1)
    }
  } else {
    console.log(YEL("4. skipping build (--skip-build)"))
  }

  // 6. cheat sheet
  console.log("")
  console.log(GRN(`✓ ${slug} is promoted and the tree builds cleanly.`))
  console.log("")
  console.log(BOLD("next:"))
  console.log("")
  console.log(`  git add content/blog/${slug}.mdx`)
  console.log(`  git commit -m "feat(blog): publish ${slug}"`)
  console.log(`  git push origin <branch>     # or merge to main`)
  console.log("")
  console.log(DIM("when production is live (~90 s after push to main):"))
  console.log("")
  console.log(`  # smoke-test the route renders`)
  console.log(`  curl -sI https://www.tarrysingh.com/blog/${slug} | head -3`)
  console.log("")
  console.log(`  # syndicate to LinkedIn (only when LINKEDIN_* env vars are set in Vercel):`)
  console.log(`  curl -X POST https://www.tarrysingh.com/api/integrations/linkedin/preview \\`)
  console.log(`    -H "X-Tarrysingh-Admin-Token: $LINKEDIN_ADMIN_TOKEN" \\`)
  console.log(`    -H "Content-Type: application/json" \\`)
  console.log(`    -d '{"slug":"${slug}"}'`)
  console.log("")
  console.log(`  # (review the preview text, then fire the real syndication:)`)
  console.log(`  curl -X POST https://www.tarrysingh.com/api/integrations/linkedin/syndicate \\`)
  console.log(`    -H "X-Tarrysingh-Admin-Token: $LINKEDIN_ADMIN_TOKEN" \\`)
  console.log(`    -H "Content-Type: application/json" \\`)
  console.log(`    -d '{"slug":"${slug}"}'`)
  console.log("")
}

main().catch((err) => {
  console.error(RED("promote crashed:"), err)
  process.exit(2)
})
