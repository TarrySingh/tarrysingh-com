"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/jobs/theme";

const NAV_ITEMS = [
  { href: "/jobs", label: "Overview" },
  { href: "/jobs/industry", label: "Industry" },
  { href: "/jobs/agentic", label: "Agentic vs Human" },
  { href: "/jobs/compare", label: "Compare" },
  { href: "/jobs/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className={`${isDark ? "bg-[#1a1a2e] border-white/10" : "bg-white border-gray-200"} border-b sticky top-0 z-40`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/jobs" className="flex items-center gap-2">
            <span className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>EuroJobs</span>
            <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>AI Exposure</span>
          </Link>

          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/jobs"
                  ? pathname === "/jobs"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? isDark
                        ? "bg-white/15 text-white"
                        : "bg-blue-50 text-blue-700"
                      : isDark
                        ? "text-gray-400 hover:text-white hover:bg-white/10"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <button
              onClick={toggleTheme}
              className={`ml-2 p-1.5 rounded-md transition-colors ${
                isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"
              }`}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
