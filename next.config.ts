import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable rewrites for subdomain routing
  async rewrites() {
    return {
      beforeFiles: [
        // In production, subdomains are handled by middleware
        // This is a fallback for local dev with host header simulation
      ],
    };
  },

  // Environment-based API URL
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },

  // Turbopack config
  turbopack: {},
};

export default nextConfig;
