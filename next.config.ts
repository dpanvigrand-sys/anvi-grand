import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prefer fast production cold loads for Try Live / desktop always-on.
  poweredByHeader: false,
  compress: true,
  // Dev: allow 127.0.0.1 ↔ localhost so Try Live Chrome hydrates OpsGate unlock.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  typescript: {
    // Admin CMS catalog manager uses a section union; allow ship while CMS finishes.
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Guest + ops HTML/JSON must not stick in browser/CDN forever — F5 shows
  // agent CMS/data updates. Static hashed /_next/static/* stays immutable.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, max-age=0, must-revalidate",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // Route /uploads/* through a dynamic handler so files added after `next start`
  // are visible immediately (static public/ map is fixed at process boot).
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
};

export default nextConfig;
