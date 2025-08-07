import { MetadataRoute } from 'next';
import { generateSitemapUrls } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return generateSitemapUrls();
}
