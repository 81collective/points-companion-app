// SEO and Performance Optimization Components
// Implements comprehensive SEO enhancements and performance monitoring

import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  noindex?: boolean;
  canonical?: string;
}

export const SEOHead: React.FC<SEOProps> = ({
  title = 'Points Companion - Maximize Your Credit Card Rewards',
  description = 'Discover the best credit card rewards and bonuses for dining, travel, and shopping. Compare cards, find nearby businesses, and maximize your rewards with our intelligent recommendations.',
  keywords = ['credit cards', 'rewards', 'bonuses', 'cashback', 'travel rewards', 'dining rewards'],
  image = '/og-image.jpg',
  url,
  type = 'website',
  structuredData,
  noindex = false,
  canonical,
}) => {
  const router = useRouter();
  const currentUrl = url || `https://pointscompanion.app${router.asPath}`;
  const fullTitle = title.includes('Points Companion') ? title : `${title} | Points Companion`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content="Points Companion" />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />

      {/* Canonical URL */}
      <link rel="canonical" href={canonical || currentUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image.startsWith('http') ? image : `https://pointscompanion.app${image}`} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Points Companion" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `https://pointscompanion.app${image}`} />
      <meta name="twitter:site" content="@pointscompanion" />
      <meta name="twitter:creator" content="@pointscompanion" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Points Companion" />

      {/* Performance and Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://maps.googleapis.com" />
      <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="anonymous" />

      {/* DNS prefetch for critical resources */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//www.googletagmanager.com" />

      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
};

// Structured Data Components
type BusinessStructuredDataInput = {
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
};

export const createBusinessStructuredData = (business: BusinessStructuredDataInput) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: business.name,
  description: business.description,
  address: {
    '@type': 'PostalAddress',
    streetAddress: business.address,
    addressLocality: business.city,
    addressRegion: business.state,
    postalCode: business.zipCode,
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: business.latitude,
    longitude: business.longitude,
  },
  telephone: business.phone,
  url: business.website,
  aggregateRating: business.rating ? {
    '@type': 'AggregateRating',
    ratingValue: business.rating,
    reviewCount: business.reviewCount,
  } : undefined,
  priceRange: business.priceLevel ? '$'.repeat(business.priceLevel) : undefined,
});

type CreditCardStructuredDataInput = {
  name: string;
  description?: string;
  issuer: string;
  annualFee?: number | string;
  signupBonus?: string;
  features?: string[];
};

export const createCreditCardStructuredData = (card: CreditCardStructuredDataInput) => ({
  '@context': 'https://schema.org',
  '@type': 'FinancialProduct',
  name: card.name,
  description: card.description,
  provider: {
    '@type': 'Organization',
    name: card.issuer,
  },
  offers: {
    '@type': 'Offer',
    price: card.annualFee,
    priceCurrency: 'USD',
    description: card.signupBonus,
  },
  additionalProperty: card.features?.map((feature) => ({
    '@type': 'PropertyValue',
    name: 'Feature',
    value: feature,
  })),
});

export const createBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: breadcrumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.name,
    item: `https://pointscompanion.app${crumb.url}`,
  })),
});

// Performance Monitoring Component
interface PerformanceMonitorProps {
  onPerformanceData?: (data: PerformanceData) => void;
  enableWebVitals?: boolean;
}

interface PerformanceData {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  onPerformanceData,
  enableWebVitals = true,
}) => {
  useEffect(() => {
    if (!enableWebVitals || typeof window === 'undefined') return;

    const performanceData: PerformanceData = {
      fcp: null,
      lcp: null,
      fid: null,
      cls: null,
      ttfb: null,
    };

    // Measure Time to First Byte
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      performanceData.ttfb = navigation.responseStart - navigation.requestStart;
    }

    // Web Vitals measurements
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        switch (entry.entryType) {
          case 'paint':
            {
              const paint = entry as PerformancePaintTiming;
              if (paint.name === 'first-contentful-paint') {
                performanceData.fcp = paint.startTime;
              }
            }
            break;
          case 'largest-contentful-paint':
            {
              const lcpEntry = entry as LargestContentfulPaint;
              performanceData.lcp = lcpEntry.startTime;
            }
            break;
          case 'first-input':
            {
              const fi = entry as PerformanceEventTiming;
              performanceData.fid = fi.processingStart - fi.startTime;
            }
            break;
          case 'layout-shift':
            {
              const ls = entry as LayoutShift;
              if (!ls.hadRecentInput) {
                performanceData.cls = (performanceData.cls || 0) + ls.value;
              }
            }
            break;
        }
      }

      if (onPerformanceData) {
        onPerformanceData(performanceData);
      }
    });

    try {
      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (error) {
      console.warn('Performance monitoring not fully supported:', error);
    }

    return () => observer.disconnect();
  }, [onPerformanceData, enableWebVitals]);

  return null;
};

// Critical CSS and Resource Hints
export const ResourceHints: React.FC = () => (
  <Head>
    {/* Preload critical resources */}
    <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    <link rel="preload" href="/api/graphql" as="fetch" crossOrigin="anonymous" />

    {/* Prefetch likely next pages */}
    <link rel="prefetch" href="/businesses" />
    <link rel="prefetch" href="/cards" />
    <link rel="prefetch" href="/rewards" />

    {/* Preload critical CSS */}
    <link rel="preload" href="/styles/critical.css" as="style" />

    {/* Module preload for critical JS */}
    <link rel="modulepreload" href="/_next/static/chunks/main.js" />
    <link rel="modulepreload" href="/_next/static/chunks/webpack.js" />
  </Head>
);

// Sitemap generation utility
export const generateSitemap = (pages: Array<{ url: string; lastmod?: string; changefreq?: string; priority?: number }>) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>https://pointscompanion.app${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    ${page.changefreq ? `<changefreq>${page.changefreq}</changefreq>` : ''}
    ${page.priority ? `<priority>${page.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

// Robots.txt generation utility
export const generateRobotsTxt = (disallowedPaths: string[] = []) => {
  const robots = `User-agent: *
${disallowedPaths.map(path => `Disallow: ${path}`).join('\n')}

Sitemap: https://pointscompanion.app/sitemap.xml`;

  return robots;
};

// Web App Manifest for PWA
export const generateWebAppManifest = () => ({
  name: 'Points Companion',
  short_name: 'Points',
  description: 'Maximize your credit card rewards with intelligent recommendations',
  start_url: '/',
  display: 'standalone',
  background_color: '#ffffff',
  theme_color: '#3B82F6',
  icons: [
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
    },
  ],
  categories: ['finance', 'lifestyle', 'productivity'],
  lang: 'en-US',
  dir: 'ltr',
});
