import type { NextConfig } from "next";

let backendUrl =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://ai-marketplace-mr1h.onrender.com";

// Ensure destination is a valid URL starting with http:// or https:// even if redacted during build
if (!backendUrl.startsWith("http://") && !backendUrl.startsWith("https://")) {
  backendUrl = "https://ai-marketplace-mr1h.onrender.com";
}

// Strip trailing slash if present
backendUrl = backendUrl.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  reactCompiler: true,
};

export default nextConfig;
