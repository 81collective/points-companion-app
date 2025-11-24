// Performance-optimized Next.js configuration
import type { NextConfig } from 'next';

// Ensure NEXTAUTH_URL is a sensible value to avoid build-time errors
// when the environment variable is set to an empty string in CI/local env.
const normalizedSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000').toString();
if (!process.env.NEXTAUTH_URL || String(process.env.NEXTAUTH_URL).trim() === '') {
  process.env.NEXTAUTH_URL = normalizedSiteUrl;
}
if (!process.env.NEXTAUTH_URL_INTERNAL || String(process.env.NEXTAUTH_URL_INTERNAL).trim() === '') {
  process.env.NEXTAUTH_URL_INTERNAL = process.env.NEXTAUTH_URL;
}
import {
  imageConfig,
  compressionConfig,
  securityHeaders,
  performanceConfig,
  redirectConfig,
  cacheHeaders,
  experimentalConfig
} from './src/lib/performance-config';

const nextConfig: NextConfig = {
  // Performance optimizations
  ...performanceConfig,

  // ESLint: enforce during builds
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },

  // TypeScript: Skip type checking during build (handled by pre-commit hooks)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Image optimization
  images: imageConfig,

  // Compression and optimization
  ...compressionConfig,

  // Bundle optimization
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        // Separate vendor chunks for better caching
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        // Separate large libraries
        heavyLibs: {
          test: /[\\/]node_modules[\\/](recharts|framer-motion|@supabase|openai)[\\/]/,
          name: 'heavy-libs',
          chunks: 'all',
          priority: 20,
        },
      };
    }
    return config;
  },

  // Security and SEO headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      ...cacheHeaders,
    ];
  },

  // SEO redirects
  async redirects() {
    return redirectConfig;
  },

  // Experimental features
  experimental: experimentalConfig,

  // Environment-specific optimizations
  ...(process.env.NODE_ENV === 'production' && {
    output: 'standalone',
    poweredByHeader: false,
    generateEtags: false,
  }),
};

export default nextConfig;
