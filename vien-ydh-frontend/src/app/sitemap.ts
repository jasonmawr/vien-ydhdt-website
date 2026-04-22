import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vienydhdt.gov.vn';

  // Core static routes
  const routes = [
    '',
    '/gioi-thieu',
    '/dat-lich',
    '/tra-cuu',
    '/bang-gia',
    '/duoc-lieu',
    '/tin-tuc',
    '/lien-he'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // You can also fetch dynamic routes here (e.g. from /api/cms/posts)
  // For now, we return the static routes
  return routes;
}
