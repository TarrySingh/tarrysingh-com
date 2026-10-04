import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import { PROFILE_PATHS, PROFILE_ROBOTS, PROFILE_TITLE } from "@/lib/cv/config"
import styles from "./profile.module.css"

/**
 * Executive profile · route layout.
 *
 * Top-level route (outside the (main) group), so it renders no site
 * Navbar, Footer or newsletter peek. Not linked from the navigation and not
 * listed in sitemap.ts: it is shared by direct link. Indexing follows the
 * single PROFILE_INDEXABLE switch in src/lib/cv/config.ts (default: off);
 * the access page and the dossier are never indexed.
 */
const DESCRIPTION =
  "Executive profile of Tarry Singh: career meridian, signature programmes and leadership matrix."

export const metadata: Metadata = {
  title: { default: PROFILE_TITLE, template: `%s · ${PROFILE_TITLE}` },
  description: DESCRIPTION,
  robots: PROFILE_ROBOTS,
  alternates: { canonical: PROFILE_PATHS.root },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: PROFILE_TITLE,
    description: DESCRIPTION,
    url: PROFILE_PATHS.root,
    type: "profile",
  },
}

export default function ExecutiveProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.root}>
      <a href="#main" className={`${styles.skip} no-print`}>
        Skip to content
      </a>
      <nav aria-label="Back to tarrysingh.com" className={`${styles.backNav} no-print`}>
        <Link href="/" className={styles.backLink}>
          <span aria-hidden="true" className={styles.backArrow}>
            ←
          </span>
          <span>tarrysingh.com</span>
        </Link>
      </nav>
      {children}
    </div>
  )
}
