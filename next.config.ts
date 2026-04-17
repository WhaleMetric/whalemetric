import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [],
    };
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
        has: [{ type: "host", value: "app.whalemetric.com" }],
      },
      {
        source: "/fuentes",
        destination: "/admin/fuentes",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
