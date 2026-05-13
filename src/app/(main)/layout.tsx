import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import { NewsletterPeek } from "@/components/blog/NewsletterPeek"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      {/* Studio peek — appears bottom-right after ~1.2 viewport heights
          scrolled. Self-dismissing, 30-day localStorage memory. Studio
          aesthetic, no character, no illustration. */}
      <NewsletterPeek />
    </>
  )
}
