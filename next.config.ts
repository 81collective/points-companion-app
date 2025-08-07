// Performance-optimized Next.js configuration
import type { NextConfig } from 'next';
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
  
  // Image optimization
  images: imageConfig,
  
  // Compression and optimization
  ...compressionConfig,
  
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
