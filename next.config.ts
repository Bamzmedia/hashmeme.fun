import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
            crypto: false,
            stream: false,
            http: false,
            https: false,
            zlib: false,
            path: false,
        };
    }
    
    // Add specific support for 'ox' and other modern ESM packages that use subpath exports
    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
      ],
    };

    return config;
  },
  // Ensure transpile for modern ESM packages that might use problematic syntax for some environments
  transpilePackages: ['ox', 'wagmi', 'viem', '@reown/appkit', '@reown/appkit-adapter-wagmi'],
};

export default nextConfig;
