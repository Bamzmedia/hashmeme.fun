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
        
        // Ensure Webpack can resolve exports from modern ESM packages
        config.resolve.extensionAlias = {
          '.js': ['.js', '.ts', '.tsx'],
        };
    }
    
    // Some build environments need this to correctly resolve subpath imports in modern ESM packages
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
};

export default nextConfig;
