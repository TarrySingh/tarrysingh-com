"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/experiments", label: "Experiments" },
]

const Navbar = () => {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isHeroPage = pathname === "/" || pathname === "/about"

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass border-b border-white/10 shadow-sm"
          : isHeroPage
          ? "bg-transparent"
          : "bg-white/95 backdrop-blur-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span
              className={`text-lg font-semibold tracking-tight transition-colors ${
                scrolled ? "text-navy-900" : isHeroPage ? "text-white" : "text-navy-900"
              }`}
            >
              Tarry Singh
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive =
                link.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.to)
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    isActive
                      ? scrolled
                        ? "text-navy-900 bg-navy-50"
                        : isHeroPage
                        ? "text-white bg-white/15"
                        : "text-navy-900 bg-navy-50"
                      : scrolled
                      ? "text-gray-500 hover:text-navy-900 hover:bg-gray-50"
                      : isHeroPage
                      ? "text-white/70 hover:text-white hover:bg-white/10"
                      : "text-gray-500 hover:text-navy-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <a
              href="https://linkedin.com/in/tarrysingh"
              target="_blank"
              rel="noopener noreferrer"
              className={`ml-3 px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                scrolled || !isHeroPage
                  ? "bg-navy-900 text-white hover:bg-navy-800"
                  : "bg-white/15 text-white border border-white/20 hover:bg-white/25"
              }`}
            >
              Connect
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${
              scrolled || !isHeroPage ? "text-navy-900 hover:bg-gray-100" : "text-white hover:bg-white/10"
            }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-6 pt-2 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-3 space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  link.to === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.to)
                return (
                  <Link
                    key={link.to}
                    href={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? "text-navy-900 bg-navy-50"
                        : "text-gray-500 hover:text-navy-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <a
                href="https://linkedin.com/in/tarrysingh"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-3 text-sm font-semibold text-center rounded-xl bg-navy-900 text-white mt-2"
              >
                Connect
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
