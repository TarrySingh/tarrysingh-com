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
 * single PROFILE_INDEXABLE switch in src/lib/cv/config.ts (default: off).
 * Middleware does not match this route, so no cookies are set here.
 */
export const metadata: Metadata = {
  title: { default: PROFILE_TITLE, template: `%s · ${PROFILE_TITLE}` },
  description: "Executive profile of Tarry Singh.",
  robots: PROFILE_ROBOTS,
  alternates: { canonical: PROFILE_PATHS.root },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    title: PROFILE_TITLE,
    description: "Executive profile of Tarry Singh.",
    url: PROFILE_PATHS.root,
    type: "profile",
  },
}

export default function ExecutiveProfileLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className={styles.root}>
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
