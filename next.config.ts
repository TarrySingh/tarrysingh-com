import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["stripe"],
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
