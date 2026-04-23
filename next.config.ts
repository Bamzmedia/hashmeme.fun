import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    'ox', 
    'wagmi', 
    '@wagmi/core',
    '@wagmi/connectors',
    'viem', 
    '@reown/appkit', 
    '@reown/appkit-adapter-wagmi',
    '@reown/appkit-common',
    '@reown/appkit-core',
    '@reown/appkit-ui'
  ],
};

export default nextConfig;
