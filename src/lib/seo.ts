// SEO optimization utilities
import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
}

// Generate comprehensive metadata
export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    canonical,
    ogImage = '/images/og-default.jpg',
    noIndex = false
  } = config;

  const metadata: Metadata = {
    title: {
      default: title,
  template: '%s | PointAdvisor'
    },
    description,
    keywords: keywords.join(', '),
  authors: [{ name: 'PointAdvisor Team' }],
  creator: 'PointAdvisor',
  publisher: 'PointAdvisor',
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      title,
      description,
  siteName: 'PointAdvisor',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
  creator: '@pointadvisor'
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_SITE_VERIFICATION
    },
    alternates: {
  canonical: canonical ? `https://pointadvisor.app${canonical}` : undefined
    }
  };

  return metadata;
}

// Structured data generators
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
  name: 'PointAdvisor',
  url: 'https://pointadvisor.app',
  logo: 'https://pointadvisor.app/images/logo.png',
    description: 'Optimize your credit card rewards and maximize points earning potential',
    sameAs: [
  'https://twitter.com/pointadvisor',
  'https://facebook.com/pointadvisor'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
  email: 'support@pointadvisor.app'
    }
  };
}

export function generateWebAppSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
  name: 'PointAdvisor',
    description: 'Credit card rewards optimization platform',
  url: 'https://pointadvisor.app',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    author: {
      '@type': 'Organization',
  name: 'PointAdvisor Team'
    }
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
  item: `https://pointadvisor.app${item.url}`
    }))
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// Page-specific SEO configurations
export const seoConfigs = {
  home: {
    title: 'PointAdvisor - Optimize Your Credit Card Rewards',
    description: 'Maximize your credit card points and rewards with AI-powered recommendations. Track spending, optimize card usage, and never miss earning opportunities.',
    keywords: ['credit card rewards', 'points optimization', 'travel rewards', 'cashback', 'credit card recommendations'],
    canonical: '/'
  },
  dashboard: {
    title: 'Dashboard - PointAdvisor',
    description: 'View your credit card portfolio, track rewards, and get personalized recommendations to maximize your points earning.',
    keywords: ['rewards dashboard', 'credit card portfolio', 'points tracking'],
    canonical: '/dashboard',
    noIndex: true // Private user data
  },
  cards: {
    title: 'Credit Cards - PointAdvisor',
    description: 'Explore our comprehensive database of credit cards with detailed rewards information and expert recommendations.',
    keywords: ['credit cards', 'card database', 'card comparison', 'rewards cards'],
    canonical: '/cards'
  },
  analytics: {
    title: 'Analytics - PointAdvisor',
    description: 'Analyze your spending patterns and rewards earning with detailed insights and performance metrics.',
    keywords: ['spending analytics', 'rewards analysis', 'financial insights'],
    canonical: '/analytics',
    noIndex: true // Private user data
  },
  recommendations: {
    title: 'AI Recommendations - PointAdvisor',
    description: 'Get AI-powered credit card recommendations based on your spending patterns and financial goals.',
    keywords: ['AI recommendations', 'smart card suggestions', 'personalized advice'],
    canonical: '/recommendations'
  }
};

// Generate sitemap data
export function generateSitemapUrls() {
  const baseUrl = 'https://pointadvisor.app';
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/cards', changefreq: 'weekly', priority: 0.8 },
    { url: '/about', changefreq: 'monthly', priority: 0.6 },
    { url: '/privacy', changefreq: 'monthly', priority: 0.5 },
    { url: '/terms', changefreq: 'monthly', priority: 0.5 }
  ];

  return staticPages.map(page => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: page.changefreq as 'daily' | 'weekly' | 'monthly',
    priority: page.priority
  }));
}
