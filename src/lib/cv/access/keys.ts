/**
 * Executive profile · storage key hygiene (pure).
 *
 * Master PDFs live in the private bucket under "pdf/<file>.pdf". An
 * artefact's storageKey may be written "pdf/<file>.pdf" or "<file>.pdf";
 * anything else (paths, traversal, odd characters) is refused.
 */

const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,120}\.pdf$/

/** The bare file name for a storage key, or null when it is not acceptable. */
export function pdfFileName(storageKey: unknown): string | null {
  if (typeof storageKey !== "string") return null
  const name = storageKey.startsWith("pdf/") ? storageKey.slice(4) : storageKey
  if (!NAME_RE.test(name) || name.includes("..")) return null
  return name
}
