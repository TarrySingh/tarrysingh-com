import PanoraimaSessionBar from "@/components/panoraima/PanoraimaSessionBar"

/**
 * Wraps every dashboard page so the sign-out control is available throughout
 * without each page having to render it. The bar hides itself on the login
 * page.
 */
export default function PanoraimaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <PanoraimaSessionBar />
    </>
  )
}
