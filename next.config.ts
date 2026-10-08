import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // This repository only contains the About Us page.
      { source: "/", destination: "/about-us", permanent: false },
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/our-story", destination: "/about-us", permanent: true },
    ];
  },
};

export default nextConfig;
