import type { NextConfig } from "next";

const publicApiUrl = process.env.NEXT_PUBLIC_API_URL;
const backendApiUrl = process.env.BACKEND_API_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  reactCompiler: true,

  async rewrites() {
    const usesRelativeApiProxy = publicApiUrl?.startsWith("/");

    if (!usesRelativeApiProxy) {
      return [];
    }

    if (!backendApiUrl) {
      throw new Error(
        "BACKEND_API_URL is required when NEXT_PUBLIC_API_URL uses a relative path like /api.",
      );
    }

    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
