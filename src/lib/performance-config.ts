// Performance and SEO optimization configuration

// Bundle analyzer configuration
export const bundleAnalyzerConfig = {
  enabled: process.env.ANALYZE === 'true',
  bundleAnalyzerConfig: {
    server: {
      analyzerMode: 'server',
      analyzerPort: 8888,
    },
    client: {
      analyzerMode: 'static',
      reportFilename: '../bundles/client.html',
    },
  },
};

// Image optimization configuration
export const imageConfig = {
  domains: [
    'images.unsplash.com',
    'via.placeholder.com', 
    'creditcards.com',
    'cdn.creditcards.com',
    'storage.googleapis.com',
    'supabase.com'
  ],
  formats: ['image/webp' as const, 'image/avif' as const],
  minimumCacheTTL: 86400, // 24 hours
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
};

// Compression configuration
export const compressionConfig = {
  compress: true,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'framer-motion'
    ],
  },
};

// SEO headers configuration
export const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://maps.googleapis.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https://js.stripe.com",
    ].join('; ')
  }
];

// Performance monitoring configuration
export const performanceConfig = {
  webVitalsAttribution: true,
  optimizeFonts: true,
  optimizeImages: true,
  swcMinify: true,
  reactStrictMode: true,
};

// Redirect configuration for SEO
export const redirectConfig = [
  {
    source: '/home',
    destination: '/',
    permanent: true,
  },
  {
    source: '/login',
    destination: '/auth/signin',
    permanent: true,
  },
  {
    source: '/signup',
    destination: '/auth/signup',
    permanent: true,
  },
];

// Rewrite configuration
export const rewriteConfig = [
  {
    source: '/api/:path*',
    destination: '/api/:path*',
  },
];

// Cache headers for static assets
export const cacheHeaders = [
  {
    source: '/icons/:all*(svg|jpg|png)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  },
  {
    source: '/images/:all*(svg|jpg|png|webp|avif)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  },
  {
    source: '/_next/static/:all*',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  },
];

// Experimental features for performance
export const experimentalConfig = {
  optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
};
