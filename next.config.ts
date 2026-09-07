import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/film/:path*',
        destination: '/filmek/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;