import { codeToHtml, type BundledLanguage, type BundledTheme } from "shiki"

const LIGHT_THEME: BundledTheme = "github-light"
const DARK_THEME: BundledTheme = "github-dark"

const KNOWN_LANGS = new Set<string>([
  "ts",
  "tsx",
  "js",
  "jsx",
  "json",
  "bash",
  "sh",
  "shell",
  "zsh",
  "yaml",
  "yml",
  "css",
  "scss",
  "html",
  "md",
  "mdx",
  "python",
  "py",
  "go",
  "rust",
  "sql",
  "diff",
  "text",
  "plaintext",
])

function normalize(lang?: string): BundledLanguage {
  if (!lang) return "text" as BundledLanguage
  const l = lang.toLowerCase()
  if (KNOWN_LANGS.has(l)) return l as BundledLanguage
  return "text" as BundledLanguage
}

export async function highlight(code: string, lang?: string): Promise<string> {
  const language = normalize(lang)
  return codeToHtml(code, {
    lang: language,
    themes: { light: LIGHT_THEME, dark: DARK_THEME },
    defaultColor: "light",
  })
}
