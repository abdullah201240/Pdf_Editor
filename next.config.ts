import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  webpack: (config, { isServer }) => {
    // Fix for react-pdf
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    // Handle PDF.js worker
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
    };
    
    return config;
  },
};

export default nextConfig;
