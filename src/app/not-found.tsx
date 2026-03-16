import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-navy-900 mb-4">404</h1>
        <p className="text-lg text-gray-500 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-navy-900 rounded-full hover:bg-navy-800 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
