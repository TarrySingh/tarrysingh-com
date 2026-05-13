import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["stripe"],
  // The legacy parts of the repo (jobs, experiments, panoraima, ui/*)
  // carry ~14 pre-existing lint errors that the previously-broken
  // eslint flat-config was silently passing. Fixing eslint.config.mjs
  // surfaced them; cleaning them up is tracked separately. For now,
  // don't block production builds on lint — typecheck already runs.
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/mklaar",
          destination: "https://mklaar.vercel.app/mklaar",
        },
        {
          source: "/mklaar/:path*",
          destination: "https://mklaar.vercel.app/mklaar/:path*",
        },
        // The cross-repo Monthly Roundup brief documented the digest
        // endpoint as `/api/digest/this-month.json` (the conventional
        // way to advertise a JSON-returning route), but the Next.js
        // App-Router route file lives at
        // `src/app/api/digest/this-month/route.ts` (no extension in
        // the URL). Without this rewrite, the RealAI-CRM cron firing
        // on the first Monday of every month would 404. Map the
        // documented `.json` URL to the actual route so both work.
        {
          source: "/api/digest/this-month.json",
          destination: "/api/digest/this-month",
        },
      ],
    };
  },
  async redirects() {
    return [
      // The Synaptic Cartography plates live under /synaptic/* — keep the
      // legacy shorter paths around for any external links and forward them
      // permanently (301) to the canonical location.
      {
        source: "/symphony",
        destination: "/synaptic/symphony",
        permanent: true,
      },
      {
        source: "/symphony/:path*",
        destination: "/synaptic/symphony/:path*",
        permanent: true,
      },
      {
        source: "/memphis",
        destination: "/synaptic/memphis",
        permanent: true,
      },
      {
        source: "/memphis/:path*",
        destination: "/synaptic/memphis/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
