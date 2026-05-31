/**
 * Sprint 8 — content-file serializer.
 *
 * The Synaptic plates render from hand-authored `.ts` modules in
 * `src/lib/synaptic/` (e.g. `chipplate-data.ts`). The studio editor lets
 * Tarry edit the *copy* in those modules; Publish has to write the edited
 * values back into the same file **without disturbing the code-owned parts**
 * (type declarations, geometry constants, compute functions).
 *
 * Rather than regenerate a whole file from a template — which would duplicate,
 * and eventually drift from, the plate's code — we do **surgical replacement**:
 * locate one `export const <NAME>` initializer and swap only its value
 * expression, leaving every other byte of the file identical. A plate file can
 * therefore keep evolving its code freely; we only ever touch the named
 * editable exports.
 *
 * All functions here are pure string transforms with no IO — trivially testable
 * (see `serialize.test.ts`).
 */

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Walk a string literal starting at the opening quote; return the index just
 *  after the closing quote. Honours backslash escapes. Treats `'`, `"` and
 *  backtick alike (plate copy never uses `${}` interpolation). */
function scanStringLiteral(src: string, start: number): number {
  const quote = src[start]
  let i = start + 1
  while (i < src.length) {
    const c = src[i]
    if (c === "\\") {
      i += 2
      continue
    }
    if (c === quote) return i + 1
    i += 1
  }
  throw new Error("serialize: unterminated string literal")
}

/** Walk a bracketed expression (`[...]` or `{...}`) starting at the opening
 *  delimiter; return the index just after the matching close. Skips over string
 *  literals and `//` / block comments so delimiters inside them don't count. */
function scanBracketed(src: string, start: number): number {
  let depth = 0
  let i = start
  while (i < src.length) {
    const c = src[i]
    if (c === '"' || c === "'" || c === "`") {
      i = scanStringLiteral(src, i)
      continue
    }
    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i += 1
      continue
    }
    if (c === "/" && src[i + 1] === "*") {
      i += 2
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i += 1
      i += 2
      continue
    }
    if (c === "[" || c === "{") depth += 1
    else if (c === "]" || c === "}") {
      depth -= 1
      if (depth === 0) return i + 1
    }
    i += 1
  }
  throw new Error("serialize: unterminated bracketed expression")
}

/**
 * Find the `[start, end)` byte range of the **initializer value** of
 * `export const <name> = <value>` — i.e. just the `<value>`, excluding any
 * `: Type` annotation, the `=`, and a trailing `;`. Returns null if the export
 * isn't present.
 */
export function findExportInitializer(
  src: string,
  name: string,
): [number, number] | null {
  const re = new RegExp(
    `(^|\\n)[ \\t]*export[ \\t]+const[ \\t]+${escapeRegExp(name)}\\b`,
  )
  const m = re.exec(src)
  if (!m) return null

  // Advance to the assignment '='. A `const` decl's only top-level '=' is the
  // assignment; a `: Type` annotation uses `<>`/`|`/`&` but never '='.
  let i = m.index + m[0].length
  while (i < src.length && src[i] !== "=") i += 1
  if (i >= src.length) return null
  i += 1 // past '='

  while (i < src.length && /\s/.test(src[i])) i += 1 // skip ws + newlines
  const valStart = i
  const ch = src[i]
  let valEnd: number
  if (ch === '"' || ch === "'" || ch === "`") {
    valEnd = scanStringLiteral(src, i)
  } else if (ch === "[" || ch === "{") {
    valEnd = scanBracketed(src, i)
  } else {
    // primitive: number / boolean / identifier — run to ';' or end of line
    let j = i
    while (j < src.length && src[j] !== ";" && src[j] !== "\n") j += 1
    valEnd = j
  }
  return [valStart, valEnd]
}

/**
 * Replace the initializer of `export const <name>` with `valueText` (already
 * rendered TS source). Throws if the export isn't found — Publish must fail
 * loudly rather than silently no-op.
 */
export function replaceExportInitializer(
  src: string,
  name: string,
  valueText: string,
): string {
  const range = findExportInitializer(src, name)
  if (!range) {
    throw new Error(`serialize: export const ${name} not found`)
  }
  const [start, end] = range
  return src.slice(0, start) + valueText + src.slice(end)
}

type TsValue =
  | string
  | number
  | boolean
  | null
  | TsValue[]
  | { [k: string]: TsValue | undefined }

interface TsLiteralOpts {
  /** Render small all-primitive objects on one line (e.g. `{ x: 1, y: 2 }`). */
  inlineSmallObjects?: boolean
  /** Max keys for an inlined object (default 2). */
  inlineMaxKeys?: number
  /** Render small all-primitive arrays on one line (e.g. `[-10, 20, 60, -30]`). */
  inlineSmallArrays?: boolean
  /** Max items for an inlined array (default 6). */
  inlineMaxItems?: number
  /** Indent unit (default two spaces). */
  indentUnit?: string
}

const IDENT_RE = /^[A-Za-z_$][\w$]*$/

function isPrimitive(v: unknown): boolean {
  return (
    v === null ||
    typeof v === "string" ||
    typeof v === "number" ||
    typeof v === "boolean"
  )
}

function renderKey(k: string): string {
  return IDENT_RE.test(k) ? k : JSON.stringify(k)
}

/**
 * Render a JSON-safe JS value as TypeScript **source-literal** text matching the
 * hand-authored style of the plate files: two-space indent, trailing commas,
 * bare identifier keys, double-quoted strings (`JSON.stringify`, so Unicode
 * such as `·`/`—` stays literal and quotes/backslashes are escaped). `undefined`
 * object values are dropped so optional fields don't emit `key: undefined`.
 */
export function tsLiteral(
  value: TsValue,
  opts: TsLiteralOpts = {},
  level = 0,
): string {
  const unit = opts.indentUnit ?? "  "
  const pad = unit.repeat(level)
  const padIn = unit.repeat(level + 1)

  if (value === null) return "null"
  if (typeof value === "string") return JSON.stringify(value)
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]"
    if (
      opts.inlineSmallArrays &&
      value.length <= (opts.inlineMaxItems ?? 6) &&
      value.every((v) => isPrimitive(v))
    ) {
      return `[${value.map((v) => tsLiteral(v as TsValue, opts, 0)).join(", ")}]`
    }
    const items = value
      .map((v) => `${padIn}${tsLiteral(v as TsValue, opts, level + 1)},`)
      .join("\n")
    return `[\n${items}\n${pad}]`
  }

  // plain object
  const entries = Object.entries(value).filter(([, v]) => v !== undefined) as [
    string,
    TsValue,
  ][]
  if (entries.length === 0) return "{}"

  if (
    opts.inlineSmallObjects &&
    entries.length <= (opts.inlineMaxKeys ?? 2) &&
    entries.every(([, v]) => isPrimitive(v))
  ) {
    const inner = entries
      .map(([k, v]) => `${renderKey(k)}: ${tsLiteral(v, opts, 0)}`)
      .join(", ")
    return `{ ${inner} }`
  }

  const body = entries
    .map(([k, v]) => `${padIn}${renderKey(k)}: ${tsLiteral(v, opts, level + 1)},`)
    .join("\n")
  return `{\n${body}\n${pad}}`
}

export type { TsValue, TsLiteralOpts }
