#!/usr/bin/env node
/**
 * Sprint — auto-publish pipeline. Local Mac watcher that picks up
 * daily articles from Tarry's Claude-Cowork scheduled task and POSTs
 * each new .md file to the studio's ingest endpoint.
 *
 * Designed to run under a LaunchAgent (see
 * docs/runbooks/com.tarrysingh.studio.blog-watch.plist.example) so
 * it starts at login and auto-restarts on crash.
 *
 * Loop:
 *   1. Read state file (~/.tarrysingh-watch-state.json) for last-seen mtime.
 *   2. Scan the watch directory for .md files newer than that mtime.
 *   3. For each new file:
 *      a. Read content as UTF-8.
 *      b. Build payload: { filename, content, timestamp: Date.now() }.
 *      c. Sign with STUDIO_INGEST_SECRET → X-Ingest-Signature.
 *      d. POST to STUDIO_INGEST_URL with that header.
 *      e. Log the response.
 *      f. Update state file with the new high-water mtime.
 *   4. Sleep STUDIO_WATCH_INTERVAL_SECONDS (default 60).
 *
 * Idempotent — the ingest endpoint returns 409 if the slug already
 * exists in studio_drafts, which is treated as "ok, already ingested"
 * here. The state file is the primary mechanism but is belt-and-braces.
 *
 * Env (read from STUDIO_WATCH_ENV_FILE or the process env):
 *   STUDIO_INGEST_URL              required — full https URL of the route
 *   STUDIO_INGEST_SECRET           required — HMAC shared with Vercel
 *   STUDIO_WATCH_DIR               default ~/Documents/Claude/Projects/Tarry-Blogs
 *   STUDIO_WATCH_INTERVAL_SECONDS  default 60
 *   STUDIO_WATCH_STATE_FILE        default ~/.tarrysingh-watch-state.json
 */

import { readdir, readFile, stat, writeFile, access } from "node:fs/promises"
import { existsSync, readFileSync } from "node:fs"
import { join, basename } from "node:path"
import { homedir } from "node:os"
import { createHmac } from "node:crypto"

const DEFAULT_WATCH_DIR = join(homedir(), "Documents", "Claude", "Projects", "Tarry-Blogs")
const DEFAULT_STATE_FILE = join(homedir(), ".tarrysingh-watch-state.json")
const DEFAULT_INTERVAL = 60

// Only files whose basename starts with `YYYY-MM-DD_` are daily-article
// candidates. Anything else in the watch dir (`scheduled-blog-prompt.md`,
// `README.md`, scratch notes the LaunchAgent shouldn't autopublish) is
// skipped at the scan stage so it never gets a draft + email.
const DATED_ARTICLE_RE = /^\d{4}-\d{2}-\d{2}_[a-z0-9][a-z0-9-]*\.mdx?$/i

function loadEnvFile() {
  const path = process.env.STUDIO_WATCH_ENV_FILE
  if (!path) return
  if (!existsSync(path)) return
  const raw = readFileSync(path, "utf8")
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (!m) continue
    if (process.env[m[1]] !== undefined) continue // existing env wins
    let v = m[2]
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    process.env[m[1]] = v
  }
}

function readState(path) {
  try {
    const raw = readFileSync(path, "utf8")
    const data = JSON.parse(raw)
    return {
      lastMtimeMs: typeof data.lastMtimeMs === "number" ? data.lastMtimeMs : 0,
      seenFiles: Array.isArray(data.seenFiles) ? new Set(data.seenFiles) : new Set(),
    }
  } catch {
    return { lastMtimeMs: 0, seenFiles: new Set() }
  }
}

async function writeState(path, state) {
  await writeFile(
    path,
    JSON.stringify(
      {
        lastMtimeMs: state.lastMtimeMs,
        seenFiles: Array.from(state.seenFiles),
        savedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf8",
  )
}

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir).catch(() => [])
  const results = []
  for (const name of entries) {
    if (!name.endsWith(".md") && !name.endsWith(".mdx")) continue
    if (name.startsWith(".") || name.startsWith("_")) continue
    // Hard gate: only `YYYY-MM-DD_kebab.md(x)` is a real daily article.
    // Catches the Claude-Cowork prompt file, README scratch, anything
    // that drops into the watch dir without the date prefix.
    if (!DATED_ARTICLE_RE.test(name)) continue
    const full = join(dir, name)
    const s = await stat(full).catch(() => null)
    if (!s || !s.isFile()) continue
    results.push({ name, full, mtimeMs: s.mtimeMs })
  }
  return results.sort((a, b) => a.mtimeMs - b.mtimeMs)
}

