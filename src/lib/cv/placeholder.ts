/**
 * Placeholder convention for the executive profile: `[PLACEHOLDER]` or
 * `[PLACEHOLDER: what goes here]`. Dependency-free so UI code can use it
 * without pulling in the schema.
 */
export const PLACEHOLDER_RE = /^\[PLACEHOLDER(?::[\s\S]*)?\]$/

/**
 * True for a placeholder string. Deliberately not a type guard: narrowing a
 * `string` with it would leave `never` in the other branch.
 */
export function isPlaceholder(value: unknown): boolean {
  return typeof value === "string" && PLACEHOLDER_RE.test(value)
}
