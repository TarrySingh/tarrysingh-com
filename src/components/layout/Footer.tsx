"use client"

import Link from "next/link"

const Footer = () => {
  return (
    <footer className="relative bg-navy-900 text-white overflow-hidden">
      {/* Subtle gradient orbs */}
      <div className="mesh-gradient w-[500px] h-[500px] bg-gold-500/5 -top-48 -right-48" />
      <div className="mesh-gradient w-[400px] h-[400px] bg-blue-500/5 -bottom-32 -left-32" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand column */}
          <div className="md:col-span-5">
            <div className="flex items-center space-x-3 mb-5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">TS</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Tarry Singh
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-sm">
              Entrepreneur, technologist, and AI strategist with 30 years of
              experience transforming industries through technology and innovation.
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 md:col-start-7">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-4">
              Navigate
            </h3>
            <ul className="space-y-3">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About" },
                { to: "/experiments", label: "Experiments" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    href={link.to}
                    className="text-sm text-white/60 hover:text-gold-400 transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/30 mb-4">
              Connect
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://linkedin.com/in/tarrysingh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-gold-400 transition-colors duration-300"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/TarrySingh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-gold-400 transition-colors duration-300"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Tarry Singh. All rights reserved.
          </p>
          <p className="text-xs text-white/30">
            Built with precision and purpose.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
