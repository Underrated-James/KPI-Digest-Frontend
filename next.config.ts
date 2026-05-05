import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  async rewrites() {
    console.log(process.env.BACKEND_);
    return [
      {
        source: "/api/:path*",
        //destination: "http://agile-digest-api-standalone:3001/:path*",
        destination: "http://localhost:3001/:path*",
      },
    ];
  },
};

export default nextConfig;
