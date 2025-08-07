import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', '@tabler/icons-react'],
  },
};

export default nextConfig;
