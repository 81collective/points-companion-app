import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pointadvisor.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/analytics/',
          '/admin/',
          '/_next/',
          '/private/',
          '*.json',
          '/auth/'
        ]
      },
      {
        userAgent: 'GPTBot',
        disallow: '/'
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/'
      },
      {
        userAgent: 'CCBot',
        disallow: '/'
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/'
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
