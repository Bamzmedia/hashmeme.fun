import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false, // In many cases, crypto-browserify is needed, but for now we fallback to false
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
