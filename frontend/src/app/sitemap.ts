import type { MetadataRoute } from 'next';
import { getSiteBaseUrl } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteBaseUrl();
  const routes = ['/', '/admin', '/requests', '/facilities', '/analytics', '/ticket/new'];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/ticket/new' ? 'weekly' : 'daily',
    priority: route === '/admin' ? 1 : 0.8,
  }));
}
