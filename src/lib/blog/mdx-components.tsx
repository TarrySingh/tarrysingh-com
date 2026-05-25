import type { ComponentPropsWithoutRef, ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { highlight } from "./shiki"
import { MermaidDiagram } from "@/components/blog/MermaidDiagram"

function flatten(node: ReactNode): string {
  if (node == null || node === false) return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(flatten).join("")
  if (typeof node === "object" && "props" in (node as object)) {
    const p = (node as { props?: { children?: ReactNode } }).props
    if (p && "children" in p) return flatten(p.children)
  }
  return ""
}

function H1(props: ComponentPropsWithoutRef<"h1">) {
  return (
    <h1
      {...props}
      className="font-display text-3xl md:text-4xl text-navy-900 tracking-tight mb-6 mt-12 first:mt-0"
      style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
    />
  )
}

function H2(props: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      {...props}
      className="font-display text-2xl md:text-3xl text-navy-900 tracking-tight mt-12 mb-4 scroll-mt-24"
      style={{ fontFamily: "var(--font-display), 'Gloock', serif" }}
    />
  )
}

function H3(props: ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      {...props}
      className="font-serif text-xl md:text-2xl text-navy-900 font-semibold mt-10 mb-3 scroll-mt-24"
      style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
    />
  )
}

function P(props: ComponentPropsWithoutRef<"p">) {
  return (
    <p
      {...props}
      className="font-serif text-[1.05rem] leading-[1.85] text-navy-800 mb-6"
      style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
    />
  )
}

function A(props: ComponentPropsWithoutRef<"a">) {
  const { href = "#", children, ...rest } = props
  const isInternal = href.startsWith("/") || href.startsWith("#")
  if (isInternal) {
    return (
      <Link
        href={href}
        className="text-gold-700 underline decoration-gold-300 decoration-2 underline-offset-4 hover:decoration-gold-500 transition-colors"
        {...rest}
      >
        {children}
      </Link>
    )
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gold-700 underline decoration-gold-300 decoration-2 underline-offset-4 hover:decoration-gold-500 transition-colors"
      {...rest}
    >
      {children}
    </a>
  )
}

function Blockquote(props: ComponentPropsWithoutRef<"blockquote">) {
  return (
    <blockquote
      {...props}
      className="border-l-2 border-gold-400 pl-6 my-8 font-serif italic text-navy-700 text-[1.05rem] leading-[1.8]"
      style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
    />
  )
}

function UL(props: ComponentPropsWithoutRef<"ul">) {
  return (
    <ul
      {...props}
      className="font-serif text-[1.05rem] leading-[1.85] text-navy-800 mb-6 list-disc list-outside pl-6 space-y-2"
      style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
    />
  )
}

function OL(props: ComponentPropsWithoutRef<"ol">) {
  return (
    <ol
      {...props}
      className="font-serif text-[1.05rem] leading-[1.85] text-navy-800 mb-6 list-decimal list-outside pl-6 space-y-2"
      style={{ fontFamily: "var(--font-serif), 'IBM Plex Serif', serif" }}
    />
  )
}

function HR(props: ComponentPropsWithoutRef<"hr">) {
  return (
    <hr
      {...props}
      className="my-12 border-0 h-px bg-gradient-to-r from-transparent via-gold-300/50 to-transparent"
    />
  )
}

function InlineCode(props: ComponentPropsWithoutRef<"code">) {
  return (
    <code
      {...props}
      className="font-mono text-[0.9em] px-1.5 py-0.5 rounded bg-navy-50 text-navy-900 border border-navy-100"
      style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
    />
  )
}

async function Pre(props: ComponentPropsWithoutRef<"pre">) {
  const { children } = props
  if (
    children &&
    typeof children === "object" &&
    "props" in (children as object)
  ) {
    const child = children as {
      props?: { className?: string; children?: ReactNode }
    }
    const className = child.props?.className ?? ""
    const lang = className.replace(/^language-/, "") || "text"
    const code = flatten(child.props?.children).replace(/\n$/, "")
    // Mermaid fenced blocks render as diagrams, not syntax-highlighted code.
    // The first line of the source can optionally be `%% caption: ...` and
    // we'll lift it out as the figcaption (one-sentence italic below the
    // diagram, per Sprint 10 rules).
    if (lang === "mermaid") {
      const captionMatch = code.match(/^%%\s*caption:\s*(.+?)\s*$/m)
      const caption = captionMatch ? captionMatch[1] : undefined
      const cleaned = captionMatch
        ? code.replace(captionMatch[0], "").replace(/^\n+/, "")
        : code
      return <MermaidDiagram code={cleaned} caption={caption} />
    }
    const html = await highlight(code, lang)
    return (
      <div
        className="my-8 rounded-xl border border-navy-100 overflow-hidden text-[0.92rem] leading-[1.55] [&_pre]:!p-5 [&_pre]:overflow-x-auto [&_pre]:!bg-[#f8f7f3] [&_code]:font-mono"
        style={{ fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }
  return <pre {...props} />
}

function Img(props: ComponentPropsWithoutRef<"img">) {
  const { src, alt = "", width, height } = props
  if (typeof src !== "string" || !src) return null
  const w = typeof width === "number" ? width : Number(width) || 1200
  const h = typeof height === "number" ? height : Number(height) || 675
  return (
    <span className="block my-10">
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        className="rounded-xl border border-navy-100 w-full h-auto"
      />
      {alt ? (
        <span
          className="block mt-3 text-center font-mono text-xs tracking-[0.18em] uppercase text-navy-400"
          style={{
            fontFamily: "var(--font-mono), 'IBM Plex Mono', monospace",
          }}
        >
          {alt}
        </span>
      ) : null}
    </span>
  )
}

export const mdxComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  a: A,
  blockquote: Blockquote,
  ul: UL,
  ol: OL,
  hr: HR,
  code: InlineCode,
  pre: Pre,
  img: Img,
}