async function postIngest({ url, secret, filename, content }) {
  const body = JSON.stringify({
    filename,
    content,
    timestamp: Date.now(),
  })
  const signature = createHmac("sha256", secret).update(body, "utf8").digest("hex")
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-ingest-signature": signature,
    },
    body,
  })
  const text = await res.text().catch(() => "")
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  return { status: res.status, json }
}

function log(level, msg, extra) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    msg,
    ...(extra ? extra : {}),
  })
  // LaunchAgent captures stdout/stderr; one JSON per line keeps logs greppable.
  if (level === "error") {
    process.stderr.write(line + "\n")
  } else {
    process.stdout.write(line + "\n")
  }
}

async function tick({ url, secret, watchDir, statePath }) {
  if (!existsSync(watchDir)) {
    log("warn", "watch_dir_missing", { watchDir })
    return
  }
  const state = readState(statePath)
  const files = await listMarkdownFiles(watchDir)
  let newHighWater = state.lastMtimeMs
  let processedAny = false
  for (const f of files) {
    if (f.mtimeMs <= state.lastMtimeMs) continue
    if (state.seenFiles.has(f.name)) continue
    log("info", "ingest_attempt", { filename: f.name, mtimeMs: f.mtimeMs })
    let content
    try {
      content = await readFile(f.full, "utf8")
    } catch (err) {
      log("error", "read_failed", { filename: f.name, error: String(err) })
      continue
    }
    try {
      const res = await postIngest({ url, secret, filename: f.name, content })
      if (res.status >= 200 && res.status < 300) {
        log("info", "ingest_ok", {
          filename: f.name,
          status: res.status,
          slug: res.json.slug,
          emailId: res.json.emailId,
        })
        state.seenFiles.add(f.name)
        if (f.mtimeMs > newHighWater) newHighWater = f.mtimeMs
        processedAny = true
      } else if (res.status === 409) {
        log("info", "ingest_already_exists", {
          filename: f.name,
          slug: res.json.slug,
        })
        // Treat as success for state-tracking purposes.
        state.seenFiles.add(f.name)
        if (f.mtimeMs > newHighWater) newHighWater = f.mtimeMs
        processedAny = true
      } else {
        log("error", "ingest_failed", {
          filename: f.name,
          status: res.status,
          body: res.json,
        })
        // Don't mark as seen — try again next tick.
      }
    } catch (err) {
      log("error", "ingest_exception", {
        filename: f.name,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }
  if (processedAny) {
    state.lastMtimeMs = newHighWater
    await writeState(statePath, state).catch((err) =>
      log("error", "state_write_failed", { error: String(err) }),
    )
  }
}

async function main() {
  loadEnvFile()
  const url = process.env.STUDIO_INGEST_URL
  const secret = process.env.STUDIO_INGEST_SECRET
  const watchDir = process.env.STUDIO_WATCH_DIR || DEFAULT_WATCH_DIR
  const statePath = process.env.STUDIO_WATCH_STATE_FILE || DEFAULT_STATE_FILE
  const interval = Math.max(
    10,
    Number(process.env.STUDIO_WATCH_INTERVAL_SECONDS) || DEFAULT_INTERVAL,
  )

  if (!url) {
    log("error", "missing_env", { var: "STUDIO_INGEST_URL" })
    process.exit(2)
  }
  if (!secret) {
    log("error", "missing_env", { var: "STUDIO_INGEST_SECRET" })
    process.exit(2)
  }

  log("info", "watcher_start", { watchDir, url, intervalSeconds: interval })

  // Run forever — LaunchAgent's KeepAlive handles any unexpected exit.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await tick({ url, secret, watchDir, statePath })
    } catch (err) {
      log("error", "tick_failed", {
        error: err instanceof Error ? err.message : String(err),
      })
    }
    await new Promise((r) => setTimeout(r, interval * 1000))
  }
}

main().catch((err) => {
  log("error", "fatal", { error: err instanceof Error ? err.message : String(err) })
  process.exit(1)
})

// Unused import warning suppression (basename + access are kept for future use).
void basename
void access
