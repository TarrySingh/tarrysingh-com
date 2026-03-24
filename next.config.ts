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
};

export default nextConfig;
