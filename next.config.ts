import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prefer fast production cold loads for Try Live / desktop always-on.
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
